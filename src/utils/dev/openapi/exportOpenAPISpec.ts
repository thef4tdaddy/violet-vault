/**
 * Export OpenAPI Specification to JSON/YAML
 * Utility to generate and save OpenAPI specification
 * Part of Phase 3: OpenAPI Schema Documentation
 */

import { generateOpenAPISpec } from "./generateOpenAPISpec";
import logger from "@/utils/core/common/logger";

/**
 * Generate and return OpenAPI spec as JSON string
 */
export const getOpenAPISpecJSON = (): string => {
  try {
    const spec = generateOpenAPISpec();
    return JSON.stringify(spec, null, 2);
  } catch (error) {
    logger.error("Failed to generate OpenAPI spec", error);
    throw error;
  }
};

/**
 * Generate and return OpenAPI spec as object
 */
export const getOpenAPISpecObject = () => {
  try {
    return generateOpenAPISpec();
  } catch (error) {
    logger.error("Failed to generate OpenAPI spec", error);
    throw error;
  }
};

/**
 * Download OpenAPI spec as JSON file
 */
export const downloadOpenAPISpec = (): void => {
  try {
    const spec = getOpenAPISpecJSON();
    const blob = new Blob([spec], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "violetVault-openapi.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    logger.info("OpenAPI spec downloaded successfully");
  } catch (error) {
    logger.error("Failed to download OpenAPI spec", error);
    throw error;
  }
};
