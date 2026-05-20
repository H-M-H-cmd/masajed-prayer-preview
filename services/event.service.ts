import { Event, EventPaginatedResponse, CreateEventData, UpdateEventData } from "@/types/event";
import { ApiResponse } from "@/types/api";
import { BaseService } from "./base.service";

class EventService extends BaseService {
  constructor() {
    super("/events");
  }

  getEvents = async (params?: {
    search?: string;
    page?: number;
    per_page?: number;
    sort_by?: keyof Event;
    sort_direction?: "asc" | "desc";
    mosque_id?: number;
  }) => {
    const response = await this.api.get<ApiResponse<EventPaginatedResponse>>(this.endpoint, { params });
    return response.data;
  };

  getEvent = async (id: string) => {
    const response = await this.api.get<ApiResponse<Event>>(`${this.endpoint}/${id}`);
    return response.data;
  };

  async createEvent(data: CreateEventData): Promise<ApiResponse<Event>> {
    const formData = new FormData();
    
    // Append regular fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'attachments' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Append attachments if they exist
    if (data.attachments?.length) {
      data.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file as unknown as File);
      });
    }

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const { data: responseData } = await this.api.post<ApiResponse<Event>>(
      this.endpoint,
      formData,
      config
    );
    return responseData;
  }

  async updateEvent(eventId: string, data: UpdateEventData): Promise<ApiResponse<Event>> {
    const formData = new FormData();
    const updateData = { ...data };
    
    // Append regular fields
    Object.entries(updateData).forEach(([key, value]) => {
      if (key !== 'attachments' && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Append attachments if they exist
    if (updateData.attachments?.length) {
      updateData.attachments.forEach((file, index) => {
        formData.append(`attachments[${index}]`, file as unknown as File);
      });
    }

    // Add _method field for PUT request simulation
    formData.append('_method', 'PUT');

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    const { data: responseData } = await this.api.post<ApiResponse<Event>>(
      `${this.endpoint}/${eventId}`,
      formData,
      config
    );
    return responseData;
  }

  deleteEvent = async (id: string) => {
    const response = await this.api.delete<ApiResponse<void>>(`${this.endpoint}/${id}`);
    return response.data;
  };
}

export const eventService = new EventService(); 