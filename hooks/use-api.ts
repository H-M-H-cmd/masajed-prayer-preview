import { useState, useCallback } from 'react';
import { ApiError } from '@/types/api';

interface UseApiOptions<T, P = void> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T, P = void>(
  apiCall: (params: P) => Promise<T>,
  options: UseApiOptions<T, P> = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (params: P) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await apiCall(params);
      setData(result);
      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      options.onError?.(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, options]);

  return {
    execute,
    isLoading,
    error,
    data,
  };
} 