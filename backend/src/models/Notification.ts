import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    text: {
      type: String,
      required: [true, 'Notification text is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

const Notification = model<INotification>('Notification', NotificationSchema);

export default Notification;
