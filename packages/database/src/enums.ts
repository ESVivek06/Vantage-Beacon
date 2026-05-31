// Enum values mirrored from schema.prisma so they compile without running `prisma generate`.
// Values MUST stay in sync with the Prisma schema.

export const UserRole = {
  freelancer: 'freelancer',
  founder: 'founder',
  investor: 'investor',
  supplier: 'supplier',
  stakeholder: 'stakeholder',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Region = {
  UK: 'UK',
  IN: 'IN',
  NA: 'NA',
} as const;
export type Region = (typeof Region)[keyof typeof Region];

export const ConnectionStatus = {
  pending: 'pending',
  accepted: 'accepted',
  declined: 'declined',
} as const;
export type ConnectionStatus = (typeof ConnectionStatus)[keyof typeof ConnectionStatus];

export const ConnectionKind = {
  collaboration: 'collaboration',
  investment: 'investment',
  supply: 'supply',
  mentorship: 'mentorship',
} as const;
export type ConnectionKind = (typeof ConnectionKind)[keyof typeof ConnectionKind];

export const ProjectStatus = {
  draft: 'draft',
  open: 'open',
  in_progress: 'in_progress',
  completed: 'completed',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

export const InvestmentStage = {
  seed: 'seed',
  pre_series_a: 'pre_series_a',
  series_a: 'series_a',
  growth: 'growth',
} as const;
export type InvestmentStage = (typeof InvestmentStage)[keyof typeof InvestmentStage];

export const InvestmentStatus = {
  interested: 'interested',
  term_sheet: 'term_sheet',
  closed: 'closed',
  declined: 'declined',
} as const;
export type InvestmentStatus = (typeof InvestmentStatus)[keyof typeof InvestmentStatus];

export const AuditAction = {
  login: 'login',
  logout: 'logout',
  data_export: 'data_export',
  data_delete: 'data_delete',
  consent_granted: 'consent_granted',
  consent_revoked: 'consent_revoked',
} as const;
export type AuditAction = (typeof AuditAction)[keyof typeof AuditAction];

export const GdprRequestType = {
  export: 'export',
  delete: 'delete',
} as const;
export type GdprRequestType = (typeof GdprRequestType)[keyof typeof GdprRequestType];

export const GdprRequestStatus = {
  pending: 'pending',
  processing: 'processing',
  completed: 'completed',
  failed: 'failed',
} as const;
export type GdprRequestStatus = (typeof GdprRequestStatus)[keyof typeof GdprRequestStatus];

export const ConsentType = {
  marketing: 'marketing',
  analytics: 'analytics',
  functional: 'functional',
} as const;
export type ConsentType = (typeof ConsentType)[keyof typeof ConsentType];
