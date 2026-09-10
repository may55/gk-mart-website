import ProductRepository from '../repositories/ProductRepository';;
import CategoryRepository from '../repositories/CategoryRepository';
import { uploadItemImage, deleteItemImage } from '../lib/s3';
import { IProduct } from '../models/Product';;
import { buildProductEnum } from '../utils/product';

interface CreateProductData {
  name: string;
  sku: string;
  sellingPrice: number;
  marketPrice: number;
  expiryMonth?: number;
  expiryYear?: number;
  metadata?: string;
  categories?: string[];
  isVisible?: boolean;
}

interface UpdateProductData {
  name?: string;
  sku?: string;
  sellingPrice?: number;
  marketPrice?: number;
  expiryMonth?: number;
  expiryYear?: number;
  metadata?: string;
  unitsInStock?: number;
  averageCostPrice?: number;
  categories?: string[];
  isVisible?: boolean;
}

class ProductService {
  // Used by public routes — only returns visible products
  /** Returns in-stock products available on the storefront. */
  async getAll(): Promise<IProduct[]> {
    return await ProductRepository.findAll(true);
  }

  // Used by public routes — only returns visible products
  /** Returns one in-stock storefront product by its enum. */
  async getByEnum(productEnum: string): Promise<IProduct> {
    const product = await ProductRepository.findByEnum(productEnum, true);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  /** Returns all products for administrative management, including out-of-stock products. */
  async getAllAdmin(): Promise<IProduct[]> {
    return await ProductRepository.findAll(false);
  }

  /** Returns one product for administration regardless of visibility or stock. */
  async getByEnumAdmin(productEnum: string): Promise<IProduct> {
    const product = await ProductRepository.findByEnum(productEnum, false);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  /** Creates a product identity with manually supplied selling/MRP prices and zero stock. */
  async create(data: CreateProductData): Promise<IProduct> {
    const productEnum = buildProductEnum(data.name, data.sku, data.marketPrice, data.expiryMonth, data.expiryYear);

    const exists = await ProductRepository.existsByEnum(productEnum);
    if (exists) {
      throw new Error(`Product with enum "${productEnum}" already exists`);
    }

    if (data.categories?.length) {
      await Promise.all(data.categories.map((label) => CategoryRepository.findOrCreateByLabel(label)));
    }

    return await ProductRepository.create({ ...data, enum: productEnum, images: [] });
  }

  /** Updates product identity, pricing, metadata, and its derived enum when identity changes. */
  async update(productEnum: string, data: UpdateProductData): Promise<IProduct> {
    if (data.categories?.length) {
      await Promise.all(data.categories.map((label) => CategoryRepository.findOrCreateByLabel(label)));
    }

    const current = await ProductRepository.findByEnum(productEnum);
    if (!current) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    const nextIdentityChanged = data.name !== undefined || data.sku !== undefined ||
      data.marketPrice !== undefined || data.expiryMonth !== undefined || data.expiryYear !== undefined;
    const nextEnum = nextIdentityChanged
      ? buildProductEnum(data.name ?? current.name, data.sku ?? current.sku, data.marketPrice ?? current.marketPrice, data.expiryMonth ?? current.expiryMonth, data.expiryYear ?? current.expiryYear)
      : current.enum;
    if (nextEnum !== current.enum && await ProductRepository.existsByEnum(nextEnum)) {
      throw Object.assign(new Error(`Product with enum "${nextEnum}" already exists`), { statusCode: 409 });
    }

    const product = await ProductRepository.updateByEnum(productEnum, { ...data, enum: nextEnum } as Partial<IProduct>);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return product;
  }

  /** Deletes a product by enum. */
  async delete(productEnum: string): Promise<void> {
    const deleted = await ProductRepository.deleteByEnum(productEnum);
    if (!deleted) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
  }

  /** Uploads additional product images to object storage and appends their URLs. */
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

  /** Deletes one product image from storage and the product document. */
  async deleteImage(productEnum: string, index: number): Promise<IProduct> {
    const product = await ProductRepository.findByEnum(productEnum);
    if (!product) throw Object.assign(new Error('Product not found'), { statusCode: 404 });

    if (index < 0 || index >= product.images.length) {
      throw Object.assign(new Error('Image index out of range'), { statusCode: 400 });
    }

    const [imageUrl] = product.images.splice(index, 1);

    try {
      await deleteItemImage(imageUrl);
    } catch {
      // S3 delete failure should not block DB cleanup
    }

    const updated = await ProductRepository.updateByEnum(productEnum, {
      images: product.images,
    } as unknown as Partial<IProduct>);

    if (!updated) throw Object.assign(new Error('Product not found'), { statusCode: 404 });
    return updated;
  }

  /** Replaces all product images in object storage and the product document. */
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
