import { BaseService } from './base.service';
import { ApiResponse, PaginationParams } from '@/types/api';
import { MosquePaginatedResponse, Mosque, CreateMosqueData } from '@/types/mosque'

class MosqueService extends BaseService {
  constructor() {
    super('/mosques');
  }

  async getMosques(params?: {
    search?: string;
    page?: number;
    per_page?: number;
    includes?: string[];
    all?: boolean;
  }): Promise<MosquePaginatedResponse> {
    const { data } = await this.api.get<MosquePaginatedResponse>(this.endpoint, { 
      params: {
        ...params,
        includes: params?.includes?.join(','),
        ...(params?.all && { per_page: 1000 })
      }
    });
    return data;
  }

  async getMosque(id: string|number): Promise<ApiResponse<Mosque>> {
    const { data } = await this.api.get<ApiResponse<Mosque>>(`${this.endpoint}/${id}`);
    return data;
  }

  async createMosque(mosqueData: CreateMosqueData): Promise<ApiResponse<Mosque>> {
    const { data } = await this.api.post<ApiResponse<Mosque>>(this.endpoint, mosqueData);
    return data;
  }

  async updateMosque(id: string, mosqueData: CreateMosqueData): Promise<ApiResponse<Mosque>> {
    

    const { data } = await this.api.put<ApiResponse<Mosque>>(`${this.endpoint}/${id}`, mosqueData);
    return data;
  }

  async deleteMosque(id: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return data;
  }

  async getAssets(params?: PaginationParams) {
    // ... implementation
  }

  async getFacilities(params?: PaginationParams) {
    // ... implementation
  }

  async updateMosqueFacilities(mosqueId: string, facilities: { id: string; value: number | null }[]): Promise<ApiResponse<Mosque>> {
    const { data } = await this.api.put<ApiResponse<Mosque>>(`${this.endpoint}/${mosqueId}`, {
      facilities
    });
    return data;
  }
}

export const mosqueService = new MosqueService(); 