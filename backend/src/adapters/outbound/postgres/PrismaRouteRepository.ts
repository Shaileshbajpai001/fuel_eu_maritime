import type { IRouteRepository } from '../../../core/ports/repository.ports.js';
import type { Route } from '../../../core/domain/entities.js';
import  prisma from '../../../infrastructure/db/prisma.client.js';

// This class implements the IRouteRepository port.
// It uses Prisma to interact with the database.
export class PrismaRouteRepository implements IRouteRepository {

  // ... inside class PrismaRouteRepository

 async findByRouteIdAndYear(routeId: string, year: number): Promise<Route | null> {
  return prisma.route.findFirst({
    where: { routeId, year },
  });
  }  

  async getAll(): Promise<Route[]> {
    return prisma.route.findMany();
  }

  async findBaseline(): Promise<Route | null> {
    return prisma.route.findFirst({
      where: { isBaseline: true },
    });
  }

  async setAsBaseline(routeId: string): Promise<void> {
    // This is a transaction. It ensures both database actions happen or neither do.
    await prisma.$transaction(async (tx) => {
      // 1. Set all other routes to isBaseline: false
      await tx.route.updateMany({
        where: { isBaseline: true },
        data: { isBaseline: false },
      });

      // 2. Set the specified route to isBaseline: true
      await tx.route.update({
        where: { routeId: routeId },
        data: { isBaseline: true },
      });
    });
  }
}