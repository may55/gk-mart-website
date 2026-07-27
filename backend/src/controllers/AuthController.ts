import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService.js';
import { validateSignup, validateLogin } from '../validators/auth.js';

interface CustomRequest extends Request {
  userId?: string;
  userEmail?: string;
}

class AuthController {
  async signup(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = validateSignup(req.body);
      if (error) {
        const messages = error.details.map((detail) => detail.message);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages,
        });
        return;
      }

      // Call service
      const result = await AuthService.signup(value);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async login(req: CustomRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = validateLogin(req.body);
      if (error) {
        const messages = error.details.map((detail) => detail.message);
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: messages,
        });
        return;
      }

      // Call service
      const result = await AuthService.login(value);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export default new AuthController();
