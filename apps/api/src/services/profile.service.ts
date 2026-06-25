import { getClientForRegion, Region } from '@vb/database';
import { notFound } from '../lib/errors';
import { embeddingQueue } from '../workers/queues';
import { buildProfileText } from '../matching/embeddingService';

interface UpdateProfileInput {
  displayName?: string;
  bio?: string;
  skills?: string[];
  tags?: string[];
  profileData?: Record<string, unknown>;
  photoKey?: string;
}

const S3_BUCKET_URL = process.env.S3_BUCKET_URL ?? '';

export async function getProfile(userId: string, region: Region) {
  const db = getClientForRegion(region);
  const profile = await db.profile.findFirst({
    where: { userId, deletedAt: null },
    include: { user: true },
  });
  if (!profile) throw notFound('Profile');
  return profile;
}

export async function updateProfile(
  userId: string,
  region: Region,
  input: UpdateProfileInput,
) {
  const db = getClientForRegion(region);

  const profileUpdateData: {
    displayName?: string;
    bio?: string;
    skills?: string[];
    tags?: string[];
  } = {};
  if (input.displayName !== undefined) profileUpdateData.displayName = input.displayName;
  if (input.bio !== undefined) profileUpdateData.bio = input.bio;
  if (input.skills !== undefined) profileUpdateData.skills = input.skills;
  if (input.tags !== undefined) profileUpdateData.tags = input.tags;

  const hasUserDataUpdate = input.profileData !== undefined || input.photoKey !== undefined;

  return db.$transaction(async (tx: any) => {
    const profile = await tx.profile.update({
      where: { userId },
      data: profileUpdateData,
      include: { user: true },
    });

    if (hasUserDataUpdate) {
      const existing = (profile.user.profileData ?? {}) as Record<string, unknown>;
      const merged: Record<string, unknown> = {
        ...existing,
        ...(input.profileData ?? {}),
        ...(input.photoKey
          ? { photoKey: input.photoKey, photoUrl: `${S3_BUCKET_URL}/${input.photoKey}` }
          : {}),
      };
      await tx.user.update({
        where: { id: userId },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: { profileData: merged as any },
      });
      // Re-fetch so the returned profile has the updated user.profileData
      return tx.profile.findUniqueOrThrow({
        where: { userId },
        include: { user: true },
      });
    }

    return profile;
  });
}

export async function queueProfileEmbedding(
  userId: string,
  profile: { bio?: string | null; skills?: string[]; tags?: string[] },
): Promise<void> {
  const text = buildProfileText({ bio: profile.bio, skills: profile.skills, tags: profile.tags });
  if (!text.trim()) return;
  await embeddingQueue.add('embed-profile', { entityId: userId, entityType: 'user', text });
}
