export type EscrowStatus =
  | 'INITIATED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'MILESTONE_RELEASED'
  | 'COMPLETED'
  | 'DECLINED'
  | 'DISPUTED'
  | 'RESOLVED'
  | 'REFUNDED';

export type MilestoneStatus = 'PENDING' | 'RELEASED';

export type DisputeStatus =
  | 'OPEN'
  | 'UNDER_REVIEW'
  | 'RESOLVED'
  | 'ESCALATED'
  | 'REFUNDED';

export type PaymentStructure = 'single' | 'milestone';

export interface EscrowParty {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  trustTier?: number;
}

export interface EscrowMilestone {
  id: string;
  description: string;
  amount: number;
  status: MilestoneStatus;
  releasedAt?: string;
  releasedBy?: string;
}

export interface DisputeMessage {
  id: string;
  authorName: string;
  authorRole: 'founder' | 'counterparty' | 'mediator';
  content: string;
  createdAt: string;
}

export interface EscrowDispute {
  id: string;
  ref: string;
  status: DisputeStatus;
  reason: string;
  description: string;
  openedBy: string;
  openedAt: string;
  messages: DisputeMessage[];
  evidenceCount?: number;
}

export interface EscrowTimelineEvent {
  id: string;
  description: string;
  date: string;
  actor?: string;
}

export interface Escrow {
  id: string;
  ref: string;
  title: string;
  status: EscrowStatus;
  currency: string;
  totalAmount: number;
  paymentStructure: PaymentStructure;
  releaseConditions: string;
  createdAt: string;
  founder: EscrowParty;
  counterparty: EscrowParty;
  milestones: EscrowMilestone[];
  timeline: EscrowTimelineEvent[];
  dispute?: EscrowDispute;
}
