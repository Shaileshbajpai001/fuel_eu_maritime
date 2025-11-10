// backend/src/core/ports/repository.ports.ts
import type { Route, ComplianceBalance } from '../domain/entities.js';

export interface IRouteRepository {
  getAll(): Promise<Route[]>;
  findBaseline(): Promise<Route | null>;
  setAsBaseline(routeId: string): Promise<void>;
}

export interface IComplianceRepository {
  save(cb: ComplianceBalance): Promise<ComplianceBalance>;
  findByShipAndYear(shipId: string, year: number): Promise<ComplianceBalance | null>;
  // We will add more as we build (e.g., for banking)
}

export interface IPoolRepository {
  // We will define this when we build the pooling feature
}

// ... other repositories like IBankingRepository