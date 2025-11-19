import mongoose, { Schema } from 'mongoose';
import { IGetInTouch } from './getInTouch.interface';

const GetInTouchSchema: Schema = new Schema<IGetInTouch>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    officeAddress: {
      type: String,
      required: [true, 'Office address is required'],
      trim: true,
    },
    contactNumbers: {
      type: [String],
      required: [true, 'At least one contact number is required'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one contact number is required',
      },
    },
    emailAddresses: {
      type: [String],
      required: [true, 'At least one email address is required'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0;
        },
        message: 'At least one email address is required',
      },
    },
    careerInfo: {
      type: String,
      required: [true, 'Career info is required'],
      trim: true,
    },
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

export const GetInTouch = mongoose.model<IGetInTouch>('GetInTouch', GetInTouchSchema);

