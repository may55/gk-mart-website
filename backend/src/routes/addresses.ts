import { Router } from 'express';
import Joi from 'joi';
import authMiddleware from '../middleware/auth';
import User from '../models/User';
import type { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  userId?: string;
}

const addressSchema = Joi.object({
  label: Joi.string().trim().allow('').default(''),
  society: Joi.string().trim().required(),
  societyAddress: Joi.string().trim().required(),
  flatNumber: Joi.string().trim().required(),
  // New addresses use one combined flat/block/floor value in flatNumber.
  // Keep these fields optional so older saved-address records remain compatible.
  block: Joi.string().trim().allow('').default(''),
  floor: Joi.string().trim().allow('').default(''),
  line1: Joi.string().trim().min(3).required().messages({ 'string.empty': 'Address line 1 is required' }),
  line2: Joi.string().trim().allow('').default(''),
  pincode: Joi.string().trim().pattern(/^\d{6}$/).required().messages({ 'string.pattern.base': 'Pincode must be 6 digits' }),
  city: Joi.string().trim().min(2).required().messages({ 'string.empty': 'City is required' }),
  state: Joi.string().trim().min(2).required().messages({ 'string.empty': 'State is required' }),
  phone: Joi.string().trim().pattern(/^\d{10}$/).required().messages({ 'string.pattern.base': 'Delivery phone must be 10 digits' }),
});

const SOCIETIES = new Set([
  'Shubh Labh Residency, Khajrana Square, Indore, Madhya Pradesh 452018',
  'Sanjhi Chhat Apartment, Khajrana Square, Indore, Madhya Pradesh 452018',
  'Shubh Labh Prime, Indore, Madhya Pradesh 452018',
]);

const validateSociety = (value: { society: string; societyAddress: string }) =>
  SOCIETIES.has(value.society) && value.society === value.societyAddress;

const router = Router();
router.use(authMiddleware);

// GET /api/user/addresses
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.userId).select('addresses');
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    res.json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
});

// POST /api/user/addresses
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error, value } = addressSchema.validate(req.body);
    if (error) { res.status(400).json({ success: false, message: error.details[0].message }); return; }
    if (!validateSociety(value)) { res.status(400).json({ success: false, message: 'Please select a valid society' }); return; }
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    user.addresses.push(value);
    await user.save();
    res.status(201).json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
});

// PUT /api/user/addresses/:index
router.put('/:index', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const index = parseInt(req.params['index'], 10);
    const { error, value } = addressSchema.validate(req.body);
    if (error) { res.status(400).json({ success: false, message: error.details[0].message }); return; }
    if (!validateSociety(value)) { res.status(400).json({ success: false, message: 'Please select a valid society' }); return; }
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (index < 0 || index >= user.addresses.length) { res.status(404).json({ success: false, message: 'Address not found' }); return; }
    user.addresses[index] = value;
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
});

// DELETE /api/user/addresses/:index
router.delete('/:index', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const index = parseInt(req.params['index'], 10);
    const user = await User.findById(req.userId);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    if (index < 0 || index >= user.addresses.length) { res.status(404).json({ success: false, message: 'Address not found' }); return; }
    user.addresses.splice(index, 1);
    await user.save();
    res.json({ success: true, data: user.addresses });
  } catch (err) { next(err); }
});

export default router;
