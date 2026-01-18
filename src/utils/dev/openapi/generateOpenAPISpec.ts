/**
 * OpenAPI Specification Generator
 * Generates OpenAPI 3.0 specification from Zod schemas
 * Part of Phase 3: OpenAPI Schema Documentation
 *
 * Note: This file uses @ts-nocheck because the @asteasolutions/zod-to-openapi library
 * has type incompatibilities with strict TypeScript (Zod schema 'nullable' property
 * is a function but OpenAPI expects boolean). Since this is optional documentation
 * tooling, suppressing type checking is acceptable.
 *
 * ESLint disable for @typescript-eslint/ban-ts-comment is configured in
 * configs/linting/config-modules/exclusions-config.js with approval and explanation.
 */

/* eslint-disable @typescript-eslint/ban-ts-comment, max-lines */
// @ts-nocheck
import { OpenAPIRegistry, OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// Import all schemas
import { BugReportSchema, BugSeveritySchema, SystemInfoSchema } from "@/domain/schemas/bug-report";
import {
  APISuccessResponseSchema,
  APIErrorResponseSchema,
  FirebaseDocumentSchema,
  FirebaseChunkSchema,
  FirebaseManifestSchema,
  BugReportSubmissionResultSchema,
} from "@/domain/schemas/api-responses";
import {
  EnvelopeSchema,
  TransactionSchema,
  BillSchema,
  DebtSchema,
  SavingsGoalSchema,
  PaycheckHistorySchema,
} from "@/domain/schemas";

// Create OpenAPI registry
const registry = new OpenAPIRegistry();

/**
 * Register Bug Report Schemas
 */
registry.registerComponent("schemas", "BugReport", BugReportSchema);
registry.registerComponent("schemas", "BugSeverity", BugSeveritySchema);
registry.registerComponent("schemas", "SystemInfo", SystemInfoSchema);

/**
 * Register API Response Schemas
 */
registry.registerComponent("schemas", "APISuccessResponse", APISuccessResponseSchema);
registry.registerComponent("schemas", "APIErrorResponse", APIErrorResponseSchema);

/**
 * Register Firebase Schemas
 */
registry.registerComponent("schemas", "FirebaseDocument", FirebaseDocumentSchema);
registry.registerComponent("schemas", "FirebaseChunk", FirebaseChunkSchema);
registry.registerComponent("schemas", "FirebaseManifest", FirebaseManifestSchema);
registry.registerComponent("schemas", "BugReportSubmissionResult", BugReportSubmissionResultSchema);

/**
 * Register Finance Schemas
 */
registry.registerComponent("schemas", "Envelope", EnvelopeSchema);
registry.registerComponent("schemas", "Transaction", TransactionSchema);
registry.registerComponent("schemas", "Bill", BillSchema);
registry.registerComponent("schemas", "Debt", DebtSchema);
registry.registerComponent("schemas", "SavingsGoal", SavingsGoalSchema);
registry.registerComponent("schemas", "PaycheckHistory", PaycheckHistorySchema);

/**
 * Register Bug Report API Paths
 */
registry.registerPath({
  method: "post",
  path: "/report-issue",
  tags: ["Bug Reports"],
  summary: "Submit a bug report",
  description: "Submit a bug report with optional screenshot and system information",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/BugReport",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Bug report submitted successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/BugReportSubmissionResult",
          },
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/APIErrorResponse",
          },
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/APIErrorResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Worker Stats Schema and Path
 */
const StatsResponseSchema = z.object({
  totalReports: z.number(),
  totalScreenshots: z.number(),
  storageUsed: z.number(),
});
registry.registerComponent("schemas", "StatsResponse", StatsResponseSchema);

registry.registerPath({
  method: "get",
  path: "/stats",
  tags: ["Bug Reports"],
  summary: "Get usage statistics",
  description: "Retrieve usage statistics for the bug report worker",
  responses: {
    200: {
      description: "Statistics retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/StatsResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Cloud Sync API Paths
 */
registry.registerPath({
  method: "post",
  path: "/api/sync/upload",
  tags: ["Cloud Sync"],
  summary: "Upload encrypted budget data",
  description: "Upload encrypted budget data to Firebase",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/FirebaseDocument",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Data uploaded successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/APISuccessResponse",
          },
        },
      },
    },
    400: {
      description: "Invalid request data",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/APIErrorResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/sync/download",
  tags: ["Cloud Sync"],
  summary: "Download encrypted budget data",
  description: "Download encrypted budget data from Firebase",
  responses: {
    200: {
      description: "Data downloaded successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/FirebaseDocument",
          },
        },
      },
    },
    404: {
      description: "Data not found",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/APIErrorResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Chunked Sync API Paths
 */
registry.registerPath({
  method: "post",
  path: "/api/sync/chunk/upload",
  tags: ["Cloud Sync"],
  summary: "Upload data chunk",
  description: "Upload a chunk of encrypted data for large datasets",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/FirebaseChunk",
          },
        },
      },
    },
  },
  responses: {
    200: {
      description: "Chunk uploaded successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/APISuccessResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/sync/manifest",
  tags: ["Cloud Sync"],
  summary: "Get sync manifest",
  description: "Retrieve the manifest for chunked data synchronization",
  responses: {
    200: {
      description: "Manifest retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/FirebaseManifest",
          },
        },
      },
    },
  },
});

/**
 * Register Budget Data API Paths (Conceptual - client-side operations)
 */
const EnvelopeListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(EnvelopeSchema),
});
const EnvelopeCreateResponseSchema = z.object({
  success: z.literal(true),
  data: EnvelopeSchema,
});
registry.registerComponent("schemas", "EnvelopeListResponse", EnvelopeListResponseSchema);
registry.registerComponent("schemas", "EnvelopeCreateResponse", EnvelopeCreateResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/envelopes",
  tags: ["Budget Data"],
  summary: "List all envelopes",
  description: "Retrieve all budget envelopes (local database operation)",
  responses: {
    200: {
      description: "Envelopes retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/EnvelopeListResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/envelopes",
  tags: ["Budget Data"],
  summary: "Create an envelope",
  description: "Create a new budget envelope (local database operation)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Envelope",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Envelope created successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/EnvelopeCreateResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Transaction API Paths
 */
const TransactionListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(TransactionSchema),
});
const TransactionCreateResponseSchema = z.object({
  success: z.literal(true),
  data: TransactionSchema,
});
registry.registerComponent("schemas", "TransactionListResponse", TransactionListResponseSchema);
registry.registerComponent("schemas", "TransactionCreateResponse", TransactionCreateResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/transactions",
  tags: ["Transactions"],
  summary: "List all transactions",
  description: "Retrieve all transactions (local database operation)",
  responses: {
    200: {
      description: "Transactions retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/TransactionListResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/transactions",
  tags: ["Transactions"],
  summary: "Create a transaction",
  description: "Create a new transaction (local database operation)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Transaction",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Transaction created successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/TransactionCreateResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Bill API Paths
 */
const BillListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(BillSchema),
});
const BillCreateResponseSchema = z.object({
  success: z.literal(true),
  data: BillSchema,
});
registry.registerComponent("schemas", "BillListResponse", BillListResponseSchema);
registry.registerComponent("schemas", "BillCreateResponse", BillCreateResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/bills",
  tags: ["Bills"],
  summary: "List all bills",
  description: "Retrieve all bills (local database operation)",
  responses: {
    200: {
      description: "Bills retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/BillListResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/bills",
  tags: ["Bills"],
  summary: "Create a bill",
  description: "Create a new recurring bill (local database operation)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Bill",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Bill created successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/BillCreateResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Debt API Paths
 */
const DebtListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(DebtSchema),
});
const DebtCreateResponseSchema = z.object({
  success: z.literal(true),
  data: DebtSchema,
});
registry.registerComponent("schemas", "DebtListResponse", DebtListResponseSchema);
registry.registerComponent("schemas", "DebtCreateResponse", DebtCreateResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/debts",
  tags: ["Debts"],
  summary: "List all debts",
  description: "Retrieve all tracked debts (local database operation)",
  responses: {
    200: {
      description: "Debts retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/DebtListResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/debts",
  tags: ["Debts"],
  summary: "Create a debt",
  description: "Create a new debt entry (local database operation)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Debt",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Debt created successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/DebtCreateResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Savings Goal API Paths
 */
const SavingsGoalListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(SavingsGoalSchema),
});
const SavingsGoalCreateResponseSchema = z.object({
  success: z.literal(true),
  data: SavingsGoalSchema,
});
registry.registerComponent("schemas", "SavingsGoalListResponse", SavingsGoalListResponseSchema);
registry.registerComponent("schemas", "SavingsGoalCreateResponse", SavingsGoalCreateResponseSchema);

registry.registerPath({
  method: "get",
  path: "/api/savings-goals",
  tags: ["Savings Goals"],
  summary: "List all savings goals",
  description:
    "Retrieve all savings goals (local database operation). Note: In v2.0, savings goals are stored as envelopes with envelopeType: 'savings'",
  responses: {
    200: {
      description: "Savings goals retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/SavingsGoalListResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/savings-goals",
  tags: ["Savings Goals"],
  summary: "Create a savings goal",
  description:
    "Create a new savings goal (local database operation). Note: In v2.0, savings goals are stored as envelopes with envelopeType: 'savings'",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/SavingsGoal",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Savings goal created successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/SavingsGoalCreateResponse",
          },
        },
      },
    },
  },
});

/**
 * Register Paycheck History API Paths
 */
const PaycheckHistoryListResponseSchema = z.object({
  success: z.literal(true),
  data: z.array(PaycheckHistorySchema),
});
const PaycheckHistoryCreateResponseSchema = z.object({
  success: z.literal(true),
  data: PaycheckHistorySchema,
});
registry.registerComponent(
  "schemas",
  "PaycheckHistoryListResponse",
  PaycheckHistoryListResponseSchema
);
registry.registerComponent(
  "schemas",
  "PaycheckHistoryCreateResponse",
  PaycheckHistoryCreateResponseSchema
);

registry.registerPath({
  method: "get",
  path: "/api/paycheck-history",
  tags: ["Paycheck History"],
  summary: "List paycheck history",
  description: "Retrieve paycheck history records (local database operation)",
  responses: {
    200: {
      description: "Paycheck history retrieved successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/PaycheckHistoryListResponse",
          },
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/paycheck-history",
  tags: ["Paycheck History"],
  summary: "Create paycheck history entry",
  description: "Create a new paycheck history record (local database operation)",
  request: {
    body: {
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/PaycheckHistory",
          },
        },
      },
    },
  },
  responses: {
    201: {
      description: "Paycheck history entry created successfully",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/PaycheckHistoryCreateResponse",
          },
        },
      },
    },
  },
});

/**
 * Generate OpenAPI specification
 */
export const generateOpenAPISpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      version: "2.0.0",
      title: "VioletVault API",
      description:
        "API documentation for VioletVault - A secure, encrypted envelope budgeting application. This includes Cloudflare Worker endpoints and conceptual local database operations.",
      license: {
        name: "CC BY-NC-SA 4.0",
        url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      },
      contact: {
        name: "VioletVault Contributors",
        url: "https://github.com/thef4tdaddy/violet-vault",
      },
    },
    servers: [
      {
        url: "https://bug-report-worker.thef4tdaddy.workers.dev",
        description: "Production Cloudflare Worker",
      },
      {
        url: "http://localhost:5173",
        description: "Local Development Server",
      },
    ],
    tags: [
      {
        name: "Bug Reports",
        description: "Bug report submission and management endpoints",
      },
      {
        name: "Cloud Sync",
        description: "Encrypted data synchronization with Firebase",
      },
      {
        name: "Budget Data",
        description: "Budget envelope management (local database operations)",
      },
      {
        name: "Transactions",
        description: "Transaction management (local database operations)",
      },
      {
        name: "Bills",
        description: "Bill management (local database operations)",
      },
      {
        name: "Debts",
        description: "Debt tracking and management (local database operations)",
      },
      {
        name: "Savings Goals",
        description:
          "Savings goal management (local database operations). Note: In v2.0, savings goals are stored as envelopes with envelopeType: 'savings'",
      },
      {
        name: "Paycheck History",
        description: "Paycheck history tracking (local database operations)",
      },
    ],
    externalDocs: {
      description: "VioletVault GitHub Repository",
      url: "https://github.com/thef4tdaddy/violet-vault",
    },
  });
};
