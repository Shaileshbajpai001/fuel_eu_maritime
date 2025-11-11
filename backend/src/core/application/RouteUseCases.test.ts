import { GetComparisonUseCase } from './RouteUseCases.js';
// FIX 1: Use 'type' for type-only imports
import type { IRouteRepository } from '../ports/repository.ports.js';
import type { Route } from '../domain/entities.js'; // FIX 2: Using the .js extension

// Create a mock (fake) version of the IRouteRepository
const mockRouteRepository: IRouteRepository = {
    getAll: jest.fn(),
    findBaseline: jest.fn(),
    setAsBaseline: jest.fn(),
    findByRouteIdAndYear: jest.fn()
};

// Sample data for testing
const baselineRoute: Route = {
    id: 1, routeId: 'R001', vesselType: 'Container', fuelType: 'HFO',
    year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000,
    distance: 12000, totalEmissions: 4500, isBaseline: true
};

const comparisonRoute: Route = {
    id: 2, routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG',
    year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800,
    distance: 11500, totalEmissions: 4200, isBaseline: false
};

// A non-compliant route for testing
const nonCompliantRoute: Route = {
    id: 3, routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO',
    year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100,
    distance: 12500, totalEmissions: 4700, isBaseline: false
};


describe('GetComparisonUseCase', () => {

    it('should correctly calculate percentDiff and compliance', async () => {
        // Arrange: Setup the mock
        (mockRouteRepository.findBaseline as jest.Mock).mockResolvedValue(baselineRoute);
        (mockRouteRepository.getAll as jest.Mock).mockResolvedValue([baselineRoute, comparisonRoute, nonCompliantRoute]);

        const useCase = new GetComparisonUseCase(mockRouteRepository);

        // Act: Run the use case
        const result = await useCase.execute();

        // Assert: Check the results
        expect(result.baseline).toBe(baselineRoute);
        expect(result.comparisonRoutes).toHaveLength(2);
        
        // FIX 3: Use a local variable to satisfy TypeScript that the array is defined 
        // after the length assertion, clearing the 'Object is possibly undefined' error.
        const comparisonRoutes = result.comparisonRoutes!; 

        // Check the compliant route (R002)
        expect((comparisonRoutes[0] as any).routeId).toBe('R002');
        expect((comparisonRoutes[0] as any).percentDiff).toBeCloseTo(-3.30); // Use toBeCloseTo for floating point math
        expect((comparisonRoutes[0] as any).compliant).toBe(true); 

        // Check the non-compliant route (R003)
        expect((comparisonRoutes[1] as any).routeId).toBe('R003');
        expect((comparisonRoutes[1] as any).percentDiff).toBeCloseTo(2.75); // Use toBeCloseTo for floating point math
        expect((comparisonRoutes[1] as any).compliant).toBe(false); 
    });

    it('should throw an error if no baseline is set', async () => {
        // Arrange
        (mockRouteRepository.findBaseline as jest.Mock).mockResolvedValue(null);
        (mockRouteRepository.getAll as jest.Mock).mockResolvedValue([]);

        const useCase = new GetComparisonUseCase(mockRouteRepository);

        // Act & Assert
        await expect(useCase.execute()).rejects.toThrow('No baseline route set.');
    });
});