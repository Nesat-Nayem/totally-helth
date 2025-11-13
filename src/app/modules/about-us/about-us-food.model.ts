import mongoose, { Schema } from 'mongoose';
import { IAboutUsFood } from './about-us-food.interface';

const AboutUsFoodSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true
    },
    subtitle: { 
      type: String, 
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{
      type: String,
      required: true,
    }],
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      logo: {
        type: String,
        required: true,
      },
    }],
    isDeleted: { 
      type: Boolean, 
      default: false 
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      transform: function(doc, ret: any) {
        if (ret.createdAt) {
          ret.createdAt = new Date(ret.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
        if (ret.updatedAt) {
          ret.updatedAt = new Date(ret.updatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        }
      }
    }
  }
);

export const AboutUsFood = mongoose.model<IAboutUsFood>('AboutUsFood', AboutUsFoodSchema);

