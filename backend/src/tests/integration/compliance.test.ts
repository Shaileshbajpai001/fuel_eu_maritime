import request from 'supertest';
import app from '../../infrastructure/server/server.js';
import  prisma from '../../infrastructure/db/prisma.client.js';

describe('Compliance & Banking API', () => {

  // Clean all compliance and banking tables before each test
  beforeEach(async () => {
    await prisma.bankEntry.deleteMany();
    await prisma.shipCompliance.deleteMany();
  });

  // Clean up after all tests
  afterAll(async () => {
    await prisma.bankEntry.deleteMany();
    await prisma.shipCompliance.deleteMany();
  });

  it('GET /api/compliance/cb - should compute and save a surplus', async () => {
    // R002 (shipId) in 2024 has a surplus
    const res = await request(app).get('/api/compliance/cb?shipId=R002&year=2024');

    expect(res.statusCode).toBe(200);
    expect(res.body.shipId).toBe('R002');
    expect(res.body.year).toBe(2024);
    expect(res.body.cbGco2eq).toBe(621888000); // The surplus we calculated in unit tests

    // Check if it was saved
    const dbEntry = await prisma.shipCompliance.findFirst();
    expect(dbEntry?.cbGco2eq).toBe(621888000);
  });

  it('GET /api/compliance/cb - should compute and save a deficit', async () => {
    // R003 (shipId) in 2024 has a deficit
    const res = await request(app).get('/api/compliance/cb?shipId=R003&year=2024');

    expect(res.statusCode).toBe(200);
    expect(res.body.shipId).toBe('R003');
    expect(res.body.cbGco2eq).toBe(-489294000); // The deficit
  });

  describe('Banking Workflow', () => {

    let surplusAmount: number;

    // First, compute and get the surplus amount
    beforeEach(async () => {
      const res = await request(app).get('/api/compliance/cb?shipId=R002&year=2024');
      surplusAmount = res.body.cbGco2eq; // 621,888,000
    });

    it('POST /api/banking/bank - should bank a surplus', async () => {
      const res = await request(app)
        .post('/api/banking/bank')
        .send({ shipId: 'R002', year: 2024 });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe('Surplus successfully banked.');

      // Check bank entry
      const bankEntry = await prisma.bankEntry.findFirst();
      expect(bankEntry?.amountGco2eq).toBe(surplusAmount);
    });

    it('POST /api/banking/bank - should fail to bank a deficit', async () => {
      // Compute deficit for R003 first
      await request(app).get('/api/compliance/cb?shipId=R003&year=2024');

      const res = await request(app)
        .post('/api/banking/bank')
        .send({ shipId: 'R003', year: 2024 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('No surplus to bank. Compliance balance is zero or negative.');
    });

    it('POST /api/banking/apply - should apply (withdraw) a banked amount', async () => {
      // 1. Bank the surplus
      await request(app).post('/api/banking/bank').send({ shipId: 'R002', year: 2024 });

      // 2. Apply (withdraw) 1,000,000
      const amountToApply = 1000000;
      const res = await request(app)
        .post('/api/banking/apply')
        .send({ shipId: 'R002', amount: amountToApply });

      expect(res.statusCode).toBe(201);

      // Check the bank entries
      const entries = await prisma.bankEntry.findMany({ where: { shipId: 'R002' }});
      expect(entries).toHaveLength(2);
      expect((entries[0] as any).amountGco2eq).toBe(surplusAmount);
      expect((entries[1] as any).amountGco2eq).toBe(-amountToApply); // The withdrawal
    });

    it('POST /api/banking/apply - should fail if applying too much', async () => {
      // 1. Bank the surplus
      await request(app).post('/api/banking/bank').send({ shipId: 'R002', year: 2024 });

      // 2. Try to apply more than we have
      const res = await request(app)
        .post('/api/banking/apply')
        .send({ shipId: 'R002', amount: surplusAmount + 1 });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('Cannot apply');
    });

    it('GET /api/compliance/adjusted-cb - should return the correct adjusted balance', async () => {
        // This ship has a base CB of 621,888,000
        // We will bank it, then withdraw 1,000,000
        // The total in the bank will be 620,888,000
        // The adjustedCB should be base (621,888,000) + bank (620,888,000)

        // 1. Compute
        await request(app).get('/api/compliance/cb?shipId=R002&year=2024');
        // 2. Bank
        await request(app).post('/api/banking/bank').send({ shipId: 'R002', year: 2024 });
        // 3. Apply (withdraw)
        await request(app).post('/api/banking/apply').send({ shipId: 'R002', amount: 1000000 });

        // 4. Get adjusted
        const res = await request(app).get('/api/compliance/adjusted-cb?shipId=R002&year=2024');

        expect(res.statusCode).toBe(200);
        expect(res.body.baseCB).toBe(621888000);
        expect(res.body.totalBanked).toBe(621888000 - 1000000);
        expect(res.body.adjustedCB).toBe(621888000 + (621888000 - 1000000));
    });
  });
});