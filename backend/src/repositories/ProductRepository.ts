import Product, { IProduct } from '../models/Product';

class ProductRepository {
  async findAll(visibleOnly = false): Promise<IProduct[]> {
    const filter: Record<string, unknown> = visibleOnly
      ? { isVisible: true, unitsInStock: { $gt: 0 } }
      : {};
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  async search(q?: string, category?: string, visibleOnly = false): Promise<IProduct[]> {
    const filter: Record<string, unknown> = {};
    if (visibleOnly) {
      filter['isVisible'] = true;
      filter['unitsInStock'] = { $gt: 0 };
    }
    if (q) filter['$text'] = { $search: q };
    if (category) filter['categories'] = category;
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  async findByEnum(productEnum: string, visibleOnly = false): Promise<IProduct | null> {
    const filter: Record<string, unknown> = { enum: productEnum.toLowerCase() };
    if (visibleOnly) {
      filter['isVisible'] = true;
      filter['unitsInStock'] = { $gt: 0 };
    }
    return await Product.findOne(filter);
  }

  async create(data: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(data);
    return await product.save();
  }

  async updateByEnum(productEnum: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findOneAndUpdate(
      { enum: productEnum.toLowerCase() },
      { $set: data },
      { new: true, runValidators: true }
    );
  }

  async deductStock(productEnum: string, quantity: number): Promise<IProduct | null> {
    return await Product.findOneAndUpdate(
      { enum: productEnum.toLowerCase(), unitsInStock: { $gte: quantity } },
      { $inc: { unitsInStock: -quantity } },
      { new: true }
    );
  }

  async deleteByEnum(productEnum: string): Promise<boolean> {
    const result = await Product.findOneAndDelete({ enum: productEnum.toLowerCase() });
    return result !== null;
  }

  async existsByEnum(productEnum: string): Promise<boolean> {
    const count = await Product.countDocuments({ enum: productEnum.toLowerCase() });
    return count > 0;
  }

  async findManyByEnum(enums: string[], visibleOnly = false): Promise<IProduct[]> {
    const lower = enums.map((e) => e.toLowerCase());
    const filter: Record<string, unknown> = { enum: { $in: lower } };
    if (visibleOnly) {
      filter['isVisible'] = true;
      filter['unitsInStock'] = { $gt: 0 };
    }
    return await Product.find(filter);
  }
}

export default new ProductRepository();
