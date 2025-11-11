import request from 'supertest';
import app from '../../infrastructure/server/server.js';
import prisma from '../../infrastructure/db/prisma.client.js';
import type { PoolMemberInput } from '../../core/domain/entities.js';

describe('Pooling API', () => {

  // Clean pool tables before each test
  beforeEach(async () => {
    // Need to delete members first due to foreign key constraint
    await prisma.poolMember.deleteMany();
    await prisma.pool.deleteMany();
  });

  afterAll(async () => {
    await prisma.poolMember.deleteMany();
    await prisma.pool.deleteMany();
  });

  it('POST /api/pools - should create a valid pool', async () => {
    const members: PoolMemberInput[] = [
      { shipId: 'SurplusShip', cbBefore: 1000 },
      { shipId: 'DeficitShip', cbBefore: -500 },
    ];

    const res = await request(app)
      .post('/api/pools')
      .send({ year: 2024, members: members });

    // Check HTTP Response
    expect(res.statusCode).toBe(201);
    expect(res.body.totalCbBefore).toBe(500);
    expect(res.body.totalCbAfter).toBe(500);
    expect(res.body.members).toHaveLength(2);

    const deficitShip = res.body.members.find((m: any) => m.shipId === 'DeficitShip');
    expect(deficitShip.cbAfter).toBe(0); // Deficit was covered

    // Check Database
    const dbPool = await prisma.pool.findFirst();
    expect(dbPool?.year).toBe(2024);
    const dbMembers = await prisma.poolMember.findMany();
    expect(dbMembers).toHaveLength(2);
  });

  it('POST /api/pools - should fail if pool sum is negative', async () => {
    const members: PoolMemberInput[] = [
      { shipId: 'SurplusShip', cbBefore: 100 },
      { shipId: 'DeficitShip', cbBefore: -500 },
    ]; // Total -400

    const res = await request(app)
      .post('/api/pools')
      .send({ year: 2024, members: members });

    // Check HTTP Response
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('total compliance balance is -400');

    // Check Database
    const dbPool = await prisma.pool.findFirst();
    expect(dbPool).toBeNull();
  });

  it('POST /api/pools - should fail with bad input', async () => {
    const res = await request(app)
      .post('/api/pools')
      .send({ year: 2024 }); // Missing 'members'

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Missing required fields');
  });
});