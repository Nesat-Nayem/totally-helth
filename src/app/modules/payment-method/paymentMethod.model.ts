import mongoose, { Document, Schema } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  status: 'active' | 'inactive';
}

const paymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const PaymentMethod = mongoose.model<IPaymentMethod>('PaymentMethod', paymentMethodSchema);
