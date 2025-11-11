// backend/src/core/ports/usecase.ports.ts
import type { ComparisonData, Route, ComplianceBalance } from '../domain/entities.js';
import type { PoolResult, PoolMemberInput } from '../domain/entities.js';

export interface IGetRoutesUseCase {
  execute(): Promise<Route[]>;
}

export interface ISetBaselineUseCase {
  execute(routeId: string): Promise<void>;
}

export interface IGetComparisonUseCase {
  execute(): Promise<ComparisonData>;
}

export interface IComputeCBUseCase {
  execute(shipId: string, year: number): Promise<ComplianceBalance>;
}

export interface IGetAdjustedCBUseCase {
  execute(shipId: string, year: number): Promise<{ baseCB: number, totalBanked: number, adjustedCB: number }>;
}

export interface IGetBankedRecordsUseCase {
  execute(shipId: string, year: number): Promise<{ amountGco2eq: number }[]>;
}

export interface IBankSurplusUseCase {
  execute(shipId: string, year: number): Promise<void>;
}

export interface IApplyBankedUseCase {
  execute(shipId: string, amount: number): Promise<void>;
}

export interface ICreatePoolUseCase {
  execute(year: number, members: PoolMemberInput[]): Promise<PoolResult>;
}