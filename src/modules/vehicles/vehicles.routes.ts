import { Router } from 'express';
import { getVehicles, getAvailableVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from './vehicles.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createVehicleSchema, updateVehicleSchema } from './vehicles.schema';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getVehicles);
router.get('/available', getAvailableVehicles);
router.get('/:id', getVehicleById);

router.use(requireRole('fleet_manager'));

router.post('/', validate(createVehicleSchema), createVehicle);
router.patch('/:id', validate(updateVehicleSchema), updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
