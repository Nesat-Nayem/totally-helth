import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Order } from './order.model';
import { orderCreateValidation, orderUpdateValidation } from './order.validation';
import { Counter } from '../../services/counter.model';
import { userInterface } from '../../middlewares/userInterface';
import { updateOrderWithAutoTracking, createInitialHistoryEntry } from './paymentTracking.service';

function dateStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${dd}`;
}

async function nextSeq(key: string) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return doc.seq;
}

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = orderCreateValidation.parse(req.body);
    // normalize date
    const date = new Date(payload.date as any);

    // invoice / order number auto-generation if missing
    const stamp = dateStamp();
    let invoiceNo = payload.invoiceNo;
    if (!invoiceNo) {
      const s = await nextSeq(`INV-${stamp}`);
      invoiceNo = `INV-${stamp}-${String(s).padStart(6, '0')}`;
    }
    const ordSeq = await nextSeq(`ORD-${stamp}`);
    const orderNo = `ORD-${stamp}-${String(ordSeq).padStart(6, '0')}`;

    // branch from token (if available)
    const reqWithUser = req as userInterface;
    const branchId = payload.branchId || reqWithUser.branchId;

    const orderData: any = {
      ...payload,
      invoiceNo,
      orderNo,
      branchId,
      date,
    };

    const created = await Order.create(orderData);

    // Add initial payment history entry for new orders
    const initialPaymentHistory = createInitialHistoryEntry(created);
    created.paymentHistory = initialPaymentHistory;
    await created.save();

    // If middleware provided custom timestamps (for day close scenarios), update them
    // Access timestamps directly from req.body since validation strips them out
    const customCreatedAt = (req.body as any).createdAt;
    const customUpdatedAt = (req.body as any).updatedAt;
    
    console.log('🔍 Checking for custom timestamps:');
    console.log('   - customCreatedAt:', customCreatedAt);
    console.log('   - customUpdatedAt:', customUpdatedAt);
    console.log('   - Full req.body keys:', Object.keys(req.body));
    
    if (customCreatedAt || customUpdatedAt) {
      console.log('📅 Custom timestamps found, updating order...');
      const updateData: any = {};
      if (customCreatedAt) updateData.createdAt = new Date(customCreatedAt);
      if (customUpdatedAt) updateData.updatedAt = new Date(customUpdatedAt);
      
      console.log('📅 Update data:', updateData);
      
      // Use findByIdAndUpdate to override timestamps
      const updated = await Order.findByIdAndUpdate(created._id, updateData, { 
        new: true,
        runValidators: false,
        timestamps: false // Disable automatic timestamp updates
      });
      
      console.log('📅 Order updated with custom timestamps');
      
      // Fetch the updated document
      const updatedOrder = await Order.findById(created._id);
      res.status(201).json({ message: 'Order created', data: updatedOrder });
      return;
    } else {
      console.log('📅 No custom timestamps found, using default timestamps');
    }
    res.status(201).json({ message: 'Order created', data: created });
  } catch (err: any) {
    if (err instanceof ZodError) {
      res.status(400).json({ message: err.issues?.[0]?.message || 'Validation error' });
      return;
    }
    res.status(500).json({ message: err?.message || 'Failed to create order' });
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const reason = (req.body?.reason as string) || '';
    const item = await Order.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { canceled: true, cancelReason: reason, canceledAt: new Date() },
      { new: true }
    );
    if (!item) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    res.json({ message: 'Order canceled', data: item });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to cancel order' });
  }
};

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export const holdMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (order.get('salesType') !== 'membership') {
      res.status(400).json({ message: 'Not a membership order' });
      return;
    }
    const mem: any = order.get('membership') || {};
    if (mem.hold) {
      res.json({ message: 'Already on hold', data: order });
      return;
    }
    const ranges: any[] = Array.isArray(mem.holdRanges) ? mem.holdRanges : [];
    // if last range is open, do nothing, else push new open range starting today
    if (!(ranges.length > 0 && !ranges[ranges.length - 1].to)) {
      ranges.push({ from: todayYmd() });
    }
    mem.hold = true;
    mem.holdRanges = ranges;
    order.set('membership', mem);
    await order.save();
    res.json({ message: 'Membership put on hold', data: order });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to hold membership' });
  }
};

export const unholdMembership = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ _id: id, isDeleted: false });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    if (order.get('salesType') !== 'membership') {
      res.status(400).json({ message: 'Not a membership order' });
      return;
    }
    const mem: any = order.get('membership') || {};
    if (!mem.hold) {
      res.json({ message: 'Membership already active', data: order });
      return;
    }
    const ranges: any[] = Array.isArray(mem.holdRanges) ? mem.holdRanges : [];
    if (ranges.length === 0 || ranges[ranges.length - 1].to) {
      // create a small zero-length hold if none open, else just proceed
      ranges.push({ from: todayYmd(), to: todayYmd() });
    } else {
      ranges[ranges.length - 1].to = todayYmd();
    }
    mem.hold = false;
    mem.holdRanges = ranges;
    order.set('membership', mem);
    await order.save();
    res.json({ message: 'Membership resumed', data: order });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to unhold membership' });
  }
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q = '', page = '1', limit = '20', status, startDate, endDate, salesType, customerId, aggregatorId, branchId, orderType, canceled } = req.query as any;
    const filter: any = { isDeleted: false };
    if (status) filter.status = status;
    if (salesType) {
      const types = String(salesType)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (types.length > 0) {
        filter.salesType = { $in: types };
      }
    }
    if (customerId) {
      filter['customer.id'] = String(customerId);
    }
    if (aggregatorId) {
      filter.aggregatorId = String(aggregatorId);
    }
    if (branchId) {
      filter.branchId = String(branchId);
    }
    if (orderType) {
      const types = String(orderType).split(',').map((s) => s.trim()).filter(Boolean);
      if (types.length > 0) filter.orderType = { $in: types };
    }
    if (typeof canceled !== 'undefined') {
      filter.canceled = String(canceled) === 'true' || String(canceled) === '1';
    }
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
    const { id } = req.params;
    
    const updatedOrder = await updateOrderWithAutoTracking(id, payload);
    
    if (!updatedOrder) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.json({ 
      message: 'Order updated successfully', 
      data: updatedOrder,
      success: true
    });
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

export const getPaidOrdersToday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query as any;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const filter: any = { 
      isDeleted: false,
      status: 'paid',
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    if (branchId) {
      filter.branchId = String(branchId);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Calculate totals
    const totalsAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const summary = totalsAgg[0] || { total: 0, count: 0 };

    res.json({ 
      message: 'Paid orders for today retrieved successfully',
      data: orders, 
      summary,
      date: today.toISOString().split('T')[0]
    });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch paid orders for today' });
  }
};

export const getUnpaidOrdersToday = async (req: Request, res: Response): Promise<void> => {
  try {
    const { branchId } = req.query as any;
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

    const filter: any = { 
      isDeleted: false,
      status: 'unpaid',
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    if (branchId) {
      filter.branchId = String(branchId);
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    // Calculate totals
    const totalsAgg = await Order.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    const summary = totalsAgg[0] || { total: 0, count: 0 };

    res.json({ 
      message: 'Unpaid orders for today retrieved successfully',
      data: orders, 
      summary,
      date: today.toISOString().split('T')[0]
    });
  } catch (err: any) {
    res.status(500).json({ message: err?.message || 'Failed to fetch unpaid orders for today' });
  }
};
