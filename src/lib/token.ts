const KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token',
  USER_TYPE: 'user_type', // 'admin' | 'user'
} as const;

export type UserType = 'admin' | 'user';

export const token = {
  getAccess: (): string | null => localStorage.getItem(KEYS.ACCESS),
  getRefresh: (): string | null => localStorage.getItem(KEYS.REFRESH),
  getUserType: (): UserType | null => localStorage.getItem(KEYS.USER_TYPE) as UserType | null,

  set: (access: string, refresh: string, userType: UserType): void => {
    localStorage.setItem(KEYS.ACCESS, access);
    localStorage.setItem(KEYS.REFRESH, refresh);
    localStorage.setItem(KEYS.USER_TYPE, userType);
  },

  clearTokens: (): void => {
    localStorage.removeItem(KEYS.ACCESS);
    localStorage.removeItem(KEYS.REFRESH);
    localStorage.removeItem(KEYS.USER_TYPE);
  },
};
