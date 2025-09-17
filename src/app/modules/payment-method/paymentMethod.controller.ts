import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { PaymentMethod } from './paymentMethod.model';
import { paymentMethodCreateValidation, paymentMethodUpdateValidation } from './paymentMethod.validation';

export const createPaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = paymentMethodCreateValidation.parse(req.body);
    const exists = await PaymentMethod.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ message: 'Payment method already exists' });
      return;
    }
    const created = await PaymentMethod.create(payload);
    res.status(201).json({ message: 'Payment method created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create payment method' });
  }
};

export const getPaymentMethods = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await PaymentMethod.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch payment methods' });
  }
};

export const getPaymentMethodById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await PaymentMethod.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch payment method' });
  }
};

export const updatePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = paymentMethodUpdateValidation.parse(req.body);
    if (payload.name) {
      const exists = await PaymentMethod.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Payment method already exists' });
        return;
      }
    }
    const updated = await PaymentMethod.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }
    res.json({ message: 'Payment method updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update payment method' });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Payment method not found' });
      return;
    }
    res.json({ message: 'Payment method deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete payment method' });
  }
};
