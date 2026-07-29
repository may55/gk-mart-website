import ProductRepository from '../repositories/ProductRepository';;
import { uploadItemImage } from '../lib/s3';
import { IProduct } from '../models/Product';;

interface CreateProductData {
  name: string;
  volume: string;
  sellingPrice: number;
  marketPrice: number;
  unitsInStock?: number;
  averageCostPrice?: number;
  categories?: string[];
}

interface UpdateProductData {
  name?: string;
  volume?: string;
  sellingPrice?: number;
  marketPrice?: number;
  unitsInStock?: number;
  averageCostPrice?: number;
  categories?: string[];
}

const buildEnum = (name: string, volume: string): string => {
  return `${name}_${volume}`.toLowerCase().replace(/\s+/g, '_');
};

class ProductService {
  async getAll(): Promise<IProduct[]> {
    return await ProductRepository.findAll();
  }

  async getByEnum(productEnum: string): Promise<IProduct> {
    const product = await ProductRepository.findByEnum(productEnum);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  async create(data: CreateProductData): Promise<IProduct> {
    const productEnum = buildEnum(data.name, data.volume);

    const exists = await ProductRepository.existsByEnum(productEnum);
    if (exists) {
      throw new Error(`Product with enum "${productEnum}" already exists`);
    }

    return await ProductRepository.create({ ...data, enum: productEnum, images: [] });
  }

  async update(productEnum: string, data: UpdateProductData): Promise<IProduct> {
    const product = await ProductRepository.updateByEnum(productEnum, data);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  async delete(productEnum: string): Promise<void> {
    const deleted = await ProductRepository.deleteByEnum(productEnum);
    if (!deleted) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  async uploadImages(
    productEnum: string,
    files: Express.Multer.File[]
  ): Promise<IProduct> {
    const product = await ProductRepository.findByEnum(productEnum);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const currentCount = product.images.length;
    if (currentCount + files.length > 5) {
      throw new Error(
        `Cannot upload ${files.length} image(s): product already has ${currentCount} image(s), max is 5`
      );
    }

    for (const file of files) {
      if (file.size > 150 * 1024) {
        throw new Error(`Image "${file.originalname}" exceeds 150KB limit`);
      }
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const index = currentCount + i;
      const url = await uploadItemImage(productEnum, index, file.buffer, file.mimetype);
      uploadedUrls.push(url);
    }

    const updated = await ProductRepository.updateByEnum(productEnum, {
      images: [...product.images, ...uploadedUrls] as unknown as string[],
    } as Partial<IProduct>);

    if (!updated) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return updated;
  }

  async replaceImages(
    productEnum: string,
    files: Express.Multer.File[]
  ): Promise<IProduct> {
    const product = await ProductRepository.findByEnum(productEnum);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    if (files.length > 5) {
      throw new Error('Maximum 5 images allowed per product');
    }

    for (const file of files) {
      if (file.size > 150 * 1024) {
        throw new Error(`Image "${file.originalname}" exceeds 150KB limit`);
      }
    }

    const uploadedUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const url = await uploadItemImage(productEnum, i, files[i].buffer, files[i].mimetype);
      uploadedUrls.push(url);
    }

    const updated = await ProductRepository.updateByEnum(productEnum, {
      images: uploadedUrls,
    } as unknown as Partial<IProduct>);

    if (!updated) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return updated;
  }
}

export default new ProductService();
