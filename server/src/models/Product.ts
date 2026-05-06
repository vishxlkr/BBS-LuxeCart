import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: mongoose.Types.ObjectId;
  image: string;
  stock: number;
  isActive: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, trim: true, default: '' },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    image: { type: String, default: '' },
    stock: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isActive: 1 });

const Product = mongoose.model<IProduct>('Product', productSchema);
export default Product;
