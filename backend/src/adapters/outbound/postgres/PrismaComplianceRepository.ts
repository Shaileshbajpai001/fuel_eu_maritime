import type { IComplianceRepository } from '../../../core/ports/repository.ports.js';
import type { ComplianceBalance } from '../../../core/domain/entities.js';
import prisma from '../../../infrastructure/db/prisma.client.js';

export class PrismaComplianceRepository implements IComplianceRepository {

  async findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null> {
    return prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } },
    });
  }

  async saveCB(cb: ComplianceBalance): Promise<ComplianceBalance> {
    const { shipId, year, cbGco2eq } = cb;
    return prisma.shipCompliance.upsert({
      where: { shipId_year: { shipId, year } },
      update: { cbGco2eq },
      create: { shipId, year, cbGco2eq },
    });
  }

  async addBankEntry(entry: { shipId: string; year: number; amountGco2eq: number; }): Promise<void> {
    await prisma.bankEntry.create({
      data: entry,
    });
  }

  async getBankEntries(shipId: string, year: number): Promise<{ amountGco2eq: number }[]> {
    return prisma.bankEntry.findMany({
      where: { shipId, year },
      select: { amountGco2eq: true },
    });
  }

  async getTotalBanked(shipId: string): Promise<number> {
    const result = await prisma.bankEntry.aggregate({
      where: { shipId },
      _sum: {
        amountGco2eq: true,
      },
    });
    return result._sum.amountGco2eq || 0;
  }
}