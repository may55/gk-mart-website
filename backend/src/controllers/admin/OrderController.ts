import { Response, NextFunction } from 'express';
import OrderService from '../../services/OrderService';
import { validateOrderCreate, validateOrderUpdate } from '../../validators/admin';
import { AdminRequest } from '../../middleware/adminAuth';

class OrderController {
  async getAll(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const orders = await OrderService.getAll();
      res.json({ success: true, data: orders });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.getById(req.params.id);
      res.json({ success: true, data: order });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateOrderCreate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const result = await OrderService.create(value);
      res.status(201).json({ success: true, message: 'Order created', data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateOrderUpdate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const result = await OrderService.update(req.params.id, value);
      res.json({ success: true, message: 'Order updated', data: result });
    } catch (error) {
      next(error);
    }
  }
}

export default new OrderController();
