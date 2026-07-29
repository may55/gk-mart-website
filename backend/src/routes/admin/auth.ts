import { Router } from 'express';
import AdminAuthController from '../../controllers/admin/AdminAuthController';

const adminAuthRouter = Router();

adminAuthRouter.post('/login', (req, res, next) =>
  AdminAuthController.login(req, res, next)
);

export default adminAuthRouter;
