import { CreateMosqueMemberData, MembershipType, MosqueMember } from '@/types/mosque-member';
import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';

class MosqueMemberService extends BaseService {
  constructor() {
    super('/prayers');
  }

  async createMember(data: CreateMosqueMemberData): Promise<ApiResponse<MosqueMember>> {
    const { data: response } = await this.api.post<ApiResponse<MosqueMember>>(this.endpoint, data);
    return response;
  }

  async attachToMosque(prayerId: string, mosqueId: string, membership: MembershipType): Promise<ApiResponse<void>> {
    const { data } = await this.api.post<ApiResponse<void>>(
      `${this.endpoint}/${prayerId}/mosques/${mosqueId}/attach`,
      { membership }
    );
    return data;
  }

  async getMosqueMembers(mosqueId: string): Promise<ApiResponse<MosqueMember[]>> {
    const { data } = await this.api.get<ApiResponse<MosqueMember[]>>(`/mosques/${mosqueId}/members`);
    return data;
  }

  async updateMember(id: string, data: Partial<CreateMosqueMemberData>): Promise<ApiResponse<MosqueMember>> {
    const { data: response } = await this.api.put<ApiResponse<MosqueMember>>(`${this.endpoint}/${id}`, data);
    return response;
  }

  async detachFromMosque(prayerId: string, mosqueId: string|number): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(
      `${this.endpoint}/${prayerId}/mosques/${mosqueId}/detach`
    );
    return data;
  }
}

export const mosqueMemberService = new MosqueMemberService(); 