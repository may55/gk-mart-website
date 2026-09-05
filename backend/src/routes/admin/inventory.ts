import { Router } from 'express';
import InventoryController from '../../controllers/admin/InventoryController';
import adminAuthMiddleware from '../../middleware/adminAuth';
import multer from 'multer';

const inventoryRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith('image/')),
});
inventoryRouter.use(adminAuthMiddleware);

// GET ?itemEnum=some_enum to filter by product
inventoryRouter.get('/', (req, res, next) => InventoryController.getAll(req, res, next));
inventoryRouter.post('/', upload.single('billImage'), (req, res, next) => InventoryController.create(req, res, next));
inventoryRouter.put('/:id', (req, res, next) => InventoryController.update(req, res, next));

export default inventoryRouter;
