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
    orderNo: { type: String, trim: true },
    invoiceNo: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    customer: {
      id: { type: String, trim: true },
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    items: { type: [OrderItemSchema], required: true },
    extraItems: {
      type: [
        new Schema(
          {
            name: { type: String, required: true, trim: true },
            price: { type: Number, required: true, min: 0 },
            qty: { type: Number, required: true, min: 1, default: 1 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
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
    salesType: { type: String, enum: ['restaurant', 'online', 'membership'] },
    payments: {
      type: [
        new Schema(
          {
            type: { type: String, enum: ['Cash', 'Card', 'Gateway'], trim: true },
            amount: { type: Number, min: 0 },
          },
          { _id: false }
        ),
      ],
      default: [],
    },
    membership: {
      hold: { type: Boolean, default: false },
      holdRanges: {
        type: [
          new Schema(
            {
              from: { type: String, trim: true }, // YYYY-MM-DD
              to: { type: String, trim: true },
            },
            { _id: false }
          ),
        ],
        default: [],
      },
    },
    branchId: { type: String, trim: true },
    brand: { type: String, trim: true },
    aggregatorId: { type: String, trim: true },
    paymentMethodId: { type: String, trim: true },
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
        // add computed membership stats
        try {
          if (r.salesType === 'membership' && r.startDate && r.endDate) {
            const toDateOnly = (d: any) => {
              const dt = new Date(d);
              const y = dt.getFullYear();
              const m = dt.getMonth();
              const day = dt.getDate();
              return new Date(y, m, day);
            };
            const dayDiffInclusive = (a: Date, b: Date) => {
              const msPerDay = 24 * 60 * 60 * 1000;
              return Math.max(0, Math.floor((toDateOnly(b).getTime() - toDateOnly(a).getTime()) / msPerDay) + 1);
            };
            const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

            const start = toDateOnly(r.startDate);
            const end = toDateOnly(r.endDate);
            const today = toDateOnly(new Date());
            const upto = today < end ? today : end;
            const totalMeals = dayDiffInclusive(start, end);
            const activeDaysSoFar = dayDiffInclusive(start, upto);

            // compute hold days within the [start, upto] interval
            let holdDays = 0;
            const ranges: Array<{ from: string; to?: string }> = (r.membership?.holdRanges || []) as any;
            for (const rng of ranges) {
              const from = toDateOnly(rng.from);
              const to = rng.to ? toDateOnly(rng.to) : toDateOnly(new Date());
              // overlap with [start, upto]
              const overlapStart = from > start ? from : start;
              const overlapEnd = to < upto ? to : upto;
              if (overlapEnd >= overlapStart) {
                holdDays += dayDiffInclusive(overlapStart, overlapEnd);
              }
            }

            let consumed = clamp(activeDaysSoFar - holdDays, 0, totalMeals);
            // if currently on hold, do not count today as consumed if hold started today
            r.membershipStats = {
              totalMeals,
              consumedMeals: consumed,
              pendingMeals: clamp(totalMeals - consumed, 0, totalMeals),
              isOnHold: !!r.membership?.hold,
            };
          }
        } catch (e) {
          // ignore compute errors
        }
      },
    },
  }
);

OrderSchema.index({ invoiceNo: 'text', orderNo: 'text', 'customer.name': 'text' });
OrderSchema.index({ date: 1, status: 1, branchId: 1, brand: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
