import type { GraphQLContext } from '../context';
import { requireAuth, requireRole } from '../../lib/rbac';
import { validate, createProjectSchema } from '../../lib/validation';
import {
  createProject,
  updateProject,
  deleteProject,
  getProjectById,
  listProjects,
  listMyProjects,
} from '../../services/project.service';
import { UserRole, type ProjectStatus, type Region } from '@vb/database';

export const projectResolvers = {
  Query: {
    project: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireAuth(ctx);
      return getProjectById(id, ctx.user!.region);
    },

    projects: async (
      _: unknown,
      args: {
        filter?: { status?: ProjectStatus; region?: Region; skills?: string[] };
        limit?: number;
        offset?: number;
      },
      ctx: GraphQLContext,
    ) => {
      requireAuth(ctx);
      return listProjects(ctx.user!.region, args.filter ?? {}, {
        limit: args.limit,
        offset: args.offset,
      });
    },

    myProjects: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      requireRole(ctx, UserRole.founder);
      return listMyProjects(ctx.user!.sub, ctx.user!.region);
    },
  },

  Mutation: {
    createProject: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          title: string;
          description?: string;
          requiredSkills: string[];
          budget?: Record<string, unknown>;
          region: Region;
        };
      },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.founder);
      validate(createProjectSchema, {
        title: input.title,
        description: input.description,
        requiredSkills: input.requiredSkills,
      });
      return createProject(ctx.user!.sub, ctx.user!.region, input);
    },

    updateProject: async (
      _: unknown,
      {
        id,
        input,
      }: {
        id: string;
        input: {
          title?: string;
          description?: string;
          status?: ProjectStatus;
          requiredSkills?: string[];
          budget?: Record<string, unknown>;
        };
      },
      ctx: GraphQLContext,
    ) => {
      requireRole(ctx, UserRole.founder);
      return updateProject(id, ctx.user!.sub, ctx.user!.region, input);
    },

    deleteProject: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      requireRole(ctx, UserRole.founder);
      return deleteProject(id, ctx.user!.sub, ctx.user!.region);
    },
  },

  Project: {
    owner: (parent: Record<string, unknown>) => parent['owner'],
  },
};
