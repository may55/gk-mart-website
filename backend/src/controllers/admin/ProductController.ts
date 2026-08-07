import { Response, NextFunction } from 'express';
import ProductService from '../../services/ProductService';
import { validateProductCreate, validateProductUpdate } from '../../validators/admin';
import { AdminRequest } from '../../middleware/adminAuth';

class ProductController {
  async getAll(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await ProductService.getAllAdmin();
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await ProductService.getByEnumAdmin(req.params.enum);
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateProductCreate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const product = await ProductService.create(value);
      res.status(201).json({ success: true, message: 'Product created', data: product });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = validateProductUpdate(req.body);
      if (error) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.details.map((d) => d.message),
        });
        return;
      }
      const product = await ProductService.update(req.params.enum, value);
      res.json({ success: true, message: 'Product updated', data: product });
    } catch (error) {
      next(error);
    }
  }

  async remove(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await ProductService.delete(req.params.enum);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      next(error);
    }
  }

  async deleteImage(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const index = parseInt(req.params.index, 10);
      if (isNaN(index)) {
        res.status(400).json({ success: false, message: 'Invalid image index' });
        return;
      }
      const product = await ProductService.deleteImage(req.params.enum, index);
      res.json({ success: true, message: 'Image deleted', data: product });
    } catch (error) {
      next(error);
    }
  }

  async uploadImages(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No files uploaded' });
        return;
      }
      const product = await ProductService.uploadImages(req.params.enum, files);
      res.json({ success: true, message: 'Images uploaded', data: product });
    } catch (error) {
      next(error);
    }
  }

  async replaceImages(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No files uploaded' });
        return;
      }
      const product = await ProductService.replaceImages(req.params.enum, files);
      res.json({ success: true, message: 'Images replaced', data: product });
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
