import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/NotificationService';

interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

class NotificationController {
  async getMyNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const notifications = await NotificationService.getUserNotifications(userId);
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.userId!;
      const { id } = req.params;
      await NotificationService.markRead(userId, id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
