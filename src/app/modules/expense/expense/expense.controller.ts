import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Expense } from './expense.model';
import { expenseCreateValidation, expenseUpdateValidation } from './expense.validation';

// Helper function to calculate amounts
const calculateAmounts = (baseAmount: number, taxPercent: number, vatPercent: number) => {
  const taxAmount = (baseAmount * taxPercent) / 100;
  const vatAmount = (baseAmount * vatPercent) / 100;
  const grandTotal = baseAmount + taxAmount + vatAmount;
  return { taxAmount, vatAmount, grandTotal };
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = expenseCreateValidation.parse(req.body);
    
    // Calculate amounts
    const baseAmount = payload.baseAmount || 0;
    const taxPercent = payload.taxPercent || 0;
    const vatPercent = payload.vatPercent || 5;
    const { taxAmount, vatAmount, grandTotal } = calculateAmounts(baseAmount, taxPercent, vatPercent);
    
    // Parse invoice date
    const invoiceDate = typeof payload.invoiceDate === 'string' 
      ? new Date(payload.invoiceDate) 
      : payload.invoiceDate;
    
    const expenseData = {
      ...payload,
      invoiceDate,
      taxAmount,
      vatAmount,
      grandTotal,
    };
    
    const created = await Expense.create(expenseData);
    const populated = await Expense.findById(created._id)
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy');
    
    res.status(201).json({ message: 'Expense created', data: populated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create expense' });
  }
};

export const getExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentMethod, month, year } = req.query;
    const query: any = {};
    
    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }
    
    if (month || year) {
      const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
      const monthNum = month ? parseInt(month as string) : new Date().getMonth() + 1;
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      query.invoiceDate = { $gte: startDate, $lte: endDate };
    }
    
    const items = await Expense.find(query)
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy')
      .sort({ createdAt: -1 });
    
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch expenses' });
  }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Expense.findById(req.params.id)
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy');
    
    if (!item) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch expense' });
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = expenseUpdateValidation.parse(req.body);
    
    // Recalculate amounts if baseAmount, taxPercent, or vatPercent changed
    const existing = await Expense.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    
    const baseAmount = payload.baseAmount !== undefined ? payload.baseAmount : existing.baseAmount;
    const taxPercent = payload.taxPercent !== undefined ? payload.taxPercent : existing.taxPercent;
    const vatPercent = payload.vatPercent !== undefined ? payload.vatPercent : existing.vatPercent;
    
    const { taxAmount, vatAmount, grandTotal } = calculateAmounts(baseAmount, taxPercent, vatPercent);
    
    // Parse invoice date if provided
    if (payload.invoiceDate) {
      payload.invoiceDate = typeof payload.invoiceDate === 'string' 
        ? new Date(payload.invoiceDate) 
        : payload.invoiceDate;
    }
    
    const updateData = {
      ...payload,
      taxAmount,
      vatAmount,
      grandTotal,
    };
    
    const updated = await Expense.findByIdAndUpdate(req.params.id, updateData, { new: true })
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy');
    
    if (!updated) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.json({ message: 'Expense updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update expense' });
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Expense not found' });
      return;
    }
    res.json({ message: 'Expense deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete expense' });
  }
};

// Get credit expenses list
export const getCreditExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    const query: any = { paymentMethod: 'Credit' };
    
    if (month || year) {
      const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
      const monthNum = month ? parseInt(month as string) : new Date().getMonth() + 1;
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      query.invoiceDate = { $gte: startDate, $lte: endDate };
    }
    
    const items = await Expense.find(query)
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy')
      .sort({ createdAt: -1 });
    
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch credit expenses' });
  }
};

// Get card expenses list
export const getCardExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    const query: any = { paymentMethod: 'Card' };
    
    if (month || year) {
      const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
      const monthNum = month ? parseInt(month as string) : new Date().getMonth() + 1;
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      query.invoiceDate = { $gte: startDate, $lte: endDate };
    }
    
    const items = await Expense.find(query)
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy')
      .sort({ createdAt: -1 });
    
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch card expenses' });
  }
};

// Get cash expenses list
export const getCashExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    const query: any = { paymentMethod: 'Cash' };
    
    if (month || year) {
      const yearNum = year ? parseInt(year as string) : new Date().getFullYear();
      const monthNum = month ? parseInt(month as string) : new Date().getMonth() + 1;
      const startDate = new Date(yearNum, monthNum - 1, 1);
      const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);
      query.invoiceDate = { $gte: startDate, $lte: endDate };
    }
    
    const items = await Expense.find(query)
      .populate('expenseType')
      .populate('supplier')
      .populate('approvedBy')
      .sort({ createdAt: -1 });
    
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch cash expenses' });
  }
};

