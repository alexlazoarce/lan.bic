export enum ContractStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  TERMINATED = 'terminated',
  EXPIRED = 'expired'
}

export enum ContractType {
  SERVICE = 'service',
  PRODUCT = 'product',
  LICENSING = 'licensing',
  MAINTENANCE = 'maintenance',
  CONSULTING = 'consulting'
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string;
  type: ContractType;
  status: ContractStatus;
  partyName: string;
  partyEmail: string;
  partyPhone?: string;
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  renewalTerms?: string;
  autoRenewal: boolean;
  terminationClause?: string;
  customFields?: Record<string, any>;
  attachments?: string[];
  createdBy: {
    id: number;
    email: string;
  };
  lastModifiedBy: {
    id: number;
    email: string;
  };
  approvedBy?: {
    id: number;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  notes?: string;
  isActive: boolean;
}