import { BaseService } from './base.service';
import { ApiResponse } from '@/types/api';
import { apiClient } from '@/lib/api-client';

export interface AuthenticationData {
  identity: string;
  type: 'phone' | 'id_number';
}

export interface VerifyOtpData {
  token: string;
  code: string;
}

export interface AuthResponse {
  data: string;
  message: string;
}

export interface SendOtpResponse {
  token: string;
  expires_at: string;
}

export interface User {
  id: number;
  name: string;
  avatar?: string;
  phone: string;
  id_number: number;
  is_active: number;
  panel: Panel;
  created_at: string;
  updated_at: string;
}

export interface Panel {
  id: number;
  name: string;
  type: string;
  permit_no?: string;
  owner_id?: number;
  updated_at?: string;
  created_at?: string;
  status?: string;
}

export interface UserResponse {
  message: string;
  data: User;
}

export interface ResendOtpData {
  token: string;
}

class AuthService extends BaseService {
  constructor() {
    super('/auth');
  }

  async sendOtp(data: AuthenticationData): Promise<ApiResponse<SendOtpResponse>> {
    await apiClient.initializeCsrf();
    const response = await this.api.post<ApiResponse<SendOtpResponse>>(`${this.endpoint}/send-otp`, data);
    return response.data;
  }

  async verifyOtp(data: VerifyOtpData): Promise<ApiResponse<AuthResponse>> {
    await apiClient.initializeCsrf();
    const { data: responseData } = await this.api.post<ApiResponse<AuthResponse>>(`${this.endpoint}/verify-otp`, data);
    return responseData;
  }

  async me(): Promise<ApiResponse<User>> {
    const { data } = await this.api.get<ApiResponse<User>>('/me');
    return data;
  }

  async logout(): Promise<void> {
    await this.api.post(`${this.endpoint}/logout`);
  }

  async resendOtp(data: ResendOtpData): Promise<ApiResponse<SendOtpResponse>> {
    const response = await this.api.post<ApiResponse<SendOtpResponse>>(`${this.endpoint}/resend-otp`, data);
    return response.data;
  }
}

export const authService = new AuthService(); 
