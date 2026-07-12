import { Router } from 'express';
import { getFuelEfficiency, getFleetUtilization, getOperationalCost, getVehicleROI, exportCSV } from './reports.controller';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(requireRole('financial_analyst'));

router.get('/fuel-efficiency', getFuelEfficiency);
router.get('/fleet-utilization', getFleetUtilization);
router.get('/operational-cost', getOperationalCost);
router.get('/vehicle-roi', getVehicleROI);
router.get('/export/csv', exportCSV);

export default router;
