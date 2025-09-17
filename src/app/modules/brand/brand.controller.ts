import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Brand } from './brand.model';
import { brandCreateValidation, brandUpdateValidation } from './brand.validation';

export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = brandCreateValidation.parse(req.body);
    const exists = await Brand.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ message: 'Brand already exists' });
      return;
    }
    const created = await Brand.create(payload);
    res.status(201).json({ message: 'Brand created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create brand' });
  }
};

export const getBrands = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await Brand.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch brands' });
  }
};

export const getBrandById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Brand.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch brand' });
  }
};

export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = brandUpdateValidation.parse(req.body);
    if (payload.name) {
      const exists = await Brand.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Brand already exists' });
        return;
      }
    }
    const updated = await Brand.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.json({ message: 'Brand updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update brand' });
  }
};

export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Brand.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.json({ message: 'Brand deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete brand' });
  }
};
