import { Router } from 'express';
import { getDrivers, getAvailableDrivers, getCompliance, getDriverById, createDriver, updateDriver, deleteDriver } from './drivers.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createDriverSchema, updateDriverSchema } from './drivers.schema';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getDrivers);
router.get('/available', getAvailableDrivers);
router.get('/:id', getDriverById);

router.get('/compliance', getCompliance);

router.use(requireRole('safety_officer'));

router.post('/', validate(createDriverSchema), createDriver);
router.patch('/:id', validate(updateDriverSchema), updateDriver);
router.delete('/:id', deleteDriver);

export default router;
