import InventoryBatchRepository from '../repositories/InventoryBatchRepository';
import ProductRepository from '../repositories/ProductRepository';
import { IInventoryBatch } from '../models/InventoryBatch';
import {
  calculateRemovedBatchAverageCost,
  calculateReplacedBatchAverageCost,
  calculateWeightedAverageCost,
} from '../utils/pricing';

interface CreateBatchData {
  itemEnum: string;
  numberOfUnits: number;
  totalCostPrice: number;
  vendorName: string;
  billImage?: string;
}

interface UpdateBatchData {
  numberOfUnits: number;
  totalCostPrice: number;
}

class InventoryService {
  /** Returns every recorded inventory batch, newest batches first. */
  async getAll(): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findAll();
  }

  /** Returns inventory batches belonging to one product enum. */
  async getByItemEnum(itemEnum: string): Promise<IInventoryBatch[]> {
    return await InventoryBatchRepository.findByItemEnum(itemEnum);
  }

  /** Replaces a batch and recalculates the product's stock and weighted cost. */
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
    const updatedAvgCost = calculateReplacedBatchAverageCost(
      totalUnits,
      updatedTotalUnits,
      product.averageCostPrice,
      oldTotalCost,
      newTotalCost,
    );

    const updated = await InventoryBatchRepository.updateById(batchId, {
      numberOfUnits: newUnits,
      totalCostPrice: newTotalCost,
    });
    if (!updated) throw Object.assign(new Error('Batch not found'), { statusCode: 404 });

    await ProductRepository.updateByEnum(batch.itemEnum, {
      unitsInStock: updatedTotalUnits,
      averageCostPrice: updatedAvgCost,
    });

    return updated;
  }

  /** Deletes a batch and reverses its units and cost from the related product. */
  async deleteBatch(batchId: string): Promise<void> {
    const batch = await InventoryBatchRepository.findById(batchId);
    if (!batch) throw Object.assign(new Error('Batch not found'), { statusCode: 404 });

    const product = await ProductRepository.findByEnum(batch.itemEnum);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    if (product.unitsInStock < batch.numberOfUnits) {
      throw Object.assign(
        new Error('Batch cannot be deleted because some of its stock has already been sold'),
        { statusCode: 409 },
      );
    }

    const remainingUnits = product.unitsInStock - batch.numberOfUnits;
    const remainingAverageCost = calculateRemovedBatchAverageCost(
      product.unitsInStock,
      product.averageCostPrice,
      batch.numberOfUnits,
      batch.totalCostPrice,
    );

    const deleted = await InventoryBatchRepository.deleteById(batchId);
    if (!deleted) throw Object.assign(new Error('Batch not found'), { statusCode: 404 });

    await ProductRepository.updateByEnum(batch.itemEnum, {
      unitsInStock: remainingUnits,
      averageCostPrice: remainingAverageCost,
    });
  }

  /** Records incoming stock, updates aggregate stock/cost, and stores its vendor/bill metadata. */
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
      billImage: data.billImage,
    });

    const existingUnits = product.unitsInStock;
    const existingAvgCost = product.averageCostPrice;
    const newTotalUnits = existingUnits + numberOfUnits;
    const newAvgCostPrice = calculateWeightedAverageCost(
      existingUnits,
      existingAvgCost,
      numberOfUnits,
      totalCostPrice,
    );

    await ProductRepository.updateByEnum(itemEnum, {
      unitsInStock: newTotalUnits,
      averageCostPrice: newAvgCostPrice,
    });

    return batch;
  }
}

export default new InventoryService();
