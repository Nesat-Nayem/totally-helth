import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Customer } from './customer.model';
import { customerCreateValidation, customerUpdateValidation } from './customer.validation';

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = customerCreateValidation.parse(req.body);
    const created = await Customer.create(payload);
    res.status(201).json({ message: 'Customer created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create customer' });
  }
};

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q = '', page = '1', limit = '20', status } = req.query as any;
    const filter: any = { isDeleted: false };
    if (status) filter.status = status;
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }
    const p = Math.max(1, parseInt(page as string, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Customer.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Customer.countDocuments(filter),
    ]);

    res.json({ data: items, meta: { page: p, limit: l, total } });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch customers' });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Customer.findOne({ _id: req.params.id, isDeleted: false });
    if (!item) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch customer' });
  }
};

export const updateCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = customerUpdateValidation.parse(req.body);
    const item = await Customer.findOneAndUpdate({ _id: req.params.id, isDeleted: false }, payload, { new: true });
    if (!item) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json({ message: 'Customer updated', data: item });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update customer' });
  }
};

export const deleteCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Customer.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!item) {
      res.status(404).json({ message: 'Customer not found' });
      return;
    }
    res.json({ message: 'Customer deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete customer' });
  }
};
