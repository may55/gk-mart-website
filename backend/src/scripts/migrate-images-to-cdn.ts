import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../config/database';
import Product from '../models/Product';

const migrateImagesToCdn = async () => {
  const cdnBase = process.env.CDN_BASE_URL;
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION || 'us-east-1';

  if (!cdnBase) throw new Error('CDN_BASE_URL is not set');
  if (!bucket) throw new Error('AWS_S3_BUCKET is not set');

  const s3Origin = `https://${bucket}.s3.${region}.amazonaws.com/`;

  await connectDB();

  const products = await Product.find({ images: { $regex: 'amazonaws\\.com' } });
  console.log(`Found ${products.length} product(s) with S3 URLs to migrate`);

  let updated = 0;
  for (const product of products) {
    const newImages = product.images.map((url) =>
      url.startsWith(s3Origin) ? `${cdnBase}/${url.slice(s3Origin.length)}` : url
    );
    await Product.findByIdAndUpdate(product._id, { $set: { images: newImages } });
    updated++;
    console.log(`  ✓ ${product.enum}`);
  }

  console.log(`\nMigrated ${updated} product(s) to CDN URLs`);
  await disconnectDB();
};

migrateImagesToCdn().catch((err) => {
  console.error(err);
  process.exit(1);
});
