import InventoryBatchRepository from '../repositories/InventoryBatchRepository';
import ProductRepository from '../repositories/ProductRepository';
import { IInventoryBatch } from '../models/InventoryBatch';

interface CreateBatchData {
  itemEnum: string;
  numberOfUnits: number;
  totalCostPrice: number;
  marginPercent: number;
  vendorName?: string;
}

class InventoryService {
  async getAll(): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findAll();
  }

  async getByItemEnum(itemEnum: string): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findByItemEnum(itemEnum);
  }

  async createBatch(data: CreateBatchData): Promise<IInventoryBatch> {
    const { itemEnum, numberOfUnits, totalCostPrice, marginPercent, vendorName } = data;

    const product = await ProductRepository.findByEnum(itemEnum);
    if (!product) {
      throw Object.assign(new Error(`Product with enum "${itemEnum}" not found`), {
        statusCode: 404,
      });
    }

    // Auto-increment batch number
    const maxBatch = await InventoryBatchRepository.getMaxBatchNumber(itemEnum);
    const nextBatch = maxBatch + 1;

    // Save the batch
    const batch = await InventoryBatchRepository.create({
      itemEnum,
      inventoryBatch: nextBatch,
      numberOfUnits,
      totalCostPrice,
      marginPercent,
      vendorName: vendorName ?? '',
    });

    // Update item: units and average cost price
    const existingUnits = product.unitsInStock;
    const existingAvgCost = product.averageCostPrice;

    const newTotalUnits = existingUnits + numberOfUnits;
    const newAvgCostPrice =
      newTotalUnits > 0
        ? (existingAvgCost * existingUnits + totalCostPrice) / newTotalUnits
        : 0;

    const newSellingPrice = newAvgCostPrice * (1 + marginPercent / 100);

    await ProductRepository.updateByEnum(itemEnum, {
      unitsInStock: newTotalUnits,
      averageCostPrice: Math.round(newAvgCostPrice * 100) / 100,
      sellingPrice: Math.round(newSellingPrice * 100) / 100,
    });

    return batch;
  }

  async updateMargin(batchId: string, marginPercent: number): Promise<IInventoryBatch> {
    const batch = await InventoryBatchRepository.findById(batchId);
    if (!batch) {
      throw Object.assign(new Error('Inventory batch not found'), { statusCode: 404 });
    }

    const updated = await InventoryBatchRepository.updateById(batchId, { marginPercent });
    if (!updated) {
      throw Object.assign(new Error('Inventory batch not found'), { statusCode: 404 });
    }

    // Update item selling price
    const product = await ProductRepository.findByEnum(batch.itemEnum);
    if (product) {
      const newSellingPrice = product.averageCostPrice * (1 + marginPercent / 100);
      await ProductRepository.updateByEnum(batch.itemEnum, {
        sellingPrice: Math.round(newSellingPrice * 100) / 100,
      });
    }

    return updated;
  }

  async createBulkBatch(
    vendorName: string,
    items: Omit<CreateBatchData, 'vendorName'>[]
  ): Promise<IInventoryBatch[]> {
    const batches: IInventoryBatch[] = [];
    for (const item of items) {
      const batch = await this.createBatch({ ...item, vendorName });
      batches.push(batch);
    }
    return batches;
  }
}
export default new InventoryService();
