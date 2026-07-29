import { Response, NextFunction } from 'express';
import AdminAuthService from '../../services/AdminAuthService';
import { validateAdminLogin } from '../../validators/admin';
import { AdminRequest } from '../../middleware/adminAuth';

class AdminAuthController {
  async login(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateAdminLogin(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }

      const result = await AdminAuthService.login(value);
      res.status(200).json({ success: true, message: 'Login successful', data: result });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new AdminAuthController();
