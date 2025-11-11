import type { Request, Response } from 'express';
import type { ICreatePoolUseCase } from '../../../core/ports/usecase.ports.js';
import type { PoolMemberInput } from '../../../core/domain/entities.js';

export class PoolController {
  constructor(
    private createPoolUseCase: ICreatePoolUseCase
  ) {}

  // POST /pools
  async createPool(req: Request, res: Response): Promise<void> {
    try {
      const { year, members } = req.body;

      if (!year || !Array.isArray(members)) {
        res.status(400).json({ message: 'Missing required fields: year and members array.' });
        return;
      }

      // You might add more detailed type validation for members here

      const poolResult = await this.createPoolUseCase.execute(year, members as PoolMemberInput[]);
      res.status(201).json(poolResult);

    } catch (error) {
      // Handle specific validation errors from the use case
      if ((error as Error).message.startsWith('Invalid pool:')) {
        res.status(400).json({ message: (error as Error).message });
      } else {
        res.status(500).json({ message: (error as Error).message });
      }
    }
  }
}