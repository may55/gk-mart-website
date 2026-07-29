import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';

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
    })
  );

  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
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
