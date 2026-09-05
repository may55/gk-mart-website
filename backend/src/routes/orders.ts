import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import authMiddleware from '../middleware/auth';
import type { Request } from 'express';
import ProductRepository from '../repositories/ProductRepository';
import Order from '../models/Order';
import Invoice from '../models/Invoice';
import { generateInvoiceId } from '../lib/invoice';

interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const router = Router();
router.use(authMiddleware);

// POST /api/orders
// Body: { items: [{productEnum, quantity}], address: {...}, paymentMethod: 'cod' }
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { items, address, paymentMethod } = req.body as {
      items: { productEnum: string; quantity: number }[];
      address: { label?: string; line1: string; line2?: string; pincode: string; city: string; state: string; phone: string };
      paymentMethod: string;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'items are required' });
      return;
    }
    if (items.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      res.status(400).json({ success: false, message: 'Each quantity must be a positive integer' });
      return;
    }
    if (!address?.line1) {
      res.status(400).json({ success: false, message: 'address is required' });
      return;
    }
    if (!paymentMethod) {
      res.status(400).json({ success: false, message: 'paymentMethod is required' });
      return;
    }

    // Fetch product details for all items
    const enums = items.map((i) => i.productEnum);
    const products = await ProductRepository.findManyByEnum(enums);
    const productMap = new Map(products.map((p) => [p.enum, p]));

    const orderItems = items.map(({ productEnum, quantity }) => {
      const product = productMap.get(productEnum.toLowerCase());
      if (!product) throw new Error(`Product not found: ${productEnum}`);
      return {
        enum: product.enum,
        unit: quantity,
        sellingPrice: product.sellingPrice,
        costPrice: product.averageCostPrice ?? 0,
        mrp: product.marketPrice,
      };
    });

    const requestedByProduct = new Map<string, number>();
    for (const { productEnum, quantity } of items) {
      const key = productEnum.toLowerCase();
      requestedByProduct.set(key, (requestedByProduct.get(key) ?? 0) + quantity);
    }

    // Validate stock against the total requested quantity per product.
    for (const [productEnum, quantity] of requestedByProduct) {
      const product = productMap.get(productEnum.toLowerCase());
      if (product && product.unitsInStock < quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.unitsInStock}`,
        });
        return;
      }
    }

    // Reserve stock atomically before creating the order.
    for (const [productEnum, quantity] of requestedByProduct) {
      const updated = await ProductRepository.deductStock(productEnum, quantity);
      if (!updated) {
        res.status(400).json({ success: false, message: `Insufficient stock for ${productEnum}` });
        return;
      }
    }

    const totalAmount = orderItems.reduce((s, i) => s + i.sellingPrice * i.unit, 0);
    const invoiceId = generateInvoiceId();

    const order = await Order.create({
      items: orderItems,
      userId: req.userId,
      totalAmount,
      userAddress: {
        label: address.label ?? '',
        line1: address.line1,
        line2: address.line2 ?? '',
        pincode: address.pincode,
        city: address.city,
        state: address.state,
        phone: address.phone,
      },
      paymentMethod,
      deliveryStatus: 'pending',
      invoiceId,
      invoiceLink: '',
    });

    // Create invoice snapshot
    await Invoice.create({
      orderId: order._id,
      userId: req.userId,
      invoiceId,
      userName: '',
      userAddress: `${address.line1}, ${address.city} - ${address.pincode}`,
      amount: totalAmount,
      paymentMethod,
      items: orderItems,
      invoiceLink: '',
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — customer's own orders
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    next(err);
  }
});

export default router;
