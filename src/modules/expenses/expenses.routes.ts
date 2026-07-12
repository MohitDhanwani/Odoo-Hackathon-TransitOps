import { Router } from 'express';
import { getExpenses, createExpense } from './expenses.controller';
import { validate } from '../../middlewares/validate.middleware';
import { createExpenseSchema } from './expenses.schema';
import { requireRole } from '../../middlewares/rbac.middleware';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.get('/', getExpenses);

router.use(requireRole('financial_analyst'));

router.post('/', validate(createExpenseSchema), createExpense);

export default router;
