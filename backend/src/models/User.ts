import { Schema, model, Document, Types } from 'mongoose';

export interface IAddress {
  label: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
}

export interface IUserNotification {
  notificationId: Types.ObjectId;
  read: boolean;
  receivedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  number: string;
  password: string;
  addresses: IAddress[];
  userRole: 'admin' | 'customer';
  cart: { productEnum: string; quantity: number }[];
  notifications: IUserNotification[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    number: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^\d{10}$/, 'Phone number must be 10 digits'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    addresses: [
      {
        label: { type: String, default: '' },
        line1: { type: String, default: '' },
        line2: { type: String, default: '' },
        pincode: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        phone: { type: String, default: '' },
      },
    ],
    userRole: {
      type: String,
      enum: ['admin', 'customer'],
      default: 'customer',
    },
    cart: {
      type: [
        {
          productEnum: { type: String, required: true },
          quantity: { type: Number, required: true, min: 1 },
          _id: false,
        },
      ],
      default: [],
    },
    notifications: {
      type: [
        {
          notificationId: { type: Schema.Types.ObjectId, ref: 'Notification', required: true },
          read: { type: Boolean, default: false },
          receivedAt: { type: Date, default: Date.now },
          _id: false,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const User = model<IUser>('User', UserSchema);

export default User;
