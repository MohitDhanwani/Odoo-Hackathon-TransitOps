import { Router } from 'express';
import { getMaintenanceLogs, createMaintenanceLog, closeMaintenanceLog } from './maintenance.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createMaintenanceSchema } from './maintenance.schema';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getMaintenanceLogs);

router.use(requireRole('fleet_manager'));

router.post('/', validate(createMaintenanceSchema), createMaintenanceLog);
router.patch('/:id/close', closeMaintenanceLog);

export default router;
