import type { IComplianceRepository, IRouteRepository } from '../ports/repository.ports.js';
import type { 
  IApplyBankedUseCase, 
  IBankSurplusUseCase, 
  IComputeCBUseCase, 
  IGetAdjustedCBUseCase,
  IGetBankedRecordsUseCase
} from '../ports/usecase.ports.js';
import type { ComplianceBalance } from '../domain/entities.js';

// --- Constants from the spec ---
const ENERGY_PER_TONNE_FUEL = 41000; // MJ/t
const TARGETS: { [year: number]: number } = {
  2024: 91.16, // Assuming 91.16 is the 2024 target
  2025: 89.3368,
};

// --- Use Case 1: Compute Compliance Balance ---
export class ComputeCBUseCase implements IComputeCBUseCase {
  constructor(
    private routeRepo: IRouteRepository,
    private complianceRepo: IComplianceRepository
  ) {}

  async execute(shipId: string, year: number): Promise<ComplianceBalance> {
    const route = await this.routeRepo.findByRouteIdAndYear(shipId, year);
    if (!route) {
      throw new Error(`Route not found for shipId ${shipId} and year ${year}`);
    }

    const target = TARGETS[year];
    if (!target) {
      throw new Error(`No GHG target defined for year ${year}`);
    }

    const actualIntensity = route.ghgIntensity;
    const energyInScope = route.fuelConsumption * ENERGY_PER_TONNE_FUEL;

    // (Target - Actual) * Energy
    const cbGco2eq = (target - actualIntensity) * energyInScope;

    const cbData = { shipId, year, cbGco2eq: parseFloat(cbGco2eq.toFixed(2)) };

    // Save and return the snapshot
    return this.complianceRepo.saveCB(cbData);
  }
}

// --- Use Case 2: Bank a Surplus ---
export class BankSurplusUseCase implements IBankSurplusUseCase {
  constructor(private complianceRepo: IComplianceRepository) {}

  async execute(shipId: string, year: number): Promise<void> {
    const cb = await this.complianceRepo.findByShipAndYear(shipId, year);
    if (!cb) {
      throw new Error(`No compliance balance found for shipId ${shipId} and year ${year}. Run computation first.`);
    }

    if (cb.cbGco2eq <= 0) {
      throw new Error('No surplus to bank. Compliance balance is zero or negative.');
    }

    // Bank the positive amount
    await this.complianceRepo.addBankEntry({
      shipId,
      year,
      amountGco2eq: cb.cbGco2eq,
    });
  }
}

// --- Use Case 3: Apply Banked Surplus (Withdraw) ---
export class ApplyBankedUseCase implements IApplyBankedUseCase {
  constructor(private complianceRepo: IComplianceRepository) {}

  async execute(shipId: string, amountToApply: number): Promise<void> {
    if (amountToApply <= 0) {
      throw new Error('Amount to apply must be positive.');
    }

    const totalBanked = await this.complianceRepo.getTotalBanked(shipId);

    if (amountToApply > totalBanked) {
      throw new Error(`Cannot apply ${amountToApply}. Only ${totalBanked} is available in the bank.`);
    }

    // Create a negative entry (a withdrawal)
    await this.complianceRepo.addBankEntry({
      shipId,
      year: new Date().getFullYear(), // Use current year for the withdrawal record
      amountGco2eq: -amountToApply, // Store as a negative value
    });
  }
}

// --- Use Case 4: Get Banked Records ---
export class GetBankedRecordsUseCase implements IGetBankedRecordsUseCase {
  constructor(private complianceRepo: IComplianceRepository) {}

  async execute(shipId: string, year: number): Promise<{ amountGco2eq: number }[]> {
    return this.complianceRepo.getBankEntries(shipId, year);
  }
}

// --- Use Case 5: Get Adjusted CB ---
export class GetAdjustedCBUseCase implements IGetAdjustedCBUseCase {
  constructor(private complianceRepo: IComplianceRepository) {}

  async execute(shipId: string, year: number) {
    const cb = await this.complianceRepo.findByShipAndYear(shipId, year);
    const baseCB = cb?.cbGco2eq || 0;

    // The "adjusted" balance is the *sum of all transactions* for that ship,
    // regardless of year. This is the running total.
    const totalBanked = await this.complianceRepo.getTotalBanked(shipId);

    // This endpoint just returns the *current* state
    // It doesn't combine base CB, just shows the components.
    // Let's refine: The user wants to see the CB for *this year* + *total bank*
    // The spec is "adjusted-cb". This implies Base + Bank.

    // Let's re-read: "Return CB after bank applications"
    // This implies the Base CB *plus* the total from the bank.
    const adjustedCB = baseCB + totalBanked;

    return {
      baseCB: baseCB,
      totalBanked: totalBanked,
      adjustedCB: adjustedCB,
    };
  }
}