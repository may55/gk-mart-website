import { Response, NextFunction } from 'express';
import InventoryService from '../../services/InventoryService';
import {
  validateInventoryBatchCreate,
  validateInventoryBatchUpdate,
  validateInventoryBulkCreate,
} from '../../validators/admin';
import { AdminRequest } from '../../middleware/adminAuth';

class InventoryController {
  async getAll(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const batches = await InventoryService.getAll();
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

  async update(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateInventoryBatchUpdate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const batch = await InventoryService.updateMargin(req.params.id, value.marginPercent);
      res.json({ success: true, message: 'Inventory batch updated', data: batch });
    } catch (error) {
      next(error);
    }
  }

  async createBulk(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateInventoryBulkCreate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const batches = await InventoryService.createBulkBatch(value.vendorName, value.items);
      res.status(201).json({ success: true, message: `${batches.length} batch(es) created`, data: batches });
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
