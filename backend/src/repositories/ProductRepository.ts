import Product, { IProduct } from '../models/Product';

class ProductRepository {
  async findAll(visibleOnly = false): Promise<IProduct[]> {
    const filter = visibleOnly ? { isVisible: true } : {};
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  async search(q?: string, category?: string, visibleOnly = false): Promise<IProduct[]> {
    const filter: Record<string, unknown> = {};
    if (visibleOnly) filter['isVisible'] = true;
    if (q) filter['name'] = { $regex: q, $options: 'i' };
    if (category) filter['categories'] = category;
    return await Product.find(filter).sort({ createdAt: -1 });
  }

  async findByEnum(productEnum: string, visibleOnly = false): Promise<IProduct | null> {
    const filter: Record<string, unknown> = { enum: productEnum.toLowerCase() };
    if (visibleOnly) filter['isVisible'] = true;
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
    if (visibleOnly) filter['isVisible'] = true;
    return await Product.find(filter);
  }
}

export default new ProductRepository();
