import type { IPoolRepository } from '../../../core/ports/repository.ports.js';
import type { PoolResult, PoolMemberInput } from '../../../core/domain/entities.js';
import prisma from '../../../infrastructure/db/prisma.client.js';

export class PrismaPoolRepository implements IPoolRepository {

  async createPool(
    year: number,
    members: (PoolMemberInput & { cbAfter: number })[]
  ): Promise<PoolResult> {

    const createdPool = await prisma.pool.create({
      data: {
        year: year,
        members: {
          create: members.map(m => ({
            shipId: m.shipId,
            cbBefore: m.cbBefore,
            cbAfter: m.cbAfter,
          })),
        },
      },
      include: {
        members: true, // Include the created members in the response
      },
    });

    // Calculate totals for the response
    const totalCbBefore = members.reduce((sum, m) => sum + m.cbBefore, 0);
    const totalCbAfter = members.reduce((sum, m) => sum + m.cbAfter, 0);

    return {
      id: createdPool.id,
      year: createdPool.year,
      members: createdPool.members,
      totalCbBefore,
      totalCbAfter,
    };
  }
}

