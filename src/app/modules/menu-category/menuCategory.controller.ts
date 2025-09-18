import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { MenuCategory } from './menuCategory.model';
import { menuCategoryCreateValidation, menuCategoryUpdateValidation } from './menuCategory.validation';

export const createMenuCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = menuCategoryCreateValidation.parse(req.body);
    const exists = await MenuCategory.findOne({ title: payload.title });
    if (exists) {
      res.status(400).json({ message: 'Menu category already exists' });
      return;
    }
    const created = await MenuCategory.create(payload);
    res.status(201).json({ message: 'Menu category created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create category' });
  }
};

export const getMenuCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await MenuCategory.find({ isDeleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch categories' });
  }
};

export const getMenuCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await MenuCategory.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Menu category not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch category' });
  }
};

export const updateMenuCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = menuCategoryUpdateValidation.parse(req.body);
    if (payload.title) {
      const exists = await MenuCategory.findOne({ title: payload.title, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Menu category already exists' });
        return;
      }
    }
    const updated = await MenuCategory.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Menu category not found' });
      return;
    }
    res.json({ message: 'Menu category updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update category' });
  }
};

export const deleteMenuCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await MenuCategory.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Menu category not found' });
      return;
    }
    res.json({ message: 'Menu category deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete category' });
  }
};
