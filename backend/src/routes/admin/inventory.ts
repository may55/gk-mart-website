import { Router } from 'express';
import InventoryController from '../../controllers/admin/InventoryController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const inventoryRouter = Router();
inventoryRouter.use(adminAuthMiddleware);

// GET ?itemEnum=some_enum to filter by product
inventoryRouter.get('/', (req, res, next) => InventoryController.getAll(req, res, next));
inventoryRouter.post('/', (req, res, next) => InventoryController.create(req, res, next));

export default inventoryRouter;
