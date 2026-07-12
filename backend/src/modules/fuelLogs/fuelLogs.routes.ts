import { Router } from 'express';
import { getFuelLogs, createFuelLog } from './fuelLogs.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createFuelLogSchema } from './fuelLogs.schema';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getFuelLogs);

router.use(requireRole('financial_analyst'));

router.post('/', validate(createFuelLogSchema), createFuelLog);

export default router;
