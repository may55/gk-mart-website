import { Router } from 'express';
import Joi from 'joi';
import authMiddleware from '../middleware/auth';
import User from '../models/User';
import DeliveryRequest from '../models/DeliveryRequest';
import type { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request { userId?: string }
const requestSchema = Joi.object({
  fullAddress: Joi.string().trim().min(10).max(1000).required(),
  phone: Joi.string().trim().pattern(/^\d{10}$/).required(),
});
const router = Router();
router.use(authMiddleware);

/** Stores a delivery-area request with both the user reference and contact snapshot. */
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error, value } = requestSchema.validate(req.body);
    if (error) { res.status(400).json({ success: false, message: error.details[0].message }); return; }
    const user = await User.findById(req.userId).select('name email number');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    const request = await DeliveryRequest.create({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userNumber: user.number,
      ...value,
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) { next(err); }
});

export default router;
