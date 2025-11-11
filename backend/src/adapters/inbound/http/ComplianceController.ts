import type { Request, Response } from 'express';
import type {
  IComputeCBUseCase,
  IGetAdjustedCBUseCase,
  IGetBankedRecordsUseCase,
  IBankSurplusUseCase,
  IApplyBankedUseCase
} from '../../../core/ports/usecase.ports.js';

export class ComplianceController {
  constructor(
    private computeCBUseCase: IComputeCBUseCase,
    private getAdjustedCBUseCase: IGetAdjustedCBUseCase,
    private getBankedRecordsUseCase: IGetBankedRecordsUseCase,
    private bankSurplusUseCase: IBankSurplusUseCase,
    private applyBankedUseCase: IApplyBankedUseCase
  ) {}

  // GET /compliance/cb?shipId&year
  async getComplianceBalance(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;
      if (typeof shipId !== 'string' || typeof year !== 'string') {
        res.status(400).json({ message: 'Missing required query parameters: shipId and year' });
        return;
      }
      const cb = await this.computeCBUseCase.execute(shipId, parseInt(year));
      res.status(200).json(cb);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // GET /compliance/adjusted-cb?shipId&year
  async getAdjustedCB(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;
      if (typeof shipId !== 'string' || typeof year !== 'string') {
        res.status(400).json({ message: 'Missing required query parameters: shipId and year' });
        return;
      }
      const data = await this.getAdjustedCBUseCase.execute(shipId, parseInt(year));
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // GET /banking/records?shipId&year
  async getBankedRecords(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.query;
      if (typeof shipId !== 'string' || typeof year !== 'string') {
        res.status(400).json({ message: 'Missing required query parameters: shipId and year' });
        return;
      }
      const records = await this.getBankedRecordsUseCase.execute(shipId, parseInt(year));
      res.status(200).json(records);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // POST /banking/bank
  async bankSurplus(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, year } = req.body;
      await this.bankSurplusUseCase.execute(shipId, year);
      res.status(201).json({ message: 'Surplus successfully banked.' });
    } catch (error) {
      // Handle specific "user error"
      if ((error as Error).message.includes('No surplus to bank')) {
         res.status(400).json({ message: (error as Error).message });
      } else {
         res.status(500).json({ message: (error as Error).message });
      }
    }
  }

  // POST /banking/apply
  async applyBanked(req: Request, res: Response): Promise<void> {
    try {
      const { shipId, amount } = req.body;
      if (typeof amount !== 'number') {
         res.status(400).json({ message: 'Field "amount" must be a number.' });
         return;
      }
      await this.applyBankedUseCase.execute(shipId, amount);
      res.status(201).json({ message: 'Banked surplus successfully applied.' });
    } catch (error) {
       // Handle specific "user error"
      if ((error as Error).message.includes('Cannot apply')) {
         res.status(400).json({ message: (error as Error).message });
      } else {
         res.status(500).json({ message: (error as Error).message });
      }
    }
  }
}