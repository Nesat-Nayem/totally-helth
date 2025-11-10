import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Supplier } from './supplier.model';
import { supplierCreateValidation, supplierUpdateValidation } from './supplier.validation';

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = supplierCreateValidation.parse(req.body);
    const exists = await Supplier.findOne({ name: payload.name });
    if (exists) {
      res.status(400).json({ message: 'Supplier already exists' });
      return;
    }
    const created = await Supplier.create(payload);
    res.status(201).json({ message: 'Supplier created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create supplier' });
  }
};

export const getSuppliers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await Supplier.find().sort({ createdAt: -1 });
    res.json({ data: items });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch suppliers' });
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Supplier.findById(req.params.id);
    if (!item) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch supplier' });
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = supplierUpdateValidation.parse(req.body);
    if (payload.name) {
      const exists = await Supplier.findOne({ name: payload.name, _id: { $ne: req.params.id } });
      if (exists) {
        res.status(400).json({ message: 'Supplier already exists' });
        return;
      }
    }
    const updated = await Supplier.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json({ message: 'Supplier updated', data: updated });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update supplier' });
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const deleted = await Supplier.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ message: 'Supplier not found' });
      return;
    }
    res.json({ message: 'Supplier deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete supplier' });
  }
};

