// frontend/src/core/domain/types.ts

// Matches the backend's Route entity
export interface Route {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

// Matches the /routes/comparison response
export interface ComparisonData {
  baseline: Route;
  comparisonRoutes: (Route & { 
    percentDiff: number; 
    compliant: boolean; 
  })[];
}

// ... We will add more types here as we build other tabs ...