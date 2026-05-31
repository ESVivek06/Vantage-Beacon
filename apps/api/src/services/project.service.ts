import { getClientForRegion, Region, ProjectStatus } from '@vb/database';
import { notFound, forbidden } from '../lib/errors';

interface CreateProjectInput {
  title: string;
  description?: string;
  requiredSkills: string[];
  budget?: Record<string, unknown>;
  region: Region;
}

interface UpdateProjectInput {
  title?: string;
  description?: string;
  status?: ProjectStatus;
  requiredSkills?: string[];
  budget?: Record<string, unknown>;
}

interface ProjectFilter {
  status?: ProjectStatus;
  region?: Region;
  skills?: string[];
}

export async function createProject(
  ownerId: string,
  ownerRegion: Region,
  input: CreateProjectInput,
) {
  const db = getClientForRegion(ownerRegion);
  return db.project.create({
    data: {
      ownerId,
      title: input.title,
      description: input.description,
      requiredSkills: input.requiredSkills,
      budget: input.budget as unknown | undefined,
      region: input.region,
    },
    include: { owner: { include: { profile: true } } },
  });
}

export async function updateProject(
  id: string,
  ownerId: string,
  region: Region,
  input: UpdateProjectInput,
) {
  const db = getClientForRegion(region);
  const existing = await db.project.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw notFound('Project');
  if (existing.ownerId !== ownerId) throw forbidden('Not the project owner');

  return db.project.update({
    where: { id },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.requiredSkills !== undefined ? { requiredSkills: input.requiredSkills } : {}),
      ...(input.budget !== undefined
        ? { budget: input.budget as unknown }
        : {}),
    },
    include: { owner: { include: { profile: true } } },
  });
}

export async function deleteProject(id: string, ownerId: string, region: Region) {
  const db = getClientForRegion(region);
  const existing = await db.project.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw notFound('Project');
  if (existing.ownerId !== ownerId) throw forbidden('Not the project owner');

  await db.project.update({ where: { id }, data: { deletedAt: new Date() } });
  return true;
}

export async function getProjectById(id: string, region: Region) {
  const db = getClientForRegion(region);
  const project = await db.project.findFirst({
    where: { id, deletedAt: null },
    include: { owner: { include: { profile: true } } },
  });
  if (!project) throw notFound('Project');
  return project;
}

export async function listProjects(
  region: Region,
  filter: ProjectFilter,
  opts: { limit?: number; offset?: number },
) {
  const db = getClientForRegion(region);
  return db.project.findMany({
    where: {
      deletedAt: null,
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.region ? { region: filter.region } : {}),
      ...(filter.skills?.length ? { requiredSkills: { hasSome: filter.skills } } : {}),
    },
    include: { owner: { include: { profile: true } } },
    take: Math.min(opts.limit ?? 20, 100),
    skip: opts.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}

export async function listMyProjects(ownerId: string, region: Region) {
  const db = getClientForRegion(region);
  return db.project.findMany({
    where: { ownerId, deletedAt: null },
    include: { owner: { include: { profile: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
