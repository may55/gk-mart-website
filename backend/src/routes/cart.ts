import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../middleware/auth';
import User from '../models/User';

interface AuthRequest extends Request {
  userId?: string;
}

const cartRouter = Router();
cartRouter.use(authMiddleware);

// GET /api/cart
cartRouter.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select('cart');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user.cart ?? [] });
  } catch (err) {
    next(err);
  }
});

// PUT /api/cart
cartRouter.put('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cart } = req.body as { cart: unknown };
    if (!Array.isArray(cart)) {
      res.status(400).json({ success: false, message: 'cart must be an array' });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { cart } },
      { new: true }
    ).select('cart');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user.cart });
  } catch (err) {
    next(err);
  }
});

export default cartRouter;
