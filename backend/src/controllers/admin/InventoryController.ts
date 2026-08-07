import { Response, NextFunction } from 'express';
import InventoryService from '../../services/InventoryService';
import { validateInventoryBatchCreate } from '../../validators/admin';
import { AdminRequest } from '../../middleware/adminAuth';

class InventoryController {
  async getAll(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemEnum } = req.query as { itemEnum?: string };
      const batches = itemEnum
        ? await InventoryService.getByItemEnum(itemEnum)
        : await InventoryService.getAll();
      res.json({ success: true, data: batches });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { numberOfUnits, totalCostPrice } = req.body as {
        numberOfUnits?: unknown;
        totalCostPrice?: unknown;
      };
      const units = Number(numberOfUnits);
      const cost = Number(totalCostPrice);
      if (!Number.isInteger(units) || units < 1) {
        res.status(400).json({ success: false, message: 'numberOfUnits must be a positive integer' });
        return;
      }
      if (isNaN(cost) || cost < 0) {
        res.status(400).json({ success: false, message: 'totalCostPrice must be non-negative' });
        return;
      }
      const batch = await InventoryService.updateBatch(req.params.id, {
        numberOfUnits: units,
        totalCostPrice: cost,
      });
      res.json({ success: true, message: 'Batch updated', data: batch });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateInventoryBatchCreate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const batch = await InventoryService.createBatch(value);
      res.status(201).json({ success: true, message: 'Inventory batch created', data: batch });
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
