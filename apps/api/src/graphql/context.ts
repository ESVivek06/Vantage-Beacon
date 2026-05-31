import type { Request } from 'express';
import type { Context as WsContext } from 'graphql-ws';
import { getClientForRegion } from '@vb/database';
import type { PrismaClient } from '@prisma/client';
import { verifyToken, type JwtPayload } from '../lib/auth';

export interface GraphQLContext {
  user: JwtPayload | null;
  db: PrismaClient | null;
}

function fromToken(token: string): GraphQLContext {
  try {
    const user = verifyToken(token);
    return { user, db: getClientForRegion(user.region) };
  } catch {
    return { user: null, db: null };
  }
}

export async function buildContext({ req }: { req: Request }): Promise<GraphQLContext> {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return { user: null, db: null };
  return fromToken(auth.slice(7));
}

export async function buildSubscriptionContext(ctx: WsContext): Promise<GraphQLContext> {
  const auth = ctx.connectionParams?.Authorization as string | undefined;
  if (!auth?.startsWith('Bearer ')) return { user: null, db: null };
  return fromToken(auth.slice(7));
}
