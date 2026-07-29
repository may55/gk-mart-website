import { Router } from 'express';
import CategoryController from '../../controllers/admin/CategoryController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const adminCategoriesRouter = Router();
adminCategoriesRouter.use(adminAuthMiddleware);

adminCategoriesRouter.get('/', (req, res, next) => CategoryController.getAll(req, res, next));
adminCategoriesRouter.post('/', (req, res, next) => CategoryController.create(req, res, next));
adminCategoriesRouter.put('/:id', (req, res, next) => CategoryController.update(req, res, next));
adminCategoriesRouter.delete('/:id', (req, res, next) => CategoryController.remove(req, res, next));

export default adminCategoriesRouter;
