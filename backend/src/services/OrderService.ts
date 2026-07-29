import OrderRepository from '../repositories/OrderRepository';
import InvoiceRepository from '../repositories/InvoiceRepository';
import UserRepository from '../repositories/UserRepository';
import ProductRepository from '../repositories/ProductRepository';
import { generateInvoiceId } from '../lib/invoice';
import { IOrder, IOrderItem, DeliveryStatus } from '../models/Order';
import { IInvoice } from '../models/Invoice';
import { Types } from 'mongoose';

interface OrderAddress {
  label: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
}

interface CreateOrderData {
  items: IOrderItem[];
  userId: string;
  totalAmount: number;
  userAddress: OrderAddress;
  paymentMethod: string;
  deliveryStatus?: DeliveryStatus;
  deliveredAt?: Date;
  invoiceLink?: string;
}

interface UpdateOrderData {
  items?: IOrderItem[];
  userId?: string;
  totalAmount?: number;
  userAddress?: OrderAddress;
  paymentMethod?: string;
  deliveryStatus?: DeliveryStatus;
  deliveredAt?: Date | null;
  invoiceLink?: string;
}

class OrderService {
  async getAll(): Promise<IOrder[]> {
    return await OrderRepository.findAll();
  }

  async getById(id: string): Promise<IOrder> {
    const order = await OrderRepository.findById(id);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });
    return order;
  }

  async create(data: CreateOrderData): Promise<{ order: IOrder; invoice: IInvoice }> {
    const user = await UserRepository.findById(data.userId);
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    // Validate stock
    const enums = data.items.map((i) => i.enum);
    const products = await ProductRepository.findManyByEnum(enums);
    const productMap = new Map(products.map((p) => [p.enum, p]));
    for (const item of data.items) {
      const product = productMap.get(item.enum.toLowerCase());
      if (!product) {
        throw Object.assign(new Error(`Product not found: ${item.enum}`), { statusCode: 404 });
      }
      if (product.unitsInStock < item.unit) {
        throw Object.assign(
          new Error(`Insufficient stock for "${product.name}". Available: ${product.unitsInStock}`),
          { statusCode: 400 }
        );
      }
    }

    const invoiceId = generateInvoiceId();

    const order = await OrderRepository.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
      invoiceId,
      invoiceLink: data.invoiceLink ?? '',
    });

    const invoice = await InvoiceRepository.create({
      orderId: order._id as Types.ObjectId,
      userId: new Types.ObjectId(data.userId),
      invoiceId,
      userName: user.name,
      userAddress: `${data.userAddress.line1}, ${data.userAddress.city} - ${data.userAddress.pincode}`,
      amount: data.totalAmount,
      paymentMethod: data.paymentMethod,
      items: data.items,
      invoiceLink: data.invoiceLink ?? '',
    });

    // Deduct stock
    await Promise.all(
      data.items.map((item) => {
        const product = productMap.get(item.enum.toLowerCase())!;
        return ProductRepository.updateByEnum(item.enum, {
          unitsInStock: product.unitsInStock - item.unit,
        });
      })
    );

    return { order, invoice };
  }

  async update(
    orderId: string,
    data: UpdateOrderData
  ): Promise<{ order: IOrder; invoice: IInvoice | null }> {
    const updatePayload: Partial<IOrder> = {};

    if (data.items !== undefined) updatePayload.items = data.items;
    if (data.totalAmount !== undefined) updatePayload.totalAmount = data.totalAmount;
    if (data.userAddress !== undefined) updatePayload.userAddress = data.userAddress;
    if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;
    if (data.deliveryStatus !== undefined) updatePayload.deliveryStatus = data.deliveryStatus;
    if (data.deliveredAt !== undefined) updatePayload.deliveredAt = data.deliveredAt ?? undefined;
    if (data.invoiceLink !== undefined) updatePayload.invoiceLink = data.invoiceLink;
    if (data.userId !== undefined)
      updatePayload.userId = new Types.ObjectId(data.userId);

    const order = await OrderRepository.updateById(orderId, updatePayload);
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 });

    // Sync invoice
    const invoiceUpdate: Partial<IInvoice> = {};
    if (data.items !== undefined) invoiceUpdate.items = data.items;
    if (data.totalAmount !== undefined) invoiceUpdate.amount = data.totalAmount;
    if (data.userAddress !== undefined) invoiceUpdate.userAddress = `${data.userAddress.line1}, ${data.userAddress.city} - ${data.userAddress.pincode}`;
    if (data.paymentMethod !== undefined) invoiceUpdate.paymentMethod = data.paymentMethod;
    if (data.invoiceLink !== undefined) invoiceUpdate.invoiceLink = data.invoiceLink;

    if (data.userId !== undefined) {
      const user = await UserRepository.findById(data.userId);
      if (user) {
        invoiceUpdate.userId = new Types.ObjectId(data.userId);
        invoiceUpdate.userName = user.name;
      }
    }

    const invoice = await InvoiceRepository.updateByOrderId(orderId, invoiceUpdate);

    return { order, invoice };
  }
}

export default new OrderService();
