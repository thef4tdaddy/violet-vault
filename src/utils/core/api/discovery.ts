/**
 * Service Mesh Discovery Utility
 * Resolves API endpoints for polyglot microservices based on environment.
 */

export type ServiceName = "go-backend" | "py-analytics" | "py-ocr";

/**
 * Helper to get environment variables defensively.
 */
const getEnv = () => ({
  PROD: import.meta.env.PROD,
  GO_API_URL: import.meta.env.VITE_GO_API_URL,
  PY_API_URL: import.meta.env.VITE_PY_API_URL,
});

/**
 * Resolves the base URL for a given service.
 * In production, Vercel routes these via the same origin /api path.
 * In development, they typically point to separate local ports.
 */
export const resolveServiceUrl = (service: ServiceName): string => {
  const env = getEnv();

  switch (service) {
    case "go-backend":
      if (env.GO_API_URL) return env.GO_API_URL;
      return env.PROD ? "/api/bug-report" : "http://localhost:3001/api";

    case "py-analytics":
      if (env.PY_API_URL) return env.PY_API_URL;
      return env.PROD ? "/api/analytics" : "http://localhost:8000/api";

    case "py-ocr":
      // OCR service runs on same Python backend as analytics
      if (env.PY_API_URL) return env.PY_API_URL;
      return env.PROD ? "/api" : "http://localhost:8000/api";

    default:
      throw new Error(`Unknown service: ${service}`);
  }
};

/**
 * Appends a path to the resolved service URL.
 */
export const getServicePath = (service: ServiceName, path: string): string => {
  const baseUrl = resolveServiceUrl(service);
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  // Handle relative vs absolute URLs
  if (baseUrl.startsWith("http")) {
    return `${baseUrl}/${cleanPath}`;
  }

  // For relative paths in production
  return `${baseUrl}/${cleanPath}`;
};
