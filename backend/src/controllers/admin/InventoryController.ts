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
