import { Router } from 'express';
import ProductRepository from '../repositories/ProductRepository';
import CategoryRepository from '../repositories/CategoryRepository';

const publicRouter = Router();

// GET /api/products?q=rice&category=Dairy
publicRouter.get('/products', async (req, res, next) => {
  try {
    const q = req.query['q'] as string | undefined;
    const category = req.query['category'] as string | undefined;
    const products = await ProductRepository.search(q, category, true);
    res.json({ success: true, data: products });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:enum
publicRouter.get('/products/:enum', async (req, res, next) => {
  try {
    const product = await ProductRepository.findByEnum(req.params['enum'], true);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// GET /api/categories
publicRouter.get('/categories', async (req, res, next) => {
  try {
    const categories = await CategoryRepository.findAll();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/products/validate-cart
// Body: { items: [{ productEnum: string, quantity: number }] }
// Returns each item with adjusted quantity clamped to available stock
publicRouter.post('/products/validate-cart', async (req, res, next) => {
  try {
    const items: { productEnum: string; quantity: number }[] = req.body?.items;
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'items array is required' });
      return;
    }
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      res.status(400).json({ success: false, message: 'Each quantity must be a positive integer' });
      return;
    }

    const enums = items.map((i) => i.productEnum);
    const products = await ProductRepository.findManyByEnum(enums);
    const stockMap = new Map(products.map((p) => [p.enum, p.unitsInStock]));

    const result = items.map(({ productEnum, quantity }) => {
      const available = stockMap.get(productEnum.toLowerCase()) ?? 0;
      const adjusted = Math.min(quantity, available);
      return { productEnum, requested: quantity, available, adjusted };
    });

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default publicRouter;
