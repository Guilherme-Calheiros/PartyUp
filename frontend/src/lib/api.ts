export const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function throwIfApiError(response: Response, fallback: string) {
  if (response.ok) {
    return;
  }

  throw new ApiError(await getApiErrorMessage(response, fallback), response.status);
}

export async function getApiErrorMessage(response: Response, fallback: string) {
  const text = await response.text();

  if (!text) {
    return fallback;
  }

  try {
    const data = JSON.parse(text);

    if (typeof data === "string") {
      return data;
    }

    if (Array.isArray(data) && typeof data[0]?.description === "string") {
      return data[0].description;
    }

    if (data?.errors && typeof data.errors === "object") {
      for (const value of Object.values(data.errors)) {
        if (Array.isArray(value) && typeof value[0] === "string") {
          return value[0];
        }
      }
    }

    if (typeof data?.message === "string") {
      return data.message;
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.title === "string") {
      return data.title;
    }
  } catch {
    return text;
  }

  return fallback;
}
