import { useState, useEffect } from 'react';

interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  apiCall: () => Promise<any>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchCount, setRefetchCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiCall();
        if (isMounted) {
          setData(response.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.message ||
            err.response?.data?.message ||
            'An error occurred'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [...dependencies, refetchCount]);

  return {
    data,
    loading,
    error,
    refetch: () => setRefetchCount((c) => c + 1),
  };
}
