import mongoose, { Document, Schema } from 'mongoose';

export interface ICounterPage extends Document {
  totalReviews: number;
  totalMealItems: number;
  happyClients: number;
  yearsHelpingPeople: number;
  createdAt: Date;
  updatedAt: Date;
}

const CounterPageSchema: Schema = new Schema<ICounterPage>(
  {
    totalReviews: { type: Number, required: true, default: 0, min: 0 },
    totalMealItems: { type: Number, required: true, default: 0, min: 0 },
    happyClients: { type: Number, required: true, default: 0, min: 0 },
    yearsHelpingPeople: { type: Number, required: true, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
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

// Note: We'll use findOneAndUpdate with upsert to ensure only one document exists

export const CounterPage = mongoose.model<ICounterPage>('CounterPage', CounterPageSchema);

