import { Document } from 'mongoose';

export interface IAboutUsAuthor extends Document {
  title: string;
  name: string;
  designation: string;
  image: string;
  description: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

