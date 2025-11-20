import { Document } from 'mongoose';

export interface IAboutUsDetails extends Document {
  image: string;
  headline: string;
  description: string;
  services: {
    title: string;
    description: string;
  }[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

