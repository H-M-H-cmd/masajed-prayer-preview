import { AxiosInstance } from 'axios';
import { apiClient } from '@/lib/api-client';
import { ApiResponse, PaginatedResponse } from '@/types/api';

export class BaseService {
  protected api: AxiosInstance;
  protected endpoint: string;

  constructor(endpoint: string) {
    this.api = apiClient.getAxiosInstance();
    this.endpoint = endpoint;
  }

  protected handleError(error: any): never {
    if (error.response?.data?.message) {
      throw {
        message: error.response.data.message,
        status: error.response.status,
        errors: error.response.data.errors,
      };
    }
    throw {
      message: 'An unexpected error occurred',
      status: 500,
    };
  }

  async getAll<T>(params?: Record<string, any>): Promise<PaginatedResponse<T>> {
    const { data } = await this.api.get<PaginatedResponse<T>>(this.endpoint, { params });
    return data;
  }

  async getById<T>(id: string | number): Promise<ApiResponse<T>> {
    const { data } = await this.api.get<ApiResponse<T>>(`${this.endpoint}/${id}`);
    return data;
  }

  async create<T>(payload: Partial<T>): Promise<ApiResponse<T>> {
    const { data } = await this.api.post<ApiResponse<T>>(this.endpoint, payload);
    return data;
  }

  async update<T>(id: string | number, payload: Partial<T>): Promise<ApiResponse<T>> {
    const { data } = await this.api.put<ApiResponse<T>>(`${this.endpoint}/${id}`, payload);
    return data;
  }

  async delete(id: string | number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return data;
  }
} 