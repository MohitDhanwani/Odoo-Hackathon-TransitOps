import { Router } from 'express';
import { getDashboard } from './dashboard.controller';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
// Dashboard available to all 4 roles
router.use(requireRole('fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst'));

router.get('/', getDashboard);

export default router;
