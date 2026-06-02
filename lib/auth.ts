

export type UserRole = 'merchant' | 'customer';

export interface AuthUser {
  access_token: string;
  token_type: string;
  role: UserRole;
  user_id: number;
  name: string;
  email: string;
}

const TOKEN_KEY = 'ims_token';
const USER_KEY = 'ims_user';

export function setAuth(user: AuthUser): void {
  localStorage.setItem(TOKEN_KEY, user.access_token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getRole(): UserRole | null {
  return getUser()?.role ?? null;
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function logout(): void {
  clearAuth();
  window.location.href = '/login';
}
