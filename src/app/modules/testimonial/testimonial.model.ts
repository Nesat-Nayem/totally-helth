import mongoose, { Schema } from 'mongoose';
import { ITestimonial } from './testimonial.interface';

const TestimonialSchema: Schema = new Schema(
  {
    quote: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorProfession: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }, // For sorting
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

export const Testimonial = mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);

