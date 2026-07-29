import { Response, NextFunction } from 'express';
import AdminUserService from '../../services/AdminUserService';
import { validateAdminUserCreate, validateAdminUserUpdate } from '../../validators/admin';
import { AdminRequest } from '../../middleware/adminAuth';

class UserController {
  async getAll(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await AdminUserService.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await AdminUserService.getById(req.params.id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateAdminUserCreate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const user = await AdminUserService.create(value);
      res.status(201).json({ success: true, message: 'User created', data: user });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateAdminUserUpdate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const user = await AdminUserService.update(req.params.id, value);
      res.json({ success: true, message: 'User updated', data: user });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
