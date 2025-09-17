import mongoose, { Document, Schema } from 'mongoose';

export interface IAggregator extends Document {
  name: string;
  logo?: string;
  status: 'active' | 'inactive';
}

const aggregatorSchema = new Schema<IAggregator>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    logo: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const Aggregator = mongoose.model<IAggregator>('Aggregator', aggregatorSchema);
