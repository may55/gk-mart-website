import { Router } from 'express';
import multer from 'multer';
import ProductController from '../../controllers/admin/ProductController';
import adminAuthMiddleware from '../../middleware/adminAuth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 150 * 1024 }, // 150KB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

const productsRouter = Router();
productsRouter.use(adminAuthMiddleware);

productsRouter.get('/', (req, res, next) => ProductController.getAll(req, res, next));
productsRouter.get('/:enum', (req, res, next) => ProductController.getOne(req, res, next));
productsRouter.post('/', (req, res, next) => ProductController.create(req, res, next));
productsRouter.put('/:enum', (req, res, next) => ProductController.update(req, res, next));
productsRouter.delete('/:enum', (req, res, next) => ProductController.remove(req, res, next));

// POST adds new images (up to remaining slots), PUT replaces all images
productsRouter.post('/:enum/images', upload.array('images', 5), (req, res, next) =>
  ProductController.uploadImages(req, res, next)
);
productsRouter.delete('/:enum/images/:index', (req, res, next) =>
  ProductController.deleteImage(req, res, next)
);
productsRouter.put('/:enum/images', upload.array('images', 5), (req, res, next) =>
  ProductController.replaceImages(req, res, next)
);

export default productsRouter;
