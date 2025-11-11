import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApprovedBy } from './approvedBy.model';
import { approvedByCreateValidation, approvedByUpdateValidation } from './approvedBy.validation';

export const createApprovedBy = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = approvedByCreateValidation.parse(req.body);
    const exists = await ApprovedBy.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ message: 'Approved by already exists' });
      return;
    }
    const created = await ApprovedBy.create(payload);
    res.status(201).json({ message: 'Approved by created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create approved by' });
  }
};

export const getApprovedBys = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await ApprovedBy.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch approved bys' });
  }
};

export const getApprovedById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await ApprovedBy.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Approved by not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch approved by' });
  }
};

export const updateApprovedBy = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = approvedByUpdateValidation.parse(req.body);
    if (payload.name) {
      const exists = await ApprovedBy.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Approved by already exists' });
        return;
      }
    }
    const updated = await ApprovedBy.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Approved by not found' });
      return;
    }
    res.json({ message: 'Approved by updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update approved by' });
  }
};

export const deleteApprovedBy = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await ApprovedBy.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Approved by not found' });
      return;
    }
    res.json({ message: 'Approved by deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete approved by' });
  }
};

