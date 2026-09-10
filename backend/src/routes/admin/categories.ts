import { Router } from 'express';
import CategoryController from '../../controllers/admin/CategoryController';
import adminAuthMiddleware from '../../middleware/adminAuth';
import multer from 'multer';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const adminCategoriesRouter = Router();
adminCategoriesRouter.use(adminAuthMiddleware);

adminCategoriesRouter.get('/', (req, res, next) => CategoryController.getAll(req, res, next));
adminCategoriesRouter.post('/', (req, res, next) => CategoryController.create(req, res, next));
adminCategoriesRouter.put('/:id', (req, res, next) => CategoryController.update(req, res, next));
adminCategoriesRouter.post('/:id/image', upload.single('image'), (req, res, next) =>
  CategoryController.uploadImage(req, res, next),
);
adminCategoriesRouter.delete('/:id', (req, res, next) => CategoryController.remove(req, res, next));

export default adminCategoriesRouter;
