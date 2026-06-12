export type UserRole = 'freelancer' | 'founder' | 'investor' | 'supplier' | 'stakeholder';

export interface ProfileCore {
  id: string;
  displayName: string;
  bio?: string;
  skills: string[];
  tags: string[];
  verified: boolean;
}

export interface ProfileUser {
  id: string;
  email: string;
  role: UserRole;
  region: string;
  photoUrl?: string;
  profile?: ProfileCore;
  ownedProjects: ProjectStub[];
}

export interface ProjectStub {
  id: string;
  title: string;
  status: string;
  description?: string;
  requiredSkills: string[];
  region?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  role?: string;
  year?: string;
  thumbnailUrl?: string;
  url?: string;
  technologies?: string[];
}

export interface WorkHistoryItem {
  id: string;
  title: string;
  company: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  outcome?: string;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  authorTitle?: string;
  authorPhotoUrl?: string;
  rating: number;
  date: string;
  content: string;
}

/** Parse role-specific metadata stored in tags as "key:value" entries */
export function parseTagMeta(tags: string[]): Record<string, string> {
  const meta: Record<string, string> = {};
  for (const tag of tags) {
    const colonIdx = tag.indexOf(':');
    if (colonIdx > 0) {
      const key = tag.slice(0, colonIdx).trim();
      const val = tag.slice(colonIdx + 1).trim();
      meta[key] = val;
    }
  }
  return meta;
}

/** Return only plain tags (no key:value pairs) */
export function plainTags(tags: string[]): string[] {
  return tags.filter((t) => !t.includes(':'));
}

export const ROLE_COLORS: Record<string, { cover: string; chip: string; accent: string }> = {
  freelancer: {
    cover: 'from-teal-800 to-teal-600',
    chip: 'bg-teal-100 text-teal-700',
    accent: 'text-teal-600',
  },
  founder: {
    cover: 'from-primary-800 to-primary-600',
    chip: 'bg-primary-100 text-primary-700',
    accent: 'text-primary-600',
  },
  investor: {
    cover: 'from-amber-800 to-amber-600',
    chip: 'bg-amber-100 text-amber-700',
    accent: 'text-amber-600',
  },
  supplier: {
    cover: 'from-violet-800 to-violet-600',
    chip: 'bg-violet-100 text-violet-700',
    accent: 'text-violet-600',
  },
};
