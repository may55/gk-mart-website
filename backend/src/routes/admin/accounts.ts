import { Router } from 'express';
import AccountsController from '../../controllers/admin/AccountsController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const accountsRouter = Router();
accountsRouter.use(adminAuthMiddleware);

accountsRouter.get('/summary', (req, res, next) =>
  AccountsController.getSummary(req, res, next)
);

export default accountsRouter;
