/**
 * Generate OpenAPI Specification Script
 * Generates openapi.json file from Zod schemas
 * Part of Phase 3: OpenAPI Schema Documentation
 */

import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSpec() {
  try {
    console.log("Generating OpenAPI specification...");

    // Import the generator (will be built first)
    const { generateOpenAPISpec } = await import("../dist/utils/openapi/generateOpenAPISpec.js");

    const spec = generateOpenAPISpec();
    const specJSON = JSON.stringify(spec, null, 2);

    // Write to public directory
    const outputPath = join(__dirname, "..", "public", "openapi.json");
    writeFileSync(outputPath, specJSON, "utf-8");

    console.log("✓ OpenAPI specification generated successfully");
    console.log(`  Output: ${outputPath}`);
    console.log(`  Size: ${(specJSON.length / 1024).toFixed(2)} KB`);

    return spec;
  } catch (error) {
    console.error("✗ Failed to generate OpenAPI specification:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

generateSpec();
