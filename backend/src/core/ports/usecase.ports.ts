// backend/src/core/ports/usecase.ports.ts
import type { ComparisonData, Route } from '../domain/entities.js';

export interface IGetRoutesUseCase {
  execute(): Promise<Route[]>;
}

export interface ISetBaselineUseCase {
  execute(routeId: string): Promise<void>;
}

export interface IGetComparisonUseCase {
  execute(): Promise<ComparisonData>;
}