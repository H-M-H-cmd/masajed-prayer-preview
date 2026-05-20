import axios, { AxiosInstance, AxiosError } from 'axios';
import { ApiError } from '@/types/api';
import { toast } from "sonner";

interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private static instance: ApiClient;
  private api: AxiosInstance;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      (config) => {
        const lang = localStorage.getItem('language') || 'en';
        config.headers['Accept-Language'] = lang;

        const xsrfToken = this.getXsrfToken();
        if (xsrfToken) {
          config.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ErrorResponse>) => {
        const status = error.response?.status;

        switch (status) {
          case 401:
            toast.error("Authentication Error", {
              description: "Your session has expired. Please log in again.",
            });
            window.location.href = '/login';
            break;

          case 403:
            toast.error("Access Denied", {
              description: "You don't have permission to perform this action.",
            });
            break;

          case 404:
            toast.error("Not Found", {
              description: "The requested resource was not found.",
            });
            break;

          case 422:
            toast.error("Validation Error", {
              description: error.response?.data?.message || "Please check your input and try again.",
            });
            break;

          default:
            toast.error("Error", {
              description: error.response?.data?.message || "An unexpected error occurred.",
            });
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  private getXsrfToken(): string | null {
    const cookies = document.cookie.split(';');
    const xsrfCookie = cookies.find(cookie => cookie.trim().startsWith('XSRF-TOKEN='));
    return xsrfCookie ? xsrfCookie.split('=')[1] : null;
  }

  public async initializeCsrf(): Promise<void> {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/csrf-cookie`, {
        withCredentials: true,
        headers: {
          'Accept': 'application/json',
        }
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
  }

  private handleError(error: AxiosError<ErrorResponse>): ApiError {
    return {
      message: error.response?.data?.message || 'An unexpected error occurred',
      status: error.response?.status || 500,
      errors: error.response?.data?.errors,
    };
  }

  public getAxiosInstance(): AxiosInstance {
    return this.api;
  }
}

export const apiClient = ApiClient.getInstance(); 