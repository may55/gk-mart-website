import { Schema, model, Document, Types } from 'mongoose';

export interface IOrderItem {
  enum: string;
  unit: number;
  sellingPrice: number;
  costPrice: number;
  mrp: number;
}

export type DeliveryStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface IOrder extends Document {
  items: IOrderItem[];
  userId: Types.ObjectId;
  totalAmount: number;
  userAddress: {
    label: string;
    line1: string;
    line2: string;
    pincode: string;
    city: string;
    state: string;
    phone: string;
  };
  paymentMethod: string;
  deliveryStatus: DeliveryStatus;
  deliveredAt?: Date;
  invoiceLink: string;
  invoiceId: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    enum: { type: String, required: true },
    unit: { type: Number, required: true, min: 1 },
    sellingPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    items: {
      type: [OrderItemSchema],
      required: [true, 'Items are required'],
      validate: {
        validator: (arr: IOrderItem[]) => arr.length > 0,
        message: 'Order must have at least one item',
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative'],
    },
    userAddress: {
      label: { type: String, default: '' },
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      pincode: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      trim: true,
    },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    deliveredAt: {
      type: Date,
    },
    invoiceLink: {
      type: String,
      default: '',
    },
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

const Order = model<IOrder>('Order', OrderSchema);

export default Order;
