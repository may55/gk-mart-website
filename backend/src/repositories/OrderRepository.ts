import Order, { IOrder } from '../models/Order';

class OrderRepository {
  async findAll(): Promise<IOrder[]> {
    return await Order.find().sort({ updatedAt: -1 }).populate('userId', 'name email');
  }

  async findById(id: string): Promise<IOrder | null> {
    return await Order.findById(id).populate('userId', 'name email');
  }

  async create(data: Partial<IOrder>): Promise<IOrder> {
    const order = new Order(data);
    return await order.save();
  }

  async updateById(id: string, data: Partial<IOrder>): Promise<IOrder | null> {
    return await Order.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async findTodayOrders(): Promise<IOrder[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
    return await Order.find({ createdAt: { $gte: startOfDay, $lte: endOfDay } });
  }

  async sumTotalAmountByDateRange(
    field: 'createdAt' | 'deliveredAt',
    start: Date,
    end: Date
  ): Promise<number> {
    const result = await Order.aggregate([
      { $match: { [field]: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    return result[0]?.total ?? 0;
  }
}

export default new OrderRepository();
