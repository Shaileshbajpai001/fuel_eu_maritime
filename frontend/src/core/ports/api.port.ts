// frontend/src/core/ports/api.port.ts
import type { ComparisonData, Route } from '../domain/types';

export interface IApiClient {
  // Routes Tab
  getRoutes(): Promise<Route[]>;
  setBaseline(routeId: string): Promise<void>;

  // Compare Tab
  getComparison(): Promise<ComparisonData>;

  // ... We will add more methods here ...
}