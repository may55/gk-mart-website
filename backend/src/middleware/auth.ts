import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/jwt.js';

interface CustomRequest extends Request {
  userId?: string;
  userEmail?: string;
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'No token provided',
      });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
      return;
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }
};

export default authMiddleware;
