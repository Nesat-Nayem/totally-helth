import { Document } from 'mongoose';

export interface IAboutUsFood extends Document {
  title: string;
  subtitle: string;
  description: string;
  images: string[];
  certifications: {
    name: string;
    logo: string;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

