import type { ComparisonData, Route } from '../domain/entities.js';
import type { IRouteRepository } from '../ports/repository.ports.js';
import type { 
  IGetComparisonUseCase, 
  IGetRoutesUseCase, 
  ISetBaselineUseCase 
} from '../ports/usecase.ports.js';

// --- Use Case 1: Get All Routes ---
export class GetRoutesUseCase implements IGetRoutesUseCase {
  // It depends on the port, not the implementation
  constructor(private routeRepository: IRouteRepository) {}

  async execute(): Promise<Route[]> {
    return this.routeRepository.getAll();
  }
}

// --- Use Case 2: Set Baseline ---
export class SetBaselineUseCase implements ISetBaselineUseCase {
  constructor(private routeRepository: IRouteRepository) {}

  async execute(routeId: string): Promise<void> {
    return this.routeRepository.setAsBaseline(routeId);
  }
}

// --- Use Case 3: Get Comparison ---
export class GetComparisonUseCase implements IGetComparisonUseCase {
  // The FuelEU Maritime target for 2025
  private readonly TARGET_INTENSITY = 89.3368; // 91.16 * (1 - 0.02)

  constructor(private routeRepository: IRouteRepository) {}

  async execute(): Promise<ComparisonData> {
    const [baseline, allRoutes] = await Promise.all([
      this.routeRepository.findBaseline(),
      this.routeRepository.getAll(),
    ]);

    if (!baseline) {
      throw new Error('No baseline route set.');
    }

    const comparisonRoutes = allRoutes
      .filter(route => !route.isBaseline) // Don't compare baseline to itself
      .map(route => {
        const percentDiff = ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
        const compliant = route.ghgIntensity <= this.TARGET_INTENSITY;

        return {
          ...route,
          percentDiff: parseFloat(percentDiff.toFixed(2)), // Clean up to 2 decimal places
          compliant,
        };
      });

    return {
      baseline,
      comparisonRoutes,
    };
  }
}