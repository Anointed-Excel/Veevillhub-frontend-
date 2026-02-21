import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from './api';
import type { ApiResponse } from './api';

/**
 * Generic data-fetching hook.
 * Returns { data, loading, error, refetch }
 */
export function useFetch<T>(
  path: string | null,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<T>(path);
      setData(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, ...deps]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export type { ApiResponse };
