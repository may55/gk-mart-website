import { Schema, model, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  volume: string;
  enum: string;
  barcode?: string;
  sellingPrice: number;
  marketPrice: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
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
    volume: {
      type: String,
      required: [true, 'Volume is required'],
      trim: true,
    },
    enum: {
      type: String,
      required: [true, 'Enum is required'],
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
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
  },
  { timestamps: true }
);

const Product = model<IProduct>('Product', ProductSchema);

export default Product;
