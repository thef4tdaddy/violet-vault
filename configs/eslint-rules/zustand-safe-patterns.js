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
        // Detect Zustand store creation patterns and get() calls
        CallExpression(node) {
          // Check for create() calls (Zustand stores)
          if (
            node.callee.name === "create" ||
            (node.callee.type === "MemberExpression" &&
             node.callee.property.name === "create")
          ) {
            inStoreAction = true;
            storeActionDepth++;
            return;
          }

          // Check for get() calls within store actions
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
        // Detect async operations and get() calls
        CallExpression(node) {
          // Check for async operations (setTimeout, setInterval, Promise chains)
          if (
            ["setTimeout", "setInterval"].includes(node.callee.name) ||
            (node.callee.type === "MemberExpression" &&
             ["then", "catch", "finally"].includes(node.callee.property.name))
          ) {
            inAsyncOperation = true;
            return;
          }

          // Check for get() calls in async operations
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

        "CallExpression:exit"(node) {
          if (
            ["setTimeout", "setInterval"].includes(node.callee.name) ||
            (node.callee.type === "MemberExpression" &&
             ["then", "catch", "finally"].includes(node.callee.property.name))
          ) {
            inAsyncOperation = false;
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
      const visited = new Set();

      return {
        // Check for store hooks inside conditional statements
        IfStatement(node) {
          function checkForStoreHooks(nodeToCheck) {
            if (nodeToCheck.type === "CallExpression" &&
                nodeToCheck.callee &&
                nodeToCheck.callee.name &&
                nodeToCheck.callee.name.includes("Store") &&
                nodeToCheck.callee.name.startsWith("use")) {
              context.report({
                node: nodeToCheck,
                messageId: "noConditionalSubscriptions",
              });
            }
          }

          // Recursively check for store hooks with cycle prevention
          function traverse(node, depth = 0) {
            // Prevent infinite recursion
            if (!node || typeof node !== "object" || depth > 20) return;

            // Create a unique key for this node
            const nodeKey = `${node.type}_${node.start}_${node.end}`;
            if (visited.has(nodeKey)) return;
            visited.add(nodeKey);

            if (node.type === "CallExpression") {
              checkForStoreHooks(node);
              return; // Don't traverse into call expressions further
            }

            // Only traverse specific safe properties
            const safeKeys = ['body', 'consequent', 'alternate', 'expression', 'declarations'];
            for (const key of safeKeys) {
              if (node[key]) {
                if (Array.isArray(node[key])) {
                  node[key].forEach(child => traverse(child, depth + 1));
                } else if (node[key].type) {
                  traverse(node[key], depth + 1);
                }
              }
            }
          }

          // Clear visited set for each if statement
          visited.clear();
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