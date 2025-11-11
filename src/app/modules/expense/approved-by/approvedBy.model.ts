import mongoose, { Document, Schema } from 'mongoose';

export interface IApprovedBy extends Document {
  name: string;
  status: 'active' | 'inactive';
}

const approvedBySchema = new Schema<IApprovedBy>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const ApprovedBy = mongoose.model<IApprovedBy>('ApprovedBy', approvedBySchema);

