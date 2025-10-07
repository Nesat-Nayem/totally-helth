import mongoose, { Schema } from 'mongoose';
import { IBanner } from './banner.interface';

const BannerSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    image: { 
      type: String, 
      required: true 
    },
    certLogo: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    metaTitle: {
      type: String,
      required: true,
      trim: true,
    },
    metaDescription: {
      type: String,
      required: true,
      trim: true,
    },
    metaKeywords: {
      type: String,
      required: true,
      trim: true,
    },
    googleReviewCount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    order: {
      type: Number,
      default: 0
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret) {
        const r: any = ret as any;
        if (r.createdAt) {
          r.createdAt = new Date(r.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        if (r.updatedAt) {
          r.updatedAt = new Date(r.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      }
    }
  }
);

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
