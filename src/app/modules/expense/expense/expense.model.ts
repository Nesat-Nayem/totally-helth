import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  invoiceId: string;
  invoiceDate: Date;
  expenseType: mongoose.Types.ObjectId;
  description?: string;
  supplier: mongoose.Types.ObjectId;
  paymentMethod: string;
  paymentReferenceNo?: string;
  baseAmount: number;
  taxPercent: number;
  taxAmount: number;
  vatPercent: number;
  vatAmount: number;
  grandTotal: number;
  approvedBy: mongoose.Types.ObjectId;
  notes?: string;
  status: 'active' | 'inactive';
}

const expenseSchema = new Schema<IExpense>(
  {
    invoiceId: { type: String, required: true, trim: true },
    invoiceDate: { type: Date, required: true },
    expenseType: { type: Schema.Types.ObjectId, ref: 'ExpenseType', required: true },
    description: { type: String, trim: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    paymentMethod: { type: String, required: true, trim: true },
    paymentReferenceNo: { type: String, trim: true },
    baseAmount: { type: Number, required: true, default: 0 },
    taxPercent: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    vatPercent: { type: Number, default: 5 },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'ApprovedBy', required: true },
    notes: { type: String, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

expenseSchema.index({ invoiceId: 1 });
expenseSchema.index({ invoiceDate: 1 });
expenseSchema.index({ paymentMethod: 1 });

export const Expense = mongoose.model<IExpense>('Expense', expenseSchema);

