import { Router } from 'express';
import OrderController from '../../controllers/admin/OrderController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const ordersRouter = Router();
ordersRouter.use(adminAuthMiddleware);

ordersRouter.get('/', (req, res, next) => OrderController.getAll(req, res, next));
ordersRouter.get('/:id', (req, res, next) => OrderController.getOne(req, res, next));
ordersRouter.post('/', (req, res, next) => OrderController.create(req, res, next));
ordersRouter.put('/:id', (req, res, next) => OrderController.update(req, res, next));

export default ordersRouter;
