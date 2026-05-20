import { CreateMosqueMemberData, MemberPaginatedResponse, MosqueMember } from '@/types/mosque-member';
import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';



class MemberService extends BaseService {
  constructor() {
    super('/organizations/members');
  }

  async getMembers(params: {
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: string;
    sort_direction?: 'asc' | 'desc';
  }): Promise<MemberPaginatedResponse> {
    const { data } = await this.api.get<MemberPaginatedResponse>(this.endpoint, { params });
    return data;
  }

  async getMember(id: string): Promise<ApiResponse<MosqueMember>> {
    const { data } = await this.api.get<ApiResponse<MosqueMember>>(`${this.endpoint}/${id}`);
    return data;
  }

  async createMember(memberData: CreateMosqueMemberData): Promise<ApiResponse<MosqueMember>> {
    const { data } = await this.api.post<ApiResponse<MosqueMember>>(this.endpoint, memberData);
    return data;
  }

  async updateMember(id: string, memberData: Partial<CreateMosqueMemberData>): Promise<ApiResponse<MosqueMember>> {
    const { data } = await this.api.put<ApiResponse<MosqueMember>>(`${this.endpoint}/${id}`, memberData);
    return data;
  }

  async deleteMember(id: string): Promise<ApiResponse<void>> {
    const { data } = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return data;
  }
}

export const memberService = new MemberService(); 