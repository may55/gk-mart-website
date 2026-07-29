import { Router } from 'express';
import UserController from '../../controllers/admin/UserController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const usersRouter = Router();
usersRouter.use(adminAuthMiddleware);

usersRouter.get('/', (req, res, next) => UserController.getAll(req, res, next));
usersRouter.get('/:id', (req, res, next) => UserController.getOne(req, res, next));
usersRouter.post('/', (req, res, next) => UserController.create(req, res, next));
usersRouter.put('/:id', (req, res, next) => UserController.update(req, res, next));

export default usersRouter;
