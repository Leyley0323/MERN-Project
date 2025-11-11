// Utility functions for authentication

export interface UserData {
  firstName: string;
  lastName: string;
  id: string;
}

/**
 * Get user data from localStorage
 * Returns null if user is not logged in
 */
export function getUserData(): UserData | null {
  const userDataStr = localStorage.getItem('user_data');
  if (!userDataStr) {
    return null;
  }
  try {
    return JSON.parse(userDataStr) as UserData;
  } catch {
    return null;
  }
}

/**
 * Get user ID from localStorage
 * Returns null if user is not logged in
 */
export function getUserId(): string | null {
  const userData = getUserData();
  return userData ? userData.id : null;
}

/**
 * Check if user is logged in
 */
export function isLoggedIn(): boolean {
  return getUserId() !== null;
}

/**
 * Get authentication headers for API requests
 * Returns headers with X-User-Id if user is logged in
 */
export function getAuthHeaders(): HeadersInit {
  const userId = getUserId();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (userId) {
    headers['X-User-Id'] = userId;
  }
  
  return headers;
}

/**
 * Logout user (clear localStorage and redirect)
 */
export function logout(): void {
  localStorage.removeItem('user_data');
  window.location.href = '/login';
}

