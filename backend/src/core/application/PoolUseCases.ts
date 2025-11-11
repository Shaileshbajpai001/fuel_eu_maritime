import type { PoolMemberInput, PoolResult } from '../domain/entities.js';
import type { IPoolRepository } from '../ports/repository.ports.js';
import type { ICreatePoolUseCase } from '../ports/usecase.ports.js';

export class CreatePoolUseCase implements ICreatePoolUseCase {
  constructor(private poolRepo: IPoolRepository) {}

  async execute(year: number, members: PoolMemberInput[]): Promise<PoolResult> {
    
    // --- 1. Validation ---
    this.validatePool(members);

    // --- 2. Allocation Logic ---
    const allocatedMembers = this.allocateBalance(members);

    // --- 3. Final Validation (Post-Allocation) ---
    this.validateAllocation(members, allocatedMembers);

    // --- 4. Save to Database ---
    const membersToSave = allocatedMembers.map(m => ({
      shipId: m.shipId,
      cbBefore: m.cbBefore,
      cbAfter: m.cbAfter,
    }));
    
    return this.poolRepo.createPool(year, membersToSave);
  }

  private validatePool(members: PoolMemberInput[]): void {
    if (!members || members.length < 2) {
      throw new Error('A pool must have at least two members.');
    }

    // Rule 1: Sum(adjustedCB) >= 0
    const poolSum = members.reduce((sum, m) => sum + m.cbBefore, 0);
    if (poolSum < 0) {
      throw new Error(`Invalid pool: The total compliance balance is ${poolSum}, which is less than 0.`);
    }
  }

  private allocateBalance(members: PoolMemberInput[]): (PoolMemberInput & { cbAfter: number })[] {
    // Create deep copies for manipulation
    let ships = members.map(m => ({ ...m, cbAfter: m.cbBefore }));

    // Separate ships with deficit (need CB) and surplus (can give CB)
    let deficits = ships.filter(s => s.cbAfter < 0).sort((a, b) => a.cbAfter - b.cbAfter); // Most deficit first
    let surpluses = ships.filter(s => s.cbAfter > 0).sort((a, b) => b.cbAfter - a.cbAfter); // Most surplus first

    let deficitIdx = 0;
    let surplusIdx = 0;

    // Greedy allocation
    while (deficitIdx < deficits.length && surplusIdx < surpluses.length) {
      
      // --- FIX 1: Check for undefined ---
      // This satisfies TypeScript's strict index access rules.
      const surplusShip = surpluses[surplusIdx];
      const deficitShip = deficits[deficitIdx];

      if (!surplusShip || !deficitShip) {
        // Logically this shouldn't be hit because of the while-loop condition,
        // but it makes the code type-safe.
        break; 
      }
      // --- End of Fix 1 ---

      let amountToTransfer = Math.min(surplusShip.cbAfter, -deficitShip.cbAfter);

      // Perform transfer
      surplusShip.cbAfter -= amountToTransfer;
      deficitShip.cbAfter += amountToTransfer;

      // If surplus ship is empty, move to the next one
      if (surplusShip.cbAfter === 0) {
        surplusIdx++;
      }
      // If deficit ship is satisfied, move to the next one
      if (deficitShip.cbAfter === 0) {
        deficitIdx++;
      }
    }

    return ships;
  }

  private validateAllocation(
    originalMembers: PoolMemberInput[],
    allocatedMembers: (PoolMemberInput & { cbAfter: number })[]
  ): void {
    
    for (const original of originalMembers) {
      
      // --- FIX 2: Remove '!' and add proper check ---
      const allocated = allocatedMembers.find(a => a.shipId === original.shipId);
      
      if (!allocated) {
        // This should never happen if allocateBalance returns all ships
        throw new Error(`Internal Server Error: Ship ${original.shipId} missing from allocation results.`);
      }
      // --- End of Fix 2 ---

      // Rule 2: Deficit ship cannot exit worse
      if (original.cbBefore < 0 && allocated.cbAfter < original.cbBefore) {
        throw new Error(`Invalid allocation: Deficit ship ${original.shipId} exits worse off.`);
      }
      
      // Rule 3: Surplus ship cannot exit negative
      if (original.cbBefore > 0 && allocated.cbAfter < 0) {
        throw new Error(`Invalid allocation: Surplus ship ${original.shipId} exits with a negative balance.`);
      }
    }
    
    // Final sanity check: the total sum must be conserved.
    const sumBefore = originalMembers.reduce((sum, m) => sum + m.cbBefore, 0);
    const sumAfter = allocatedMembers.reduce((sum, m) => sum + m.cbAfter, 0);

    if (Math.abs(sumBefore - sumAfter) > 0.01) { // Allow for floating point rounding
       throw new Error('Internal Server Error: Pool sum was not conserved during allocation.');
    }
  }
}