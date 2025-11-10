import express from 'express';
import { auth } from '../../../middlewares/authMiddleware';
import {
  createExpenseType,
  deleteExpenseType,
  getExpenseTypeById,
  getExpenseTypes,
  updateExpenseType,
} from './expenseType.controller';

const router = express.Router();

router.get('/', getExpenseTypes);
router.get('/:id', getExpenseTypeById);
router.post('/', auth(), createExpenseType);
router.patch('/:id', auth(), updateExpenseType);
router.delete('/:id', auth(), deleteExpenseType);

export const expenseTypeRouter = router;

