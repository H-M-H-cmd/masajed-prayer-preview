import { ApiResponse, PaginatedResponse } from "@/types/api";
import { VolunteerOpportunity, VolunteerPaginatedResponse } from "@/types/volunteer";
import { BaseService } from "./base.service";
import { VolunteerFormValues } from "@/components/modules/volunteers/schema";

class VolunteerService extends BaseService {
  constructor() {
    super("/volunteer-opportunities");
  }

  async getVolunteers(params?: {
    page?: number;
    perPage?: number;
    search?: string;
    sort?: { key: keyof VolunteerOpportunity; direction: "asc" | "desc" };
    mosque_id?: string;
  }): Promise<ApiResponse<VolunteerPaginatedResponse>> {
    const queryParams = new URLSearchParams();

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params?.perPage) {
      queryParams.append("per_page", params.perPage.toString());
    }
    if (params?.search) {
      queryParams.append("search", params.search);
    }
    if (params?.sort) {
      queryParams.append("sort_by", params.sort.key);
      queryParams.append("sort_direction", params.sort.direction);
    }
    if (params?.mosque_id) {
      queryParams.append("mosque_id", params.mosque_id.toString());
    }
    const response = await this.api.get<ApiResponse<VolunteerPaginatedResponse>>(`${this.endpoint}?${queryParams.toString()}`);
    return response.data;
  }

  async getVolunteer(id: string): Promise<ApiResponse<VolunteerOpportunity>> {
    try {
      const response = await this.api.get<ApiResponse<VolunteerOpportunity>>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching volunteer:', error);
      throw error;
    }
  }

  async createVolunteer(data: Partial<VolunteerFormValues>): Promise<ApiResponse<VolunteerOpportunity>> {
    return await this.api.post<VolunteerOpportunity>(this.endpoint, data);
  }

  async updateVolunteer(id: string, data: Partial<VolunteerFormValues>): Promise<ApiResponse<VolunteerOpportunity>> {
    return await this.api.put<VolunteerOpportunity>(`${this.endpoint}/${id}`, data);
  }

  async deleteVolunteer(id: string): Promise<ApiResponse<void>> {
    return await this.api.delete(`${this.endpoint}/${id}`);
  }
}

export const volunteerService = new VolunteerService();