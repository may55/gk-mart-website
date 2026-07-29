import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import authMiddleware from '../middleware/auth';
import NotificationController from '../controllers/NotificationController';

interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const notificationsRouter = Router();
notificationsRouter.use(authMiddleware);

notificationsRouter.get('/', (req: AuthRequest, res: Response, next: NextFunction) =>
  NotificationController.getMyNotifications(req, res, next)
);

notificationsRouter.patch('/:id/read', (req: AuthRequest, res: Response, next: NextFunction) =>
  NotificationController.markRead(req, res, next)
);

export default notificationsRouter;
