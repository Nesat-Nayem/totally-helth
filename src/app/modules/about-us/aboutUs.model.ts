import mongoose, { Schema } from 'mongoose';
import { IAboutUs } from './aboutUs.interface';

const AboutUsSchema = new Schema<IAboutUs>(
  {
    // General Information
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    banner: { type: String, trim: true },
    infoTitle1: { type: String, trim: true },
    infoSubTitle1: { type: String, trim: true },
    infoTitle2: { type: String, trim: true },
    infoSubTitle2: { type: String, trim: true },
    description: { type: String, trim: true },

    // Founder Information
    founderTitle: { type: String, trim: true },
    founderImage: { type: String, trim: true },
    founderName: { type: String, trim: true },
    founderDesignation: { type: String, trim: true },
    founderDescription: { type: String, trim: true },

    // About Information
    aboutTitle: { type: String, trim: true },
    aboutSubTitle: { type: String, trim: true },
    isoCertificate: { type: String, trim: true },
    aboutBanner1: { type: String, trim: true },
    aboutBanner2: { type: String, trim: true },
    aboutBanner3: { type: String, trim: true },
    aboutDescription: { type: String, trim: true },

    // Meta Options
    metaTitle: { type: String, trim: true },
    metaKeywords: { type: String, trim: true },
    metaDescription: { type: String, trim: true },

    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret: any) {
        if (ret.createdAt) ret.createdAt = new Date(ret.createdAt).toISOString();
        if (ret.updatedAt) ret.updatedAt = new Date(ret.updatedAt).toISOString();
      },
    },
  }
);

export const AboutUs = mongoose.model<IAboutUs>('AboutUs', AboutUsSchema);
