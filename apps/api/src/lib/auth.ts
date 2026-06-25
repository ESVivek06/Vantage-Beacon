import jwt from 'jsonwebtoken';
import { UserRole, Region } from '@vb/database';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production';
const EXPIRES_IN = (process.env.JWT_EXPIRES_IN ?? '7d') as string;

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  region: Region;
}

export function signToken(payload: JwtPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN as any });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, SECRET) as unknown as JwtPayload;
}
