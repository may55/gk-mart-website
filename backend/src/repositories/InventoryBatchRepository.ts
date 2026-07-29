import InventoryBatch, { IInventoryBatch } from '../models/InventoryBatch';

class InventoryBatchRepository {
  async findAll(): Promise<IInventoryBatch[]> {
    return await InventoryBatch.find().sort({ createdAt: -1 });
  }

  async findByItemEnum(itemEnum: string): Promise<IInventoryBatch[]> {
    return await InventoryBatch.find({ itemEnum: itemEnum.toLowerCase() }).sort({
      inventoryBatch: 1,
    });
  }

  async findById(id: string): Promise<IInventoryBatch | null> {
    return await InventoryBatch.findById(id);
  }

  async getMaxBatchNumber(itemEnum: string): Promise<number> {
    const result = await InventoryBatch.findOne({ itemEnum: itemEnum.toLowerCase() })
      .sort({ inventoryBatch: -1 })
      .select('inventoryBatch');
    return result ? result.inventoryBatch : 0;
  }

  async create(data: Partial<IInventoryBatch>): Promise<IInventoryBatch> {
    const batch = new InventoryBatch(data);
    return await batch.save();
  }

  async updateById(
    id: string,
    data: Partial<IInventoryBatch>
  ): Promise<IInventoryBatch | null> {
    return await InventoryBatch.findByIdAndUpdate(id, { $set: data }, { new: true });
  }
}

export default new InventoryBatchRepository();
