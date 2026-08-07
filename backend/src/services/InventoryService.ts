import InventoryBatchRepository from '../repositories/InventoryBatchRepository';
import ProductRepository from '../repositories/ProductRepository';
import { IInventoryBatch } from '../models/InventoryBatch';

interface CreateBatchData {
  itemEnum: string;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
}

class InventoryService {
  async getAll(): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findAll();
  }

  async getByItemEnum(itemEnum: string): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findByItemEnum(itemEnum);
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
