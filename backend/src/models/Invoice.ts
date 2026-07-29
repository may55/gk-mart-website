import { Schema, model, Document, Types } from 'mongoose';

export interface IInvoice extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  invoiceId: string;
  userName: string;
  userAddress: string;
  amount: number;
  paymentMethod: string;
  items: Array<{
    enum: string;
    unit: number;
    sellingPrice: number;
    costPrice: number;
    mrp: number;
  }>;
  invoiceLink: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invoiceId: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      default: '',
    },
    userAddress: {
      type: String,
      default: '',
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    items: [
      {
        enum: { type: String, required: true },
        unit: { type: Number, required: true },
        sellingPrice: { type: Number, required: true },
        costPrice: { type: Number, required: true },
        mrp: { type: Number, required: true },
        _id: false,
      },
    ],
    invoiceLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const Invoice = model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
