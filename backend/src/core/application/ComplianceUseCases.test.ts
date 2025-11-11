import { ComputeCBUseCase, BankSurplusUseCase, ApplyBankedUseCase, GetAdjustedCBUseCase } from './ComplianceUseCases.js';
import type { IComplianceRepository, IRouteRepository } from '../ports/repository.ports.js';
import type { Route, ComplianceBalance } from '../domain/entities.js';

// --- Mocks ---
const mockRouteRepo: jest.Mocked<IRouteRepository> = {
  getAll: jest.fn(),
  findBaseline: jest.fn(),
  setAsBaseline: jest.fn(),
  findByRouteIdAndYear: jest.fn(),
};

const mockComplianceRepo: jest.Mocked<IComplianceRepository> = {
  saveCB: jest.fn(),
  findByShipAndYear: jest.fn(),
  addBankEntry: jest.fn(),
  getBankEntries: jest.fn(),
  getTotalBanked: jest.fn(),
};

// --- Sample Data ---
const sampleRoute: Route = {
  id: 2, routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG',
  year: 2024, ghgIntensity: 88.0, // This is BELOW target 91.16 (Surplus)
  fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false
};

const sampleDeficitRoute: Route = {
  id: 3, routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO',
  year: 2024, ghgIntensity: 93.5, // This is ABOVE target 91.16 (Deficit)
  fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false
};

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

describe('ComputeCBUseCase', () => {
  it('should correctly calculate a surplus (positive CB)', async () => {
    // Arrange
    mockRouteRepo.findByRouteIdAndYear.mockResolvedValue(sampleRoute);
    mockComplianceRepo.saveCB.mockImplementation(cb => Promise.resolve(cb));
    const useCase = new ComputeCBUseCase(mockRouteRepo, mockComplianceRepo);

    // Act
    const result = await useCase.execute('R002', 2024);

    // Assert
    // Target (91.16) - Actual (88.0) = 3.16
    // Energy = 4800 * 41000 = 196,800,000
    // CB = 3.16 * 196,800,000 = 621,888,000
    expect(result.cbGco2eq).toBe(621888000);
    expect(mockComplianceRepo.saveCB).toHaveBeenCalledWith(result);
  });

  it('should correctly calculate a deficit (negative CB)', async () => {
    // Arrange
    mockRouteRepo.findByRouteIdAndYear.mockResolvedValue(sampleDeficitRoute);
    mockComplianceRepo.saveCB.mockImplementation(cb => Promise.resolve(cb));
    const useCase = new ComputeCBUseCase(mockRouteRepo, mockComplianceRepo);

    // Act
    const result = await useCase.execute('R003', 2024);

    // Assert
    // Target (91.16) - Actual (93.5) = -2.34
    // Energy = 5100 * 41000 = 209,100,000
    // CB = -2.34 * 209,100,000 = -489,294,000
    expect(result.cbGco2eq).toBe(-489294000);
  });
});

describe('BankSurplusUseCase', () => {
  it('should bank a positive surplus', async () => {
    // Arrange
    const surplusCB: ComplianceBalance = { shipId: 'R002', year: 2024, cbGco2eq: 621888000 };
    mockComplianceRepo.findByShipAndYear.mockResolvedValue(surplusCB);
    const useCase = new BankSurplusUseCase(mockComplianceRepo);

    // Act
    await useCase.execute('R002', 2024);

    // Assert
    expect(mockComplianceRepo.addBankEntry).toHaveBeenCalledWith({
      shipId: 'R002',
      year: 2024,
      amountGco2eq: 621888000,
    });
  });

  it('should throw an error for a deficit', async () => {
    // Arrange
    const deficitCB: ComplianceBalance = { shipId: 'R003', year: 2024, cbGco2eq: -489294000 };
    mockComplianceRepo.findByShipAndYear.mockResolvedValue(deficitCB);
    const useCase = new BankSurplusUseCase(mockComplianceRepo);

    // Act & Assert
    await expect(useCase.execute('R003', 2024))
      .rejects.toThrow('No surplus to bank.');
    expect(mockComplianceRepo.addBankEntry).not.toHaveBeenCalled();
  });
});

describe('ApplyBankedUseCase', () => {
  it('should apply a valid amount', async () => {
    // Arrange
    mockComplianceRepo.getTotalBanked.mockResolvedValue(1000);
    const useCase = new ApplyBankedUseCase(mockComplianceRepo);

    // Act
    await useCase.execute('R002', 700);

    // Assert
    expect(mockComplianceRepo.addBankEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        amountGco2eq: -700, // Check that it's a negative entry
      })
    );
  });

  it('should throw an error if not enough in bank', async () => {
    // Arrange
    mockComplianceRepo.getTotalBanked.mockResolvedValue(1000);
    const useCase = new ApplyBankedUseCase(mockComplianceRepo);

    // Act & Assert
    await expect(useCase.execute('R002', 1500))
      .rejects.toThrow('Cannot apply 1500. Only 1000 is available');
  });
});