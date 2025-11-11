import mongoose, { Schema } from 'mongoose';
import { IMealPlanWork } from './mealPlanWork.interface';

const MealPlanWorkStepSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    subTitle: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const MealPlanWorkSchema: Schema = new Schema(
  {
    // General Information
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    banner1: { type: String, required: true, trim: true },
    banner2: { type: String, required: true, trim: true },

    // Steps
    step1: { type: MealPlanWorkStepSchema, required: true },
    step2: { type: MealPlanWorkStepSchema, required: true },
    step3: { type: MealPlanWorkStepSchema, required: true },

    // Meta Options
    metaTitle: { type: String, required: true, trim: true },
    metaTagKeyword: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
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

export const MealPlanWork = mongoose.model<IMealPlanWork>('MealPlanWork', MealPlanWorkSchema);

