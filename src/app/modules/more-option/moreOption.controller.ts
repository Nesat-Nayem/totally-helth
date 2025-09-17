import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { MoreOption } from './moreOption.model';
import { moreOptionCreateValidation, moreOptionUpdateValidation } from './moreOption.validation';

export const createMoreOption = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = moreOptionCreateValidation.parse(req.body);
    const created = await MoreOption.create(payload);
    res.status(201).json({ message: 'More option created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create more option' });
  }
};

export const getMoreOptions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await MoreOption.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch more options' });
  }
};

export const getMoreOptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MoreOption.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'More option not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch more option' });
  }
};

export const updateMoreOption = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = moreOptionUpdateValidation.parse(req.body);
    const updated = await MoreOption.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'More option not found' });
      return;
    }
    res.json({ message: 'More option updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update more option' });
  }
};

export const deleteMoreOption = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await MoreOption.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'More option not found' });
      return;
    }
    res.json({ message: 'More option deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete more option' });
  }
};
