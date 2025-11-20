import mongoose, { Schema } from 'mongoose';
import { IRestaurantLocation } from './restaurantLocation.interface';

const RestaurantLocationSchema: Schema = new Schema<IRestaurantLocation>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const RestaurantLocation = mongoose.model<IRestaurantLocation>(
  'RestaurantLocation',
  RestaurantLocationSchema
);

