import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { badInput } from '../lib/errors';

const s3 = new S3Client({ region: process.env.AWS_REGION ?? 'eu-west-2' });
const BUCKET = process.env.S3_BUCKET_NAME ?? '';
const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp'] as const;
const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function getProfilePhotoUploadUrl(
  userId: string,
  fileName: string,
): Promise<{ url: string; key: string }> {
  if (!BUCKET) throw new Error('S3_BUCKET_NAME is not configured');

  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  if (!ALLOWED_EXTS.includes(ext as (typeof ALLOWED_EXTS)[number])) {
    throw badInput('File must be a JPEG, PNG, or WebP image');
  }

  const key = `profiles/${userId}/${Date.now()}.${ext}`;
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: CONTENT_TYPES[ext],
  });

  const url = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min TTL
  return { url, key };
}
