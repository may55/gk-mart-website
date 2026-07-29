import { Response, NextFunction } from 'express';
import NotificationService from '../../services/NotificationService';
import { AdminRequest } from '../../middleware/adminAuth';

class NotificationController {
  async list(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const notifications = await NotificationService.listAll();
      res.json({ success: true, data: notifications });
    } catch (error) {
      next(error);
    }
  }

  async publish(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { text } = req.body as { text?: string };
      if (!text || !text.trim()) {
        res.status(400).json({ success: false, message: 'text is required' });
        return;
      }
      const notification = await NotificationService.publish(text.trim());
      res.status(201).json({ success: true, data: notification });
    } catch (error) {
      next(error);
    }
  }
}

export default new NotificationController();
