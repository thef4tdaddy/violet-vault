/**
 * Custom ESLint rules for safe Zustand patterns
 * Prevents React error #185 and enforces best practices
 */

export default {
  rules: {
  "zustand-no-get-in-actions": {
    meta: {
      type: "problem",
      docs: {
        description: "Prevent get() calls inside Zustand store actions to avoid React error #185",
        category: "Possible Errors",
        recommended: true,
      },
      schema: [],
      messages: {
        noGetInActions:
          "Avoid get() calls inside store actions. Use set((state) => ...) pattern instead. " +
          "This prevents React error #185 infinite render loops. " +
          "See docs/Zustand-Safe-Patterns.md for alternatives.",
      },
    },
    create(context) {
      let inStoreAction = false;
      let storeActionDepth = 0;

      return {
        // Detect Zustand store creation patterns
        CallExpression(node) {
          // Check for create() calls (Zustand stores)
          if (
            node.callee.name === "create" ||
            (node.callee.type === "MemberExpression" &&
             node.callee.property.name === "create")
          ) {
            inStoreAction = true;
            storeActionDepth++;
          }
        },

        "CallExpression:exit"(node) {
          if (
            (node.callee.name === "create" ||
             (node.callee.type === "MemberExpression" &&
              node.callee.property.name === "create")) &&
            inStoreAction
          ) {
            storeActionDepth--;
            if (storeActionDepth === 0) {
              inStoreAction = false;
            }
          }
        },

        // Check for get() calls within store actions
        CallExpression(node) {
          if (
            inStoreAction &&
            node.callee.name === "get" &&
            // Make sure it's not a different get() function
            node.arguments.length === 0
          ) {
            context.report({
              node,
              messageId: "noGetInActions",
            });
          }
        },
      };
    },
  },

  "zustand-store-reference-pattern": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Enforce store reference pattern for async operations in Zustand stores",
        category: "Best Practices",
        recommended: true,
      },
      schema: [],
      messages: {
        useStoreReference:
          "Use store reference pattern for async operations. Create const store = { actions } and reference store.action() in timeouts/promises instead of get().action(). " +
          "See docs/Zustand-Safe-Patterns.md for examples.",
      },
    },
    create(context) {
      let inAsyncOperation = false;

      return {
        // Detect async operations (setTimeout, setInterval, Promise chains)
        CallExpression(node) {
          if (
            ["setTimeout", "setInterval"].includes(node.callee.name) ||
            (node.callee.type === "MemberExpression" &&
             ["then", "catch", "finally"].includes(node.callee.property.name))
          ) {
            inAsyncOperation = true;
          }
        },

        "CallExpression:exit"(node) {
          if (
            ["setTimeout", "setInterval"].includes(node.callee.name) ||
            (node.callee.type === "MemberExpression" &&
             ["then", "catch", "finally"].includes(node.callee.property.name))
          ) {
            inAsyncOperation = false;
          }
        },

        // Check for get() calls in async operations
        CallExpression(node) {
          if (
            inAsyncOperation &&
            node.callee.name === "get" &&
            node.arguments.length === 0
          ) {
            context.report({
              node,
              messageId: "useStoreReference",
            });
          }
        },
      };
    },
  },

  "zustand-selective-subscriptions": {
    meta: {
      type: "suggestion",
      docs: {
        description: "Encourage selective subscriptions over full store subscriptions",
        category: "Performance",
        recommended: true,
      },
      schema: [],
      messages: {
        useSelectiveSubscription:
          "Use selective subscriptions instead of subscribing to entire store. " +
          "Replace useStore() with useStore(state => state.specificValue) to prevent unnecessary re-renders. " +
          "See docs/Zustand-Safe-Patterns.md for performance patterns.",
      },
    },
    create(context) {
      return {
        CallExpression(node) {
          // Check for useStore() calls without selector
          if (
            node.callee.name &&
            node.callee.name.includes("Store") &&
            node.callee.name.startsWith("use") &&
            node.arguments.length === 0
          ) {
            context.report({
              node,
              messageId: "useSelectiveSubscription",
            });
          }
        },
      };
    },
  },

  "zustand-no-conditional-subscriptions": {
    meta: {
      type: "problem",
      docs: {
        description: "Prevent conditional Zustand store subscriptions that can cause memory leaks",
        category: "Possible Errors",
        recommended: true,
      },
      schema: [],
      messages: {
        noConditionalSubscriptions:
          "Avoid conditional store subscriptions. Move conditions inside the component instead of conditionally calling useStore hooks. " +
          "This prevents React hooks rule violations and memory leaks.",
      },
    },
    create(context) {
      return {
        // Check for store hooks inside conditional statements
        IfStatement(node) {
          function checkForStoreHooks(nodeToCheck) {
            if (nodeToCheck.type === "CallExpression" &&
                nodeToCheck.callee.name &&
                nodeToCheck.callee.name.includes("Store") &&
                nodeToCheck.callee.name.startsWith("use")) {
              context.report({
                node: nodeToCheck,
                messageId: "noConditionalSubscriptions",
              });
            }
          }

          // Recursively check the consequent for store hooks
          function traverse(node) {
            if (node.type === "CallExpression") {
              checkForStoreHooks(node);
            }
            for (const key in node) {
              if (node[key] && typeof node[key] === "object") {
                if (Array.isArray(node[key])) {
                  node[key].forEach(traverse);
                } else if (node[key].type) {
                  traverse(node[key]);
                }
              }
            }
          }

          traverse(node.consequent);
          if (node.alternate) {
            traverse(node.alternate);
          }
        },
      };
    },
  },
  }
};