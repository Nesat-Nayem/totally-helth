import mongoose, { Schema } from 'mongoose';
import { IAboutUsDetails } from './about-us-details.interface';

const AboutUsDetailsSchema: Schema = new Schema(
  {
    image: { 
      type: String, 
      required: true
    },
    headline: { 
      type: String, 
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    services: [{
      title: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
    }],
    // Services array is optional - can be empty
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

export const AboutUsDetails = mongoose.model<IAboutUsDetails>('AboutUsDetails', AboutUsDetailsSchema);

