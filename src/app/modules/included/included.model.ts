import mongoose, { Schema } from 'mongoose';
import { IIncluded } from './included.interface';

const IncludedSchema: Schema = new Schema(
  {
    meal_type: {
      type: String,
      enum: ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    nutrition: {
      calories: {
        type: Number,
        required: true,
        min: 0,
      },
      fat_g: {
        type: Number,
        required: true,
        min: 0,
      },
      carbs_g: {
        type: Number,
        required: true,
        min: 0,
      },
      protein_g: {
        type: Number,
        required: true,
        min: 0,
      },
    },
    allergens: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    order: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const r: any = ret as any;
        if (r.createdAt) {
          r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
          });
        }
        if (r.updatedAt) {
          r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
          });
        }
      },
    },
  }
);

export const Included = mongoose.model<IIncluded>('Included', IncludedSchema);

