import type { Request, Response } from 'express';
import type { 
  IGetRoutesUseCase, 
  ISetBaselineUseCase, 
  IGetComparisonUseCase 
} from '../../../core/ports/usecase.ports.js';

export class RouteController {

  // We will "inject" the real use cases here
  constructor(
    private getRoutesUseCase: IGetRoutesUseCase,
    private setBaselineUseCase: ISetBaselineUseCase,
    private getComparisonUseCase: IGetComparisonUseCase
  ) {}

  // Controller for GET /routes
  async getAllRoutes(_req: Request, res: Response): Promise<void> {
    try {
      const routes = await this.getRoutesUseCase.execute();
      res.status(200).json(routes);
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // Controller for POST /routes/:id/baseline
  async setBaseline(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await this.setBaselineUseCase.execute(id!);
      res.status(204).send(); // 204 No Content is a good success response
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // Controller for GET /routes/comparison
  async getComparison(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.getComparisonUseCase.execute();
      res.status(200).json(data);
    } catch (error) {
      // A specific error for when the baseline isn't set
      if ((error as Error).message === 'No baseline route set.') {
        res.status(404).json({ message: (error as Error).message });
        return;
      }
      res.status(500).json({ message: (error as Error).message });
    }
  }
}