import Category, { ICategory } from '../models/Category';

class CategoryRepository {
  async findAll(): Promise<ICategory[]> {
    return await Category.find().sort({ label: 1 });
  }

  async findById(id: string): Promise<ICategory | null> {
    return await Category.findById(id);
  }

  async create(data: Partial<ICategory>): Promise<ICategory> {
    const cat = new Category(data);
    return await cat.save();
  }

  async updateById(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return await Category.findByIdAndUpdate(id, { $set: data }, { new: true });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await Category.findByIdAndDelete(id);
    return result !== null;
  }

  async findOrCreateByLabel(label: string): Promise<ICategory> {
    const existing = await Category.findOne({ label: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
    if (existing) return existing;
    const cat = new Category({ label });
    return await cat.save();
  }
}

export default new CategoryRepository();
