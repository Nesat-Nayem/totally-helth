import mongoose, { Document, Schema } from 'mongoose';

export interface IMenu extends Document {
  title: string;
  description?: string;
  image?: string;
  images?: string[];
  restaurantPrice?: number;
  onlinePrice?: number;
  membershipPrice?: number;
  category?: string; // MenuCategory _id
  brands?: string[]; // Brand _ids
  branches?: string[]; // Branch _ids
  status?: 'active' | 'inactive';
  isDeleted?: boolean;
  // Nutrition fields
  calories?: number;
  protein?: number;
  carbs?: number;
  fibre?: number;
  sugars?: number;
  sodium?: number;
  iron?: number;
  calcium?: number;
  vitaminC?: number;
}

const MenuSchema = new Schema<IMenu>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String, trim: true },
    images: [{ type: String, trim: true }],
    restaurantPrice: { type: Number, min: 0 },
    onlinePrice: { type: Number, min: 0 },
    membershipPrice: { type: Number, min: 0 },
    category: { type: String, trim: true },
    brands: [{ type: String, trim: true }],
    branches: [{ type: String, trim: true }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
    // Nutrition fields
    calories: { type: Number, min: 0 },
    protein: { type: Number, min: 0 },
    carbs: { type: Number, min: 0 },
    fibre: { type: Number, min: 0 },
    sugars: { type: Number, min: 0 },
    sodium: { type: Number, min: 0 },
    iron: { type: Number, min: 0 },
    calcium: { type: Number, min: 0 },
    vitaminC: { type: Number, min: 0 },
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

MenuSchema.index({ title: 'text' });
MenuSchema.index({ status: 1, category: 1 });

export const Menu = mongoose.model<IMenu>('Menu', MenuSchema);
