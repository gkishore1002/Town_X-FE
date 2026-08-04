import axios from "axios";

type FastApiDetail = string | { msg?: string; loc?: unknown[] }[];

/**
 * Turns axios / network errors into a short user-facing message.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      return "Unable to reach the server. Check that the API is running and try again.";
    }

    const { status, data } = error.response;
    const detail = data?.detail;

    if (typeof detail === "string" && detail.trim()) {
      return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
      return detail
        .map((item) => (typeof item === "object" && item?.msg ? item.msg : String(item)))
        .join(". ");
    }

    if (status === 401) return "Please log in to continue.";
    if (status === 403) return "You don't have permission to do that.";
    if (status === 404) return "The requested resource was not found.";
    if (status >= 500) {
      return "Something went wrong on our side. Please try again in a moment.";
    }

    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export function isServerError(error: unknown): boolean {
  return axios.isAxiosError(error) && (error.response?.status ?? 0) >= 500;
}
