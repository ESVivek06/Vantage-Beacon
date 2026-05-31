import { UserRole } from '@vb/database';
import type { GraphQLContext } from '../graphql/context';
import { unauthenticated, forbidden } from './errors';

export function requireAuth(ctx: GraphQLContext) {
  if (!ctx.user) throw unauthenticated();
  return ctx.user;
}

export function requireRole(ctx: GraphQLContext, ...roles: UserRole[]) {
  const user = requireAuth(ctx);
  if (!roles.includes(user.role)) {
    throw forbidden(`This operation requires role: ${roles.join(' or ')}`);
  }
  return user;
}
