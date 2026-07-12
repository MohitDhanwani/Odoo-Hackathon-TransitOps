export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

// Always point to the Next.js rewrites (same origin) to prevent cross-origin cookie issues
const BASE_URL = "/api";

async function fetchWithConfig(endpoint: string, config: RequestInit) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...config,
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    credentials: "include", // Required for cookies
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      //
    }
    const message = errorData?.message || response.statusText;
    
    if (response.status === 401 && typeof window !== "undefined" && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/me")) {
      // Redirect to login on 401
      window.location.href = "/login?expired=true";
    }
    
    throw new ApiError(response.status, message, errorData);
  }

  return response.json();
}

export async function apiGet<T = any>(endpoint: string, config: RequestInit = {}): Promise<T> {
  const result = await fetchWithConfig(endpoint, { ...config, method: "GET" });
  return result.data !== undefined ? result.data : result;
}

export async function apiPost<T = any>(endpoint: string, data: any, config: RequestInit = {}): Promise<T> {
  const result = await fetchWithConfig(endpoint, {
    ...config,
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.data !== undefined ? result.data : result;
}

export async function apiPatch<T = any>(endpoint: string, data: any, config: RequestInit = {}): Promise<T> {
  const result = await fetchWithConfig(endpoint, {
    ...config,
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return result.data !== undefined ? result.data : result;
}

export async function apiDelete<T = any>(endpoint: string, config: RequestInit = {}): Promise<T> {
  const result = await fetchWithConfig(endpoint, { ...config, method: "DELETE" });
  return result.data !== undefined ? result.data : result;
}
