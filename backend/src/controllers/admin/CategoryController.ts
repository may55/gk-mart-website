import { Response, NextFunction } from 'express';
import CategoryRepository from '../../repositories/CategoryRepository';
import { AdminRequest } from '../../middleware/adminAuth';
import Joi from 'joi';
import { uploadCategoryImage } from '../../lib/s3';

const categorySchema = Joi.object({
  label: Joi.string().required().trim(),
  image: Joi.string().allow('').default(''),
});

const categoryUpdateSchema = Joi.object({
  label: Joi.string().trim(),
  image: Joi.string().allow(''),
});

class CategoryController {
  async getAll(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const cats = await CategoryRepository.findAll();
      res.json({ success: true, data: cats });
    } catch (err) {
      next(err);
    }
  }

  async create(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = categorySchema.validate(req.body, { abortEarly: false });
      if (error) {
        res.status(400).json({ success: false, errors: error.details.map((d) => d.message) });
        return;
      }
      const cat = await CategoryRepository.create(value);
      res.status(201).json({ success: true, message: 'Category created', data: cat });
    } catch (err) {
      next(err);
    }
  }

  async update(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = categoryUpdateSchema.validate(req.body, { abortEarly: false });
      if (error) {
        res.status(400).json({ success: false, errors: error.details.map((d) => d.message) });
        return;
      }
      const cat = await CategoryRepository.updateById(req.params.id, value);
      if (!cat) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      res.json({ success: true, message: 'Category updated', data: cat });
    } catch (err) {
      next(err);
    }
  }

  async remove(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await CategoryRepository.deleteById(req.params.id);
      if (!deleted) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      res.json({ success: true, message: 'Category deleted' });
    } catch (err) {
      next(err);
    }
  }

  /** Uploads the category image and saves its public URL on the category. */
  async uploadImage(req: AdminRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ success: false, message: 'No image uploaded' });
        return;
      }
      const category = await CategoryRepository.findById(req.params.id);
      if (!category) {
        res.status(404).json({ success: false, message: 'Category not found' });
        return;
      }
      const image = await uploadCategoryImage(category.id, file.buffer, file.mimetype);
      const updated = await CategoryRepository.updateById(category.id, { image });
      res.json({ success: true, message: 'Category image updated', data: updated });
    } catch (error) {
      next(error);
    }
  }
}

export default new CategoryController();
