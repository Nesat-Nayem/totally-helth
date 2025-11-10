import mongoose, { Document, Schema } from 'mongoose';

export interface IExpenseType extends Document {
  name: string;
  status: 'active' | 'inactive';
}

const expenseTypeSchema = new Schema<IExpenseType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const ExpenseType = mongoose.model<IExpenseType>('ExpenseType', expenseTypeSchema);

