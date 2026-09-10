import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  enum: string;
  barcode?: string;
  sellingPrice: number;
  marketPrice: number;
  expiryMonth?: number;
  expiryYear?: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
  metadata: string;
  isVisible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
    },
    enum: {
      type: String,
      required: [true, 'Enum is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
    },
    marketPrice: {
      type: Number,
      required: [true, 'Market price is required'],
      min: [0, 'Market price cannot be negative'],
    },
    expiryMonth: { type: Number, min: 1, max: 12 },
    expiryYear: { type: Number, min: 2000, max: 3000 },
    unitsInStock: {
      type: Number,
      default: 0,
      min: [0, 'Units in stock cannot be negative'],
    },
    averageCostPrice: {
      type: Number,
      default: 0,
      min: [0, 'Average cost price cannot be negative'],
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 5,
        message: 'Maximum 5 images allowed per product',
      },
    },
    categories: {
      type: [String],
      default: [],
    },
    metadata: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

// Enables MongoDB text search across the customer-facing product vocabulary.
ProductSchema.index({ name: 'text', categories: 'text', metadata: 'text' });

const Product = model<IProduct>('Product', ProductSchema);

export default Product;
