import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ slug: 1 });

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
