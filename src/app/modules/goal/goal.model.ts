import mongoose, { Schema } from 'mongoose';
import { IGoal } from './goal.interface';

const GoalSectionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    icon: { type: String, required: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const GoalSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    sections: {
      type: [GoalSectionSchema],
      validate: {
        validator: (arr: any[]) => Array.isArray(arr) && arr.length > 0 && arr.length <= 3,
        message: 'sections must contain between 1 and 3 items',
      },
      required: true,
    },
    metaTitle: { type: String, required: true, trim: true },
    metaDescription: { type: String, required: true, trim: true },
    metaKeywords: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    order: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
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

export const Goal = mongoose.model<IGoal>('Goal', GoalSchema);
