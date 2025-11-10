import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ExpenseType } from './expenseType.model';
import { expenseTypeCreateValidation, expenseTypeUpdateValidation } from './expenseType.validation';

export const createExpenseType = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = expenseTypeCreateValidation.parse(req.body);
    const exists = await ExpenseType.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ message: 'Expense type already exists' });
      return;
    }
    const created = await ExpenseType.create(payload);
    res.status(201).json({ message: 'Expense type created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create expense type' });
  }
};

export const getExpenseTypes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await ExpenseType.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch expense types' });
  }
};

export const getExpenseTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await ExpenseType.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Expense type not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch expense type' });
  }
};

export const updateExpenseType = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = expenseTypeUpdateValidation.parse(req.body);
    if (payload.name) {
      const exists = await ExpenseType.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Expense type already exists' });
        return;
      }
    }
    const updated = await ExpenseType.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Expense type not found' });
      return;
    }
    res.json({ message: 'Expense type updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update expense type' });
  }
};

export const deleteExpenseType = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await ExpenseType.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Expense type not found' });
      return;
    }
    res.json({ message: 'Expense type deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete expense type' });
  }
};

