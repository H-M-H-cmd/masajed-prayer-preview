import { BaseService } from './base.service';
import { FacilityPaginatedResponse } from '@/types/facility';

class FacilityService extends BaseService {
  constructor() {
    super('/facilities');
  }

  async getFacilities(params?: { per_page?: number }): Promise<FacilityPaginatedResponse> {
    const { data } = await this.api.get<FacilityPaginatedResponse>(this.endpoint, { params });
    return data;
  }
}

export const facilityService = new FacilityService(); 