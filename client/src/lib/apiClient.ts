// API Client - handles base URL configuration for production/development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Creates a full API URL from a relative path
 * In development: /api/auth/login -> http://localhost:5000/api/auth/login (via Vite proxy)
 * In production: /api/auth/login -> https://your-backend.com/api/auth/login
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (API_BASE_URL) {
    // Production: use configured backend URL
    return `${API_BASE_URL}/${cleanPath}`;
  }
  
  // Development: use relative path (Vite dev server proxies to backend)
  return `/${cleanPath}`;
}

/**
 * Wrapper around fetch that uses the correct API base URL
 */
export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, options);
}

export default {
  getApiUrl,
  fetch: apiFetch,
};
