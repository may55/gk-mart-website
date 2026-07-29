import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  label: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    label: {
      type: String,
      required: [true, 'Label is required'],
      unique: true,
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Category = model<ICategory>('Category', CategorySchema);
export default Category;
