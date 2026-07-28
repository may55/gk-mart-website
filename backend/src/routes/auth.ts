import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const authRouter = Router();

// Public routes
authRouter.post('/signup', (req, res, next) => AuthController.signup(req, res, next));
authRouter.post('/login', (req, res, next) => AuthController.login(req, res, next));

export default authRouter;
