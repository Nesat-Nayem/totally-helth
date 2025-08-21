import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Order } from './order.model';
import { orderCreateValidation, orderUpdateValidation } from './order.validation';

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = orderCreateValidation.parse(req.body);
    // normalize date
    const date = new Date(payload.date as any);
    const created = await Order.create({ ...payload, date });
    res.status(201).json({ message: 'Order created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q = '', page = '1', limit = '20', status, startDate, endDate } = req.query as any;
    const filter: any = { isDeleted: false };
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    if (q) {
      filter.$or = [
        { invoiceNo: { $regex: q, $options: 'i' } },
        { 'customer.name': { $regex: q, $options: 'i' } },
      ];
    }
    const p = Math.max(1, parseInt(page as string, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
    const skip = (p - 1) * l;

    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(l),
      Order.countDocuments(filter),
    ]);

    // totals
    const totalsAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } },
    ]);
    const summary = totalsAgg[0] || { total: 0, count: 0 };

    res.json({ data: items, meta: { page: p, limit: l, total }, summary });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch orders' });
  }
};

export const getOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Order.findOne({ _id: req.params.id, isDeleted: false });
    if (!item) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch order' });
  }
};

export const updateOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = orderUpdateValidation.parse(req.body);
    const item = await Order.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      payload.date ? { ...payload, date: new Date(payload.date as any) } : payload,
      { new: true }
    );
    if (!item) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order updated', data: item });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to update order' });
  }
};

export const deleteOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const item = await Order.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!item) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order deleted' });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to delete order' });
  }
};
