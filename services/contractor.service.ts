import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';

export type ContractorStatus = 'active' | 'inactive' | 'suspended' | 'blacklisted';
export type ContractorType = 'company' | 'individual' | 'partnership';

export interface Contractor {
  id: number;
  code: string;
  name: string;
  type: ContractorType;
  status: ContractorStatus;
  email: string;
  phone: string;
  license_number: string;
  tax_number?: string;
  organization_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContractorData {
  name: string;
  type: ContractorType;
  status: ContractorStatus;
  email: string;
  phone: string;
  license_number: string;
  tax_number?: string;
  organization_id?: number;
}

export interface ContractorPaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

export interface ContractorPaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface ContractorPaginatedResponse {
  message: string;
  data: {
    data: Contractor[];
    links: ContractorPaginationLinks;
    meta: ContractorPaginationMeta;
  };
}

class ContractorService extends BaseService {
  constructor() {
    super('/contractors');
  }

  async getContractors(params: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<ContractorPaginatedResponse> {
    const { data } = await this.api.get<ContractorPaginatedResponse>(this.endpoint, { params });
    return data;
  }

  async getContractor(id: number): Promise<ApiResponse<Contractor>> {
    const { data } = await this.api.get<ApiResponse<Contractor>>(`${this.endpoint}/${id}`);
    return data;
  }

  async createContractor(contractorData: CreateContractorData): Promise<ApiResponse<Contractor>> {
    const { data } = await this.api.post<ApiResponse<Contractor>>(this.endpoint, contractorData);
    return data;
  }

  async updateContractor(id: number, contractorData: Partial<CreateContractorData>): Promise<ApiResponse<Contractor>> {
    const { data } = await this.api.put<ApiResponse<Contractor>>(`${this.endpoint}/${id}`, contractorData);
    return data;
  }

  async deleteContractor(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return data;
  }
}

export const contractorService = new ContractorService(); 