/** Shared data types used across the customer-facing frontend */

export interface Product {
  _id: string;
  enum: string;
  name: string;
  volume: string;
  sellingPrice: number;
  marketPrice: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
}

export interface Category {
  _id: string;
  label: string;
  image: string;
}

export interface CartSyncItem {
  productEnum: string;
  quantity: number;
}

export interface Address {
  label: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
}

export interface OrderItem {
  enum: string;
  unit: number;
  sellingPrice: number;
  mrp: number;
}

export interface Order {
  _id: string;
  invoiceId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  deliveryStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  userAddress: Address;
  createdAt: string;
}
