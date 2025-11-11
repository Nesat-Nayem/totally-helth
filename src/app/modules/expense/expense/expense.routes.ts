import express from 'express';
import { auth } from '../../../middlewares/authMiddleware';
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
  getCreditExpenses,
  getCardExpenses,
  getCashExpenses,
} from './expense.controller';

const router = express.Router();

// Main CRUD routes
router.get('/', getExpenses);
router.get('/credit', getCreditExpenses);
router.get('/card', getCardExpenses);
router.get('/cash', getCashExpenses);
router.get('/:id', getExpenseById);
router.post('/', auth(), createExpense);
router.patch('/:id', auth(), updateExpense);
router.put('/:id', auth(), updateExpense);
router.delete('/:id', auth(), deleteExpense);

export const expenseRouter = router;

