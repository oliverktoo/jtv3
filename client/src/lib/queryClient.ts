import { QueryClient, QueryFunction } from "@tanstack/react-query";

class ApiError extends Error {
  status: number;
  data: any;
  
  constructor(status: number, data: any) {
    super(`${status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<any> {
  // In production, use relative URLs (Netlify will route to functions)
  // In development, use localhost:5000
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const backendUrl = url.startsWith('http') 
    ? url 
    : isDevelopment 
      ? `http://localhost:5000${url}`
      : url; // Use relative URL in production
  
  const res = await fetch(backendUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Clone the response to read the body multiple times if needed
  const responseClone = res.clone();
  
  if (!res.ok) {
    let errorData: any;
    try {
      errorData = await res.json();
    } catch {
      try {
        errorData = await res.text();
      } catch {
        errorData = res.statusText;
      }
    }
    throw new ApiError(res.status, errorData);
  }

  // Parse and return the response data from the cloned response
  try {
    return await responseClone.json();
  } catch {
    return await responseClone.text();
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    // Clone the response to read the body multiple times if needed
    const responseClone = res.clone();
    
    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        try {
          errorData = await res.text();
        } catch {
          errorData = res.statusText;
        }
      }
      throw new ApiError(res.status, errorData);
    }

    try {
      return await responseClone.json();
    } catch {
      return await responseClone.text();
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
