import express from 'express';
import { expenseTypeRouter } from './expense-type/expenseType.routes';
import { supplierRouter } from './supplier/supplier.routes';
import { approvedByRouter } from './approved-by/approvedBy.routes';
import { expenseRouter } from './expense/expense.routes';

const router = express.Router();

// Expense Type CRUD
router.use('/expense-types', expenseTypeRouter);

// Supplier CRUD
router.use('/suppliers', supplierRouter);

// Approved By CRUD
router.use('/approved-bys', approvedByRouter);

// Main Expense CRUD
router.use('/', expenseRouter);

export const expenseModuleRouter = router;

