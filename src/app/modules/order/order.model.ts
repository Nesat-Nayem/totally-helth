import mongoose, { Schema } from 'mongoose';
import { IOrder, IOrderItem } from './order.interface';

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, trim: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema: Schema = new Schema(
  {
    invoiceNo: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    customer: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    items: { type: [OrderItemSchema], required: true },
    subTotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    vatPercent: { type: Number, min: 0 },
    vatAmount: { type: Number, min: 0 },
    discountType: { type: String, enum: ['flat', 'percent'] },
    discountAmount: { type: Number, min: 0 },
    shippingCharge: { type: Number, min: 0 },
    rounding: { type: Number, default: 0 },
    payableAmount: { type: Number, min: 0 },
    receiveAmount: { type: Number, min: 0 },
    changeAmount: { type: Number, min: 0 },
    dueAmount: { type: Number, min: 0 },
    note: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true },
    paymentMode: { type: String, trim: true },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const r: any = ret as any;
        if (r.createdAt) {
          r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        if (r.updatedAt) {
          r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      },
    },
  }
);

OrderSchema.index({ invoiceNo: 'text', 'customer.name': 'text' });
OrderSchema.index({ date: 1, status: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
