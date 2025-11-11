import request from 'supertest';
import app from '../../infrastructure/server/server.js'; 
import prisma from '../../infrastructure/db/prisma.client.js';

// We run tests against the real app and database

describe('Routes API', () => {

  // Clean up the database before each test
  beforeEach(async () => {
    // Reset the baseline
    await prisma.route.updateMany({ data: { isBaseline: false } });
    await prisma.route.update({
      where: { routeId: 'R001' },
      data: { isBaseline: true }, // R001 is the baseline
    });
  });

  it('GET /api/routes - should return all routes', async () => {
    const res = await request(app).get('/api/routes');

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(5); // We seeded 5 routes
    expect(res.body[0].routeId).toBe('R003');
  });

  it('GET /api/routes/comparison - should return comparison data', async () => {
    const res = await request(app).get('/api/routes/comparison');

    expect(res.statusCode).toBe(200);
    expect(res.body.baseline.routeId).toBe('R001');
    expect(res.body.comparisonRoutes.length).toBe(4); // 4 routes to compare
    expect(res.body.comparisonRoutes[0].percentDiff).toBeDefined();
  });

  it('POST /api/routes/R002/baseline - should set a new baseline', async () => {
    // Act: Set R002 as the new baseline
    const res = await request(app).post('/api/routes/R002/baseline');
    expect(res.statusCode).toBe(204);

    // Assert: Check if it worked
    const baseline = await prisma.route.findFirst({ where: { isBaseline: true } });
    const oldBaseline = await prisma.route.findFirst({ where: { routeId: 'R001' } });

    expect(baseline?.routeId).toBe('R002');
    expect(oldBaseline?.isBaseline).toBe(false);
  });
});