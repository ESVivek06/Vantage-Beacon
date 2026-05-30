export { PrismaClient } from '@prisma/client';
export type {
  User,
  Profile,
  Project,
  Connection,
  Match,
  Investment,
  Message,
  Prisma,
} from '@prisma/client';
export {
  UserRole,
  Region,
  ConnectionStatus,
  ConnectionKind,
  ProjectStatus,
  InvestmentStage,
  InvestmentStatus,
} from '@prisma/client';

export { getClient, getClientForRegion, disconnectAll } from './client';
