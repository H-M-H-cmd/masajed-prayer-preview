export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}
export interface PaginationParams {
  page?: number;
  per_page?: number;
  search?: string;
}
export interface PaginatedResponse<T> extends Omit<ApiResponse<any>, 'data'> {
  message: string;
  data: {
    data: T[];
    meta?: PaginationMeta;
    links?: PaginationLinks
  };
} 