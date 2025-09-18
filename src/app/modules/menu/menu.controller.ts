import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Menu } from './menu.model';
import { menuCreateValidation, menuUpdateValidation } from './menu.validation';

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = menuCreateValidation.parse(req.body);
    const created = await Menu.create(payload);
    res.status(201).json({ message: 'Menu created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create menu' });
  }
};

export const getMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q = '', page = '1', limit = '20', brand, category, status, priceType } = req.query as any;

    const filter: any = { isDeleted: { $ne: true } };
    if (status) filter.status = status;
    if (brand) filter.brands = { $in: [brand] };
    if (category) filter.category = category;

    // priceType filter: restaurant | online | membership
    if (priceType === 'restaurant') filter.restaurantPrice = { $gt: 0 };
    if (priceType === 'online') filter.onlinePrice = { $gt: 0 };
    if (priceType === 'membership') filter.membershipPrice = { $gt: 0 };

    if (q) {
      filter.$or = [{ title: { $regex: q, $options: 'i' } }, { description: { $regex: q, $options: 'i' } }];
    }

    const p = Math.max(1, parseInt(page as string, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Menu.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Menu.countDocuments(filter),
    ]);

    res.json({ data: items, meta: { page: p, limit: l, total } });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch menus' });
  }
};

export const getMenuById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Menu.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch menu' });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = menuUpdateValidation.parse(req.body);
    const updated = await Menu.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }
    res.json({ message: 'Menu updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update menu' });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Menu.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Menu not found' });
      return;
    }
    res.json({ message: 'Menu deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete menu' });
  }
};
