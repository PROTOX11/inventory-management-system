import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/types';

export function useApiData<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchFn()
      .then(setData)
      .catch((err) => {
        setError(err);
        console.error('API Error:', err);
      })
      .finally(() => setLoading(false));
  }, dependencies);

  return { data, loading, error };
}

export function useApiMutation<TInput, TOutput>(
  mutationFn: (input: TInput) => Promise<TOutput>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<TOutput | null>(null);

  const mutate = async (input: TInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(input);
      setData(result);
      return result;
    } catch (err) {
      setError(err as ApiError);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}
