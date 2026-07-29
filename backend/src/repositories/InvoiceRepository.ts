import Invoice, { IInvoice } from '../models/Invoice';
import { Types } from 'mongoose';

class InvoiceRepository {
  async findAll(): Promise<IInvoice[]> {
    return await Invoice.find().sort({ createdAt: -1 });
  }

  async findByOrderId(orderId: string): Promise<IInvoice | null> {
    return await Invoice.findOne({ orderId: new Types.ObjectId(orderId) });
  }

  async create(data: Partial<IInvoice>): Promise<IInvoice> {
    const invoice = new Invoice(data);
    return await invoice.save();
  }

  async updateByOrderId(
    orderId: string,
    data: Partial<IInvoice>
  ): Promise<IInvoice | null> {
    return await Invoice.findOneAndUpdate(
      { orderId: new Types.ObjectId(orderId) },
      { $set: data },
      { new: true }
    );
  }
}

export default new InvoiceRepository();
