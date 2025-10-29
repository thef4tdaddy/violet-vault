/**
 * API Documentation Component
 * Displays OpenAPI documentation using Swagger UI
 * Part of Phase 3: OpenAPI Schema Documentation
 */

import React, { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { getOpenAPISpecObject } from "@/utils/openapi/exportOpenAPISpec";
import logger from "@/utils/common/logger";

/**
 * API Documentation Page Component
 * Renders interactive API documentation with Swagger UI
 */
const APIDocumentation: React.FC = () => {
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const openAPISpec = getOpenAPISpecObject();
      setSpec(openAPISpec);
      logger.info("OpenAPI spec loaded successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      logger.error("Failed to load OpenAPI spec", err);
    }
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg">
          <div className="mb-4 flex items-center">
            <svg
              className="mr-3 h-8 w-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Error Loading API Documentation</h2>
          </div>
          <p className="text-gray-700">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => window.location.reload()}
              className="rounded bg-purple-600 px-4 py-2 text-white hover:bg-purple-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-purple-600 border-r-transparent"></div>
          <p className="text-gray-700">Loading API Documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">VioletVault API Documentation</h1>
          <p className="mt-2 text-sm text-gray-600">
            Interactive API documentation for VioletVault endpoints
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-white shadow">
          <SwaggerUI spec={spec} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(APIDocumentation);
