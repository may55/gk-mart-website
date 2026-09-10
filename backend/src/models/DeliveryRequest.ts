import { Schema, model, Document, Types } from 'mongoose';

export type DeliveryRequestStatus = 'pending' | 'contacted' | 'resolved';

export interface IDeliveryRequest extends Document {
  userId: Types.ObjectId;
  userName: string;
  userEmail: string;
  userNumber: string;
  fullAddress: string;
  phone: string;
  status: DeliveryRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryRequestSchema = new Schema<IDeliveryRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true, trim: true },
    userEmail: { type: String, required: true, trim: true },
    userNumber: { type: String, required: true, trim: true },
    fullAddress: { type: String, required: true, trim: true, maxlength: 1000 },
    phone: { type: String, required: true, trim: true },
    status: { type: String, enum: ['pending', 'contacted', 'resolved'], default: 'pending' },
  },
  { timestamps: true },
);

const DeliveryRequest = model<IDeliveryRequest>('DeliveryRequest', DeliveryRequestSchema);
export default DeliveryRequest;
