import mongoose, { Document, Schema } from 'mongoose';

export interface IMenuCategory extends Document {
  title: string;
  status: 'active' | 'inactive';
  isDeleted?: boolean;
}

const MenuCategorySchema = new Schema<IMenuCategory>(
  {
    title: { type: String, required: true, trim: true, unique: true },
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

export const MenuCategory = mongoose.model<IMenuCategory>('MenuCategory', MenuCategorySchema);
