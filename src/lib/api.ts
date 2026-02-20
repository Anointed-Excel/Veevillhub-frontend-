import { token } from './token';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ── Error type ───────────────────────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ── Standard response wrapper ────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalResults: number;
  };
}

// ── Token refresh logic ──────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<(newToken: string) => void> = [];

async function doRefresh(): Promise<string | null> {
  const refreshToken = token.getRefresh();
  const userType = token.getUserType();
  if (!refreshToken || !userType) return null;

  const endpoint = userType === 'admin' ? '/admin/refresh-token' : '/users/refresh-token';

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      token.clearTokens();
      return null;
    }

    const json: ApiResponse<{ tokens: { access: { token: string }; refresh: { token: string } } }> = await res.json();
    const newAccess = json.data.tokens.access.token;
    const newRefresh = json.data.tokens.refresh.token;
    token.set(newAccess, newRefresh, userType);
    return newAccess;
  } catch {
    token.clearTokens();
    return null;
  }
}

// ── Core request function ────────────────────────────────────────────────────

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> | undefined),
  };

  const accessToken = token.getAccess();
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // ── 401: attempt token refresh then retry once ──
  if (res.status === 401 && token.getRefresh()) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await doRefresh();
      isRefreshing = false;

      if (newToken) {
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        headers['Authorization'] = `Bearer ${newToken}`;
        res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      } else {
        // Refresh failed — boot to login
        window.location.href = '/login';
        throw new ApiError('Session expired. Please log in again.', 401);
      }
    } else {
      // Another request is already refreshing — wait for it
      const newToken = await new Promise<string>((resolve) => {
        refreshQueue.push(resolve);
      });
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    }
  }

  // ── Parse response ──
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(json?.message ?? 'Something went wrong', res.status);
  }

  return json as ApiResponse<T>;
}

// ── Public API client ────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: <T>(path: string, options?: RequestInit) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
