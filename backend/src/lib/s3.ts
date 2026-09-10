import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const getS3Client = (): S3Client => {
  return new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });
};

const getBucket = (): string => {
  const bucket = process.env.AWS_S3_BUCKET;
  if (!bucket) throw new Error('AWS_S3_BUCKET environment variable is not set');
  return bucket;
};

// TODO: uncomment CDN branch once CloudFront is configured
const resolveImageUrl = (bucket: string, key: string): string => {
  // const cdn = process.env.CDN_BASE_URL;
  // if (cdn) return `${cdn}/${key}`;
  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};

export const uploadItemImage = async (
  itemEnum: string,
  index: number,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  const s3 = getS3Client();
  const bucket = getBucket();

  const ext = mimeType.split('/')[1] ?? 'jpg';
  const key = `items/${itemEnum}/image_${index}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
      ACL: 'public-read',
    })
  );

  return resolveImageUrl(bucket, key);
};

export const uploadInventoryBill = async (
  itemEnum: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string> => {
  const s3 = getS3Client();
  const bucket = getBucket();
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const key = `inventory/${itemEnum}/bill_${Date.now()}.${ext}`;
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    CacheControl: 'private, max-age=31536000',
    ACL: 'public-read',
  }));
  return resolveImageUrl(bucket, key);
};

/** Uploads or replaces the image used for a product category. */
export const uploadCategoryImage = async (
  categoryId: string,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<string> => {
  const s3 = getS3Client();
  const bucket = getBucket();
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const key = `categories/${categoryId}/image_${Date.now()}.${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType,
      CacheControl: 'public, max-age=31536000',
      ACL: 'public-read',
    }),
  );

  return resolveImageUrl(bucket, key);
};

export const deleteItemImage = async (imageUrl: string): Promise<void> => {
  const s3 = getS3Client();
  const bucket = getBucket();

  const url = new URL(imageUrl);
  const key = url.pathname.replace(/^\//, '');

  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};

export const getItemImageKey = (itemEnum: string, index: number, ext: string): string => {
  return `items/${itemEnum}/image_${index}.${ext}`;
};
