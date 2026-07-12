import { Router } from 'express';
import { getTrips, getTripById, createTrip, dispatchTrip, completeTrip, cancelTrip } from './trips.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createTripSchema, completeTripSchema } from './trips.schema';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getTrips);
router.get('/:id', getTripById);

router.use(requireRole('dispatcher'));

router.post('/', validate(createTripSchema), createTrip);
router.post('/:id/dispatch', dispatchTrip);
router.post('/:id/complete', validate(completeTripSchema), completeTrip);
router.post('/:id/cancel', cancelTrip);

export default router;
