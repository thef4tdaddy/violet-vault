import { render, screen, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
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
        <div data-testid="authenticated">{auth.isAuthenticated ? "Authenticated" : "Not Authenticated"}</div>
        <div data-testid="unlocked">{auth.isUnlocked ? "Unlocked" : "Locked"}</div>
        <div data-testid="loading">{auth.isLoading ? "Loading" : "Not Loading"}</div>
        <button data-testid="set-authenticated" onClick={() => auth.setAuthenticated({ userName: "testuser", userColor: "#000000" } as UserData)}>
          Set Authenticated
        </button>
        <button data-testid="clear-auth" onClick={() => auth.clearAuth()}>
          Clear Auth
        </button>
      </div>
    );
  };

  const renderWithAuthProvider = (component: ReactNode) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  describe("AuthProvider", () => {
    it("should provide auth context to child components", () => {
      renderWithAuthProvider(<TestComponent />);
      expect(screen.getByTestId("user")).toBeInTheDocument();
    });

    it("should initialize with default auth state", () => {
      renderWithAuthProvider(<TestComponent />);
      expect(screen.getByTestId("authenticated")).toHaveTextContent("Not Authenticated");
      expect(screen.getByTestId("unlocked")).toHaveTextContent("Locked");
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
                auth.setAuthenticated(
                  { userName: "testuser", userColor: "#000000" } as UserData,
                  { encryptionKey, salt, sessionToken: "token123" }
                )
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

  describe("Error State", () => {
    it("should set and clear error state", async () => {
      const TestComponentWithError = () => {
        const auth = useAuth();

        return (
          <div>
            <div data-testid="error">{auth.error || "No Error"}</div>
            <button onClick={() => auth.setError("Test Error")}>Set Error</button>
            <button onClick={() => auth.clearAuth()}>Clear Error</button>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithError />);

      expect(screen.getByTestId("error")).toHaveTextContent("No Error");

      screen.getByText("Set Error").click();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("Test Error");
      });

      screen.getByText("Clear Error").click();

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent("No Error");
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
              {auth.lastActivity && auth.lastActivity >= beforeTime ? "Activity Tracked" : "No Activity"}
            </div>
          </div>
        );
      };

      renderWithAuthProvider(<TestComponentWithActivity />);

      screen.getByText("Update Activity").click();

      await waitFor(() => {
        expect(screen.getByTestId("has-activity")).toHaveTextContent("Activity Tracked");
      });
    });
  });
});
