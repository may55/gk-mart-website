import { Router } from 'express';
import InventoryController from '../../controllers/admin/InventoryController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const inventoryRouter = Router();
inventoryRouter.use(adminAuthMiddleware);

inventoryRouter.get('/', (req, res, next) => InventoryController.getAll(req, res, next));
inventoryRouter.post('/', (req, res, next) => InventoryController.create(req, res, next));
inventoryRouter.post('/bulk', (req, res, next) => InventoryController.createBulk(req, res, next));
inventoryRouter.put('/:id', (req, res, next) => InventoryController.update(req, res, next));

export default inventoryRouter;
