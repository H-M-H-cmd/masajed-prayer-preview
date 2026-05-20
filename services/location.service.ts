import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';
import { Location, CreateLocationData, RegionPaginatedResponse, CityPaginatedResponse, DistrictPaginatedResponse } from '@/types/location';

class LocationService extends BaseService {
  constructor() {
    super('/locations');
  }

  async getLocation(id: string): Promise<ApiResponse<Location>> {
    const { data } = await this.api.get<ApiResponse<Location>>(`${this.endpoint}/${id}`);
    return data;
  }

  async createLocation(data: CreateLocationData): Promise<ApiResponse<Location>> {
    const { data: response } = await this.api.post<ApiResponse<Location>>(this.endpoint, data);
    return response;
  }

  async updateLocation(id: string, data: CreateLocationData): Promise<ApiResponse<Location>> {
    const { data: response } = await this.api.put<ApiResponse<Location>>(`${this.endpoint}/${id}`, data);
    return response;
  }

  async deleteLocation(id: string): Promise<ApiResponse<Location>> {
    const { data: response } = await this.api.delete<ApiResponse<Location>>(`${this.endpoint}/${id}`);
    return response;
  }

  async getRegions(params: { search?: string; page?: number; per_page?: number; }): Promise<RegionPaginatedResponse> {
    const { data } = await this.api.get<RegionPaginatedResponse>('/regions', { params });
    return data;
  }

  async getCities(regionId: string = '', params: { search?: string; page?: number; per_page?: number; }): Promise<CityPaginatedResponse> {
    const { data } = await this.api.get<CityPaginatedResponse>('/cities', { 
      params: {
        ...params,
        // region_id: regionId
      }
    });
    return data;
  }

  async getDistricts(cityId: string, params: { search?: string; page?: number; per_page?: number; }): Promise<DistrictPaginatedResponse> {
    const { data } = await this.api.get<DistrictPaginatedResponse>('/districts', { 
      params: {
        ...params,
        city_id: cityId
      }
    });
    return data;
  }
}

export const locationService = new LocationService(); 