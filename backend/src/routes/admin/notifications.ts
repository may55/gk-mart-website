import { Router } from 'express';
import NotificationController from '../../controllers/admin/NotificationController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const adminNotificationsRouter = Router();
adminNotificationsRouter.use(adminAuthMiddleware);

adminNotificationsRouter.get('/', (req, res, next) =>
  NotificationController.list(req, res, next)
);
adminNotificationsRouter.post('/', (req, res, next) =>
  NotificationController.publish(req, res, next)
);

export default adminNotificationsRouter;
