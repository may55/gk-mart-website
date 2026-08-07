import InventoryBatchRepository from '../repositories/InventoryBatchRepository';
import ProductRepository from '../repositories/ProductRepository';
import { IInventoryBatch } from '../models/InventoryBatch';

interface CreateBatchData {
  itemEnum: string;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
}

interface UpdateBatchData {
  numberOfUnits: number;
  totalCostPrice: number;
}

class InventoryService {
  async getAll(): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findAll();
  }

  async getByItemEnum(itemEnum: string): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findByItemEnum(itemEnum);
  }

  async updateBatch(batchId: string, data: UpdateBatchData): Promise<IInventoryBatch> {
    const batch = await InventoryBatchRepository.findById(batchId);
    if (!batch) throw Object.assign(new Error('Batch not found'), { statusCode: 404 });

    const product = await ProductRepository.findByEnum(batch.itemEnum);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const { numberOfUnits: newUnits, totalCostPrice: newTotalCost } = data;
    const oldUnits = batch.numberOfUnits;
    const oldTotalCost = batch.totalCostPrice;

    const totalUnits = product.unitsInStock;
    const updatedTotalUnits = totalUnits - oldUnits + newUnits;
    const updatedAvgCost =
      updatedTotalUnits > 0
        ? (product.averageCostPrice * totalUnits - oldTotalCost + newTotalCost) / updatedTotalUnits
        : 0;

    const updated = await InventoryBatchRepository.updateById(batchId, {
      numberOfUnits: newUnits,
      totalCostPrice: newTotalCost,
    });
    if (!updated) throw Object.assign(new Error('Batch not found'), { statusCode: 404 });

    await ProductRepository.updateByEnum(batch.itemEnum, {
      unitsInStock: updatedTotalUnits,
      averageCostPrice: Math.round(updatedAvgCost * 100) / 100,
    });

    return updated;
  }

  async createBatch(data: CreateBatchData): Promise<IInventoryBatch> {
    const { itemEnum, numberOfUnits, totalCostPrice, vendorName } = data;

    const product = await ProductRepository.findByEnum(itemEnum);
    if (!product) {
      throw Object.assign(new Error(`Product with enum "${itemEnum}" not found`), {
        statusCode: 404,
      });
    }

    const maxBatch = await InventoryBatchRepository.getMaxBatchNumber(itemEnum);
    const nextBatch = maxBatch + 1;

    const batch = await InventoryBatchRepository.create({
      itemEnum,
      inventoryBatch: nextBatch,
      numberOfUnits,
      totalCostPrice,
      vendorName,
    });

    const existingUnits = product.unitsInStock;
    const existingAvgCost = product.averageCostPrice;
    const newTotalUnits = existingUnits + numberOfUnits;
    const newAvgCostPrice =
      newTotalUnits > 0
        ? (existingAvgCost * existingUnits + totalCostPrice) / newTotalUnits
        : 0;

    await ProductRepository.updateByEnum(itemEnum, {
      unitsInStock: newTotalUnits,
      averageCostPrice: Math.round(newAvgCostPrice * 100) / 100,
    });

    return batch;
  }
}

export default new InventoryService();
