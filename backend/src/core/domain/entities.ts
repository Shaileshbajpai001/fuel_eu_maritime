// backend/src/core/domain/entities.ts

// Based on our Prisma Route model
export interface Route {
  id: number;
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number; // in tonnes
  distance: number; // in km
  totalEmissions: number; // in tonnes
  isBaseline: boolean;
}

// For the /routes/comparison endpoint
export interface ComparisonData {
  baseline: Route;
  comparisonRoutes: (Route & { 
    percentDiff: number; 
    compliant: boolean; 
  })[];
}

// For the /compliance/cb endpoint
export interface ComplianceBalance {
  shipId: string;
  year: number;
  cbGco2eq: number; // Compliance Balance in gCO2eq
}

// For the /pools endpoint
export interface PoolMemberInput {
  shipId: string;
  cbBefore: number; // Their CB before pooling
}

export interface PoolMemberResult {
  shipId: string;
  cbBefore: number;
  cbAfter: number; // Their CB after allocation
}

export interface PoolResult {
  id: number;
  year: number;
  members: PoolMemberResult[];
  totalCbBefore: number;
  totalCbAfter: number;
}