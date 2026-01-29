import { Document } from 'mongoose';

export interface IAboutUs extends Document {
  // General Information
  title: string;
  subtitle?: string;
  banner?: string;
  infoTitle1?: string;
  infoSubTitle1?: string;
  infoTitle2?: string;
  infoSubTitle2?: string;
  description?: string;

  // Founder Information
  founderTitle?: string;
  founderImage?: string;
  founderName?: string;
  founderDesignation?: string;
  founderDescription?: string;

  // About Information
  aboutTitle?: string;
  aboutSubTitle?: string;
  isoCertificate?: string;
  aboutBanner1?: string;
  aboutBanner2?: string;
  aboutBanner3?: string;
  aboutDescription?: string;

  // Meta Options
  metaTitle?: string;
  metaKeywords?: string;
  metaDescription?: string;

  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
