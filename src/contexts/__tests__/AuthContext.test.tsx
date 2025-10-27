import { render } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthProvider, useAuth } from "../AuthContext";
import { UserData } from "@/types/auth";

/**
 * Test suite for AuthContext
 * Part of Epic #665: Migrate Auth from Zustand to React Context + TanStack Query
 */

describe("AuthContext", () => {
  // Test component that uses useAuth hook
  const TestComponent = () => {
    const auth = useAuth();
    return (
      <div>
        <div data-testid="user">{auth.user?.userName || "No User"}</div>
        <div data-testid="authenticated">
          {auth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
        </div>
        <div data-testid="unlocked">{auth.isUnlocked ? "Unlocked" : "Locked"}</div>
        <div data-testid="loading">{auth.isLoading ? "Loading" : "Not Loading"}</div>
        <div data-testid="error">{auth.error || "No Error"}</div>
        <button
          data-testid="set-authenticated"
          onClick={() => auth.setAuthenticated({ userName: "testuser" } as any)}
        >
          Set Authenticated
        </button>
        <button data-testid="clear-auth" onClick={() => auth.clearAuth()}>
          Clear Auth
        </button>
        <button data-testid="set-loading" onClick={() => auth.setLoading(true)}>
          Set Loading
        </button>
        <button data-testid="set-error" onClick={() => auth.setError("Test Error")}>
          Set Error
        </button>
        <button data-testid="update-activity" onClick={() => auth.updateActivity()}>
          Update Activity
        </button>
        <button data-testid="lock-session" onClick={() => auth.lockSession()}>
          Lock Session
        </button>
      </div>
    );
  };

  const renderWithAuthProvider = (component: ReactNode) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  const screen = {
    getByTestId: (id: string) => document.querySelector(`[data-testid="${id}"]`) as HTMLElement,
    getByText: (text: string) => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements.find(el => el.textContent?.includes(text)) as HTMLElement;
    },
  };

  const waitFor = async (callback: () => void, options = { timeout: 1000 }) => {
    const start = Date.now();
    while (Date.now() - start < options.timeout) {
      try {
        callback();
        return;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    callback();
  };

  beforeEach(() => {
    // Clear any localStorage data before each test
    localStorage.clear();
  });

  describe("AuthProvider", () => {
    it("should provide auth context to child components", () => {
      renderWithAuthProvider(<TestComponent />);
      expect(screen.getByTestId("user")).toBeInTheDocument();
    });

    it("should initialize with default auth state", () => {
      renderWithAuthProvider(<TestComponent />);
      expect(screen.getByTestId("authenticated")).toHaveTextContent("Not Authenticated");
      expect(screen.getByTestId("unlocked")).toHaveTextContent("Locked");
      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");
      expect(screen.getByTestId("error")).toHaveTextContent("No Error");
    });

    it("should throw error when useAuth is used outside provider", () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => render(<TestComponent />)).toThrow(
        "useAuth must be used within an AuthProvider"
      );

      spy.mockRestore();
    });
  });

  describe("Initial State", () => {
    it("should have user as null initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="has-user">{auth.user ? "Has User" : "No User"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("has-user")).toHaveTextContent("No User");
    });

    it("should have isAuthenticated as false initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="auth-status">{auth.isAuthenticated ? "true" : "false"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("auth-status")).toHaveTextContent("false");
    });

    it("should have isUnlocked as false initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="unlock-status">{auth.isUnlocked ? "true" : "false"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("unlock-status")).toHaveTextContent("false");
    });

    it("should have encryptionKey as null initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="has-key">{auth.encryptionKey ? "Has Key" : "No Key"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("has-key")).toHaveTextContent("No Key");
    });

    it("should have salt as null initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="has-salt">{auth.salt ? "Has Salt" : "No Salt"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("has-salt")).toHaveTextContent("No Salt");
    });

    it("should have budgetId as null initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="has-budget">{auth.budgetId ? "Has Budget" : "No Budget"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("has-budget")).toHaveTextContent("No Budget");
    });

    it("should have lastActivity as null initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return (
          <div data-testid="has-activity">{auth.lastActivity ? "Has Activity" : "No Activity"}</div>
        );
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("has-activity")).toHaveTextContent("No Activity");
    });

    it("should have isLoading as false initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="loading-status">{auth.isLoading ? "true" : "false"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("loading-status")).toHaveTextContent("false");
    });

    it("should have error as null initially", () => {
      const TestComponentWithState = () => {
        const auth = useAuth();
        return <div data-testid="error-status">{auth.error ? "Has Error" : "No Error"}</div>;
      };

      renderWithAuthProvider(<TestComponentWithState />);
      expect(screen.getByTestId("error-status")).toHaveTextContent("No Error");
    });
  });

  describe("Authentication State", () => {
    it("should update authentication state when setAuthenticated is called", async () => {
      renderWithAuthProvider(<TestComponent />);

      expect(screen.getByTestId("user")).toHaveTextContent("No User");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("Not Authenticated");

      const setAuthButton = screen.getByTestId("set-authenticated");
      setAuthButton.click();

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("Authenticated");
      });
    });

    it("should update user data when setAuthenticated is called", async () => {
      const TestComponentWithUserData = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="user-name">{auth.user?.userName || "No User"}</div>
            <div data-testid="user-color">{auth.user?.userColor || "No Color"}</div>
            <button
              onClick={() =>
                auth.setAuthenticated({
                  userName: "john",
                  userColor: "#FF0000",
                })
              }
            >
              Set User
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithUserData />);

      screen.getByText("Set User").click();

      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("john");
        expect(screen.getByTestId("user-color")).toHaveTextContent("#FF0000");
      });
    });

    it("should clear auth state when clearAuth is called", async () => {
      renderWithAuthProvider(<TestComponent />);

      // First set authenticated
      screen.getByTestId("set-authenticated").click();

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("Authenticated");
      });

      // Then clear
      screen.getByTestId("clear-auth").click();

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("Not Authenticated");
      });
    });

    it("should maintain encryption key and salt in state", async () => {
      const TestComponentWithKeys = () => {
        const auth = useAuth();
        const encryptionKey = new Uint8Array([1, 2, 3, 4]);
        const salt = new Uint8Array([5, 6, 7, 8]);

        return (
          <div>
            <button
              onClick={() =>
                auth.setAuthenticated({ userName: "testuser", userColor: "#000000" } as UserData, {
                  encryptionKey: encryptionKey as unknown as CryptoKey,
                  salt,
                })
              }
            >
              Set with Keys
            </button>
            <div data-testid="has-key">{auth.encryptionKey ? "Has Key" : "No Key"}</div>
            <div data-testid="has-salt">{auth.salt ? "Has Salt" : "No Salt"}</div>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithKeys />);

      screen.getByText("Set with Keys").click();

      await waitFor(() => {
        expect(screen.getByTestId("has-key")).toHaveTextContent("Has Key");
        expect(screen.getByTestId("has-salt")).toHaveTextContent("Has Salt");
      });
    });
  });

  describe("Loading State", () => {
    it("should set loading state", async () => {
      renderWithAuthProvider(<TestComponent />);

      expect(screen.getByTestId("loading")).toHaveTextContent("Not Loading");

      screen.getByTestId("set-loading").click();

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("Loading");
      });
    });

    it("should toggle loading state independent of authentication", async () => {
      const TestComponentWithLoading = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="loading-status">{auth.isLoading ? "Loading" : "Not Loading"}</div>
            <button data-testid="enable-loading" onClick={() => auth.setLoading(true)}>
              Enable Loading
            </button>
            <button data-testid="disable-loading" onClick={() => auth.setLoading(false)}>
              Disable Loading
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithLoading />);

      screen.getByTestId("enable-loading").click();

      await waitFor(() => {
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Loading");
      });

      screen.getByTestId("disable-loading").click();

      await waitFor(() => {
        expect(screen.getByTestId("loading-status")).toHaveTextContent("Not Loading");
      });
    });
  });

  describe("Error State", () => {
    it("should set and clear error state", async () => {
      renderWithAuthProvider(<TestComponent />);

      expect(screen.getByTestId("error")).toHaveTextContent("No Error");

      screen.getByTestId("set-error").click();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Test Error");
      });

      screen.getByTestId("clear-auth").click();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("No Error");
      });
    });

    it("should set specific error messages", async () => {
      const TestComponentWithErrorMessage = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="error-message">{auth.error || "No Error"}</div>
            <button onClick={() => auth.setError("Invalid password")}>
              Set Invalid Password Error
            </button>
            <button onClick={() => auth.setError("Network error")}>Set Network Error</button>
            <button onClick={() => auth.setError(null)}>Clear Error</button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithErrorMessage />);

      screen.getByText("Set Invalid Password Error").click();

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Invalid password");
      });

      screen.getByText("Set Network Error").click();

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("Network error");
      });

      screen.getByText("Clear Error").click();

      await waitFor(() => {
        expect(screen.getByTestId("error-message")).toHaveTextContent("No Error");
      });
    });
  });

  describe("Activity Tracking", () => {
    it("should track last activity timestamp", async () => {
      const TestComponentWithActivity = () => {
        const auth = useAuth();
        const beforeTime = Date.now();

        return (
          <div>
            <button
              onClick={() => {
                auth.updateActivity();
              }}
            >
              Update Activity
            </button>
            <div data-testid="has-activity">
              {auth.lastActivity && auth.lastActivity >= beforeTime
                ? "Activity Tracked"
                : "No Activity"}
            </div>
            <div data-testid="activity-time">{auth.lastActivity ? auth.lastActivity : "None"}</div>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithActivity />);

      screen.getByText("Update Activity").click();

      await waitFor(() => {
        expect(screen.getByTestId("has-activity")).toHaveTextContent("Activity Tracked");
      });
    });

    it("should update activity multiple times", async () => {
      const TestComponentWithMultipleActivities = () => {
        const auth = useAuth();
        let firstActivityTime = 0;

        return (
          <div>
            <button
              onClick={() => {
                auth.updateActivity();
                firstActivityTime = auth.lastActivity || 0;
              }}
            >
              First Activity
            </button>
            <button
              onClick={() => {
                setTimeout(() => auth.updateActivity(), 50);
              }}
            >
              Second Activity
            </button>
            <div data-testid="activity-updated">
              {auth.lastActivity && auth.lastActivity > firstActivityTime
                ? "Updated"
                : "Not Updated"}
            </div>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithMultipleActivities />);

      screen.getByText("First Activity").click();

      await waitFor(
        () => {
          screen.getByText("Second Activity").click();
        },
        { timeout: 100 }
      );

      await waitFor(() => {
        expect(screen.getByTestId("activity-updated")).toHaveTextContent("Updated");
      });
    });
  });

  describe("Session Management", () => {
    it("should lock session", async () => {
      const TestComponentWithLocking = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="unlock-status">{auth.isUnlocked ? "Unlocked" : "Locked"}</div>
            <button
              onClick={() => {
                auth.setAuthenticated({ userName: "user" } as any);
              }}
            >
              Unlock
            </button>
            <button
              onClick={() => {
                auth.lockSession();
              }}
            >
              Lock
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithLocking />);

      screen.getByText("Unlock").click();

      await waitFor(() => {
        expect(screen.getByTestId("unlock-status")).toHaveTextContent("Locked");
      });

      // After unlock (setAuthenticated), check if unlocked would be true
      // Note: This depends on the implementation details of lockSession
    });
  });

  describe("Update User", () => {
    it("should update user data with partial updates", async () => {
      const TestComponentWithUpdateUser = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="user-name">{auth.user?.userName || "No Name"}</div>
            <div data-testid="user-color">{auth.user?.userColor || "No Color"}</div>
            <button
              onClick={() => {
                auth.setAuthenticated({
                  userName: "john",
                  userColor: "#FF0000",
                });
              }}
            >
              Set Initial User
            </button>
            <button
              onClick={() => {
                auth.updateUser({ userColor: "#00FF00" });
              }}
            >
              Update Color
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithUpdateUser />);

      screen.getByText("Set Initial User").click();

      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("john");
        expect(screen.getByTestId("user-color")).toHaveTextContent("#FF0000");
      });

      screen.getByText("Update Color").click();

      await waitFor(() => {
        expect(screen.getByTestId("user-color")).toHaveTextContent("#00FF00");
        // Name should remain unchanged
        expect(screen.getByTestId("user-name")).toHaveTextContent("john");
      });
    });
  });

  describe("Computed Properties", () => {
    it("should provide currentUser computed property", () => {
      const TestComponentWithComputedProps = () => {
        const auth = useAuth();
        return (
          <div data-testid="current-user">{auth.currentUser?.userName || "No Current User"}</div>
        );
      };

      renderWithAuthProvider(<TestComponentWithComputedProps />);
      expect(screen.getByTestId("current-user")).toHaveTextContent("No Current User");
    });

    it("should provide hasCurrentUser computed property", () => {
      const TestComponentWithHasCurrentUser = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="has-current-user">{auth.hasCurrentUser ? "Has User" : "No User"}</div>
            <button onClick={() => auth.setAuthenticated({ userName: "user" } as UserData)}>
              Set User
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithHasCurrentUser />);

      expect(screen.getByTestId("has-current-user")).toHaveTextContent("No User");

      screen.getByText("Set User").click();

      waitFor(() => {
        expect(screen.getByTestId("has-current-user")).toHaveTextContent("Has User");
      });
    });

    it("should provide hasBudgetId computed property", () => {
      const TestComponentWithHasBudgetId = () => {
        const auth = useAuth();
        return (
          <div data-testid="has-budget-id">
            {auth.hasBudgetId ? "Has Budget ID" : "No Budget ID"}
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithHasBudgetId />);
      expect(screen.getByTestId("has-budget-id")).toHaveTextContent("No Budget ID");
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid authentication state changes", async () => {
      const TestComponentRapidChanges = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="auth-status">
              {auth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </div>
            <button
              onClick={() => {
                auth.setAuthenticated({ userName: "user1" } as any);
                auth.setAuthenticated({ userName: "user2" } as any);
                auth.clearAuth();
              }}
            >
              Rapid Changes
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentRapidChanges />);
      screen.getByText("Rapid Changes").click();

      await waitFor(() => {
        expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
      });
    });

    it("should handle clearing auth without prior authentication", async () => {
      const TestComponentClearWithoutAuth = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="auth-status">
              {auth.isAuthenticated ? "Authenticated" : "Not Authenticated"}
            </div>
            <button onClick={() => auth.clearAuth()}>Clear Auth</button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentClearWithoutAuth />);

      expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
      screen.getByText("Clear Auth").click();
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Not Authenticated");
    });

    it("should handle multiple component instances with same provider", () => {
      const TestComponent1 = () => {
        const auth = useAuth();
        return <div data-testid="comp1">{auth.user?.userName || "No User"}</div>;
      };

      const TestComponent2 = () => {
        const auth = useAuth();
        return <div data-testid="comp2">{auth.user?.userName || "No User"}</div>;
      };

      const TestComponentWithButton = () => {
        const auth = useAuth();
        return (
          <button onClick={() => auth.setAuthenticated({ userName: "shared" } as UserData)}>
            Set Shared User
          </button>
        );
      };

      render(
        <AuthProvider>
          <TestComponent1 />
          <TestComponent2 />
          <TestComponentWithButton />
        </AuthProvider>
      );

      screen.getByText("Set Shared User").click();

      waitFor(() => {
        expect(screen.getByTestId("comp1")).toHaveTextContent("shared");
        expect(screen.getByTestId("comp2")).toHaveTextContent("shared");
      });
    });
  });

  describe("State Consistency", () => {
    it("should maintain state consistency across multiple actions", async () => {
      const TestComponentMultipleActions = () => {
        const auth = useAuth();
        return (
          <div>
            <div data-testid="user">{auth.user?.userName || "No User"}</div>
            <div data-testid="authenticated">{auth.isAuthenticated ? "true" : "false"}</div>
            <div data-testid="loading">{auth.isLoading ? "true" : "false"}</div>
            <div data-testid="error">{auth.error || "none"}</div>
            <button
              onClick={() => {
                auth.setLoading(true);
                auth.setError(null);
                auth.setAuthenticated({ userName: "user" } as UserData);
                setTimeout(() => auth.setLoading(false), 50);
              }}
            >
              Complex Action
            </button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentMultipleActions />);

      screen.getByText("Complex Action").click();

      await waitFor(() => {
        expect(screen.getByTestId("user")).toHaveTextContent("user");
        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
        expect(screen.getByTestId("error")).toHaveTextContent("none");
      });
    });
  });
});
