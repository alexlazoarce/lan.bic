import { Contract, ContractStatus, ContractType } from '../../../types/contract';

export interface ContractDTO {
  title: string;
  description: string;
  type: ContractType;
  partyName: string;
  partyEmail: string;
  partyPhone?: string;
  value: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  renewalTerms?: string;
  autoRenewal?: boolean;
  terminationClause?: string;
  customFields?: Record<string, any>;
  attachments?: string[];
  notes?: string;
}

export interface ContractListResponse {
  data: Contract[];
  total: number;
}

export interface ContractHistoryEntry {
  id: string;
  changeType: string;
  changes: Record<string, any>;
  comments?: string;
  createdAt: Date;
  user: {
    id: number;
    email: string;
  };
}

const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export const contractsApi = {
  getContracts: async (): Promise<ContractListResponse> => {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error fetching contracts');
    return response.json();
  },

  getContractById: async (id: string): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error fetching contract');
    return response.json();
  },

  createContract: async (contract: ContractDTO): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(contract),
    });
    if (!response.ok) throw new Error('Error creating contract');
    return response.json();
  },

  updateContract: async (id: string, contract: Partial<ContractDTO>): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(contract),
    });
    if (!response.ok) throw new Error('Error updating contract');
    return response.json();
  },

  changeStatus: async (id: string, status: ContractStatus, comments?: string): Promise<Contract> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ status, comments }),
    });
    if (!response.ok) throw new Error('Error changing contract status');
    return response.json();
  },

  getContractHistory: async (id: string): Promise<ContractHistoryEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/contracts/${id}/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) throw new Error('Error fetching contract history');
    return response.json();
  },
};