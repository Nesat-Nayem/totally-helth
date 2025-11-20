import { Document } from 'mongoose';

export interface IRestaurantLocation extends Document {
  name: string;
  address: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

