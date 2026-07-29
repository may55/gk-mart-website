import { Request, Response, NextFunction } from 'express';
import { verifyAdminToken } from '../lib/adminJwt';

export interface AdminRequest extends Request {
  adminUserId?: string;
  adminEmail?: string;
}

const adminAuthMiddleware = (
  req: AdminRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({ success: false, message: 'No token provided' });
      return;
    }

    const decoded = verifyAdminToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
      return;
    }

    req.adminUserId = decoded.userId;
    req.adminEmail = decoded.email;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export default adminAuthMiddleware;
