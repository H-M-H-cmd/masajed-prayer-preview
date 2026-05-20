import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';

export interface Asset {
  id: string;
  name: string;
  name_ar: string;
  facility_id: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface AssetPaginationMeta {
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

export interface AssetPaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface AssetPaginatedResponse {
  message: string;
  data: {
    data: Asset[];
    links: AssetPaginationLinks;
    meta: AssetPaginationMeta;
  };
}

// Mock data — used in preview/development mode
const mockAssets: Asset[] = [
  { id: '1', name: 'Air Conditioner', name_ar: 'مكيف هواء', facility_id: '1', created_at: null, updated_at: null },
  { id: '2', name: 'Carpet', name_ar: 'سجاد', facility_id: '1', created_at: null, updated_at: null },
  { id: '3', name: 'Quran Copy', name_ar: 'مصحف', facility_id: '1', created_at: null, updated_at: null },
  { id: '4', name: 'Water Tap', name_ar: 'صنبور مياه', facility_id: '1', created_at: null, updated_at: null },
  { id: '5', name: 'Surveillance Camera', name_ar: 'كاميرا مراقبة', facility_id: '1', created_at: null, updated_at: null },
  { id: '6', name: 'LED Light', name_ar: 'إضاءة LED', facility_id: '1', created_at: null, updated_at: null },
  { id: '7', name: 'Speaker', name_ar: 'مكبر صوت', facility_id: '1', created_at: null, updated_at: null },
  { id: '8', name: 'Ablution Heater', name_ar: 'سخان مياه الوضوء', facility_id: '1', created_at: null, updated_at: null },
  { id: '9', name: 'Door', name_ar: 'باب', facility_id: '1', created_at: null, updated_at: null },
  { id: '10', name: 'Bookshelf', name_ar: 'رف كتب', facility_id: '1', created_at: null, updated_at: null },
];

class AssetService extends BaseService {
  constructor() {
    super('/assets');
  }

  async getAssets(params?: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<AssetPaginatedResponse> {
    // In development, return mock data
    if (process.env.NEXT_PUBLIC_APP_ENV === 'development') {
      return new Promise((resolve) => {
        setTimeout(() => {
          let filtered = [...mockAssets];

          if (params?.search) {
            const q = params.search.toLowerCase();
            filtered = filtered.filter(
              (a) =>
                a.name.toLowerCase().includes(q) ||
                a.name_ar.includes(params.search as string)
            );
          }

          const page = params?.page || 1;
          const per_page = params?.per_page || 10;
          const start = (page - 1) * per_page;
          const end = start + per_page;
          const paginated = filtered.slice(start, end);

          resolve({
            message: 'Assets retrieved successfully',
            data: {
              data: paginated,
              meta: {
                current_page: page,
                from: start + 1,
                last_page: Math.ceil(filtered.length / per_page),
                path: '/assets',
                per_page,
                to: Math.min(end, filtered.length),
                total: filtered.length,
                links: [],
              },
              links: {
                first: '/assets?page=1',
                last: `/assets?page=${Math.ceil(filtered.length / per_page)}`,
                prev: page > 1 ? `/assets?page=${page - 1}` : null,
                next: end < filtered.length ? `/assets?page=${page + 1}` : null,
              },
            },
          });
        }, 300);
      });
    }

    const { data } = await this.api.get<AssetPaginatedResponse>(this.endpoint, { params });
    return data;
  }

  async getAsset(id: number): Promise<ApiResponse<Asset>> {
    const { data } = await this.api.get<ApiResponse<Asset>>(`${this.endpoint}/${id}`);
    return data;
  }

  async createAsset(assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    const { data } = await this.api.post<ApiResponse<Asset>>(this.endpoint, assetData);
    return data;
  }

  async updateAsset(id: number, assetData: Partial<Asset>): Promise<ApiResponse<Asset>> {
    const { data } = await this.api.put<ApiResponse<Asset>>(`${this.endpoint}/${id}`, assetData);
    return data;
  }

  async deleteAsset(id: number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return data;
  }
}

export const assetService = new AssetService();
