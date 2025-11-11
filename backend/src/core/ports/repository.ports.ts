// backend/src/core/ports/repository.ports.ts
import type { Route, ComplianceBalance } from '../domain/entities.js';
import type { PoolResult, PoolMemberInput } from '../domain/entities.js';

export interface IRouteRepository {
  getAll(): Promise<Route[]>;
  findBaseline(): Promise<Route | null>;
  setAsBaseline(routeId: string): Promise<void>;
  findByRouteIdAndYear(routeId: string, year: number): Promise<Route | null>;               // corrected function in core/application/RouteUseCases.test.ts
}

export interface IComplianceRepository {
  saveCB(cb: ComplianceBalance): Promise<ComplianceBalance>;
  findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;

  // Methods for banking
  addBankEntry(entry: { shipId: string, year: number, amountGco2eq: number }): Promise<void>;
  getBankEntries(shipId: string, year: number): Promise<{ amountGco2eq: number }[]>;
  getTotalBanked(shipId: string): Promise<number>;
}

//ipoolrepo is now generating
export interface IPoolRepository {
  createPool(
    year: number,
    members: (PoolMemberInput & { cbAfter: number })[]
  ): Promise<PoolResult>;
}

// ... other repositories like IBankingRepository