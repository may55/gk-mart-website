/** Shared data types used across the customer-facing frontend */

export interface Product {
  _id: string;
  enum: string;
  name: string;
  sku: string;
  sellingPrice: number;
  marketPrice: number;
  expiryMonth?: number;
  expiryYear?: number;
  unitsInStock: number;
  averageCostPrice: number;
  images: string[];
  categories: string[];
  isVisible: boolean;
}

export interface InventoryBatch {
  _id: string;
  itemEnum: string;
  inventoryBatch: number;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
  billImage?: string;
  createdAt: string;
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
  costPrice?: number;
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

export interface Notification {
  _id: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserNotification {
  notificationId: Notification;
  read: boolean;
  receivedAt: string;
}
