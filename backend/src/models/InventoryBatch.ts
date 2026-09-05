import { Schema, model, Document } from 'mongoose';

export interface IInventoryBatch extends Document {
  itemEnum: string;
  inventoryBatch: number;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
  billImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryBatchSchema = new Schema<IInventoryBatch>(
  {
    itemEnum: {
      type: String,
      required: [true, 'Item enum is required'],
      trim: true,
      lowercase: true,
    },
    inventoryBatch: {
      type: Number,
      required: true,
    },
    numberOfUnits: {
      type: Number,
      required: [true, 'Number of units is required'],
      min: [1, 'Number of units must be at least 1'],
    },
    totalCostPrice: {
      type: Number,
      required: [true, 'Total cost price is required'],
      min: [0, 'Total cost price cannot be negative'],
    },
    vendorName: {
      type: String,
      required: [true, 'Vendor name is required'],
      trim: true,
    },
    billImage: { type: String, trim: true },
  },
  { timestamps: true }
);

InventoryBatchSchema.index({ itemEnum: 1, inventoryBatch: 1 }, { unique: true });

const InventoryBatch = model<IInventoryBatch>('InventoryBatch', InventoryBatchSchema);

export default InventoryBatch;
