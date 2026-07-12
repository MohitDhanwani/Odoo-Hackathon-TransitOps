import { Router } from 'express';
import { login, logout, getMe } from './auth.controller';
import { validate } from '../../middlewares/validate.middleware';
import { loginSchema } from './auth.schema';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { loginRateLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;
