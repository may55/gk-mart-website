import { Response, NextFunction } from 'express';
import AccountsService from '../../services/AccountsService';
import { AdminRequest } from '../../middleware/adminAuth';

class AccountsController {
  async getSummary(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await AccountsService.getSummary();
      res.json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }
}

export default new AccountsController();
