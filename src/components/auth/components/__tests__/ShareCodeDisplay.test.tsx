import { render, screen, waitFor, act, fireEvent } from "../../../../test/test-utils";
import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from "vitest";
import ShareCodeDisplay from "../ShareCodeDisplay";
import React from "react";
import "@testing-library/jest-dom"; // Ensure custom matchers are available

// Mock dependencies
vi.mock("../../../ui", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    className,
    type,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    className?: string;
    type?: string;
    [key: string]: unknown;
  }) => (
    <button
      type={type as "button" | "submit" | "reset"}
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  ),
}));

vi.mock("../../../../utils", () => ({
  renderIcon: (name: string, props?: { className?: string }) => (
    <span data-testid={`icon-${name}`} className={props?.className}>
      {name}
    </span>
  ),
}));

describe("ShareCodeDisplay", () => {
  const mockShareCode = "alpha bravo charlie delta";
  const mockOnCreateBudget = vi.fn();
  const mockOnBack = vi.fn();
  let mockClipboard: { writeText: Mock };

  beforeEach(() => {
    // Mock clipboard API
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.defineProperty(navigator, "clipboard", {
      value: mockClipboard,
      writable: true,
      configurable: true,
    });

    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();

    // Mock Blob using stubGlobal
    vi.stubGlobal(
      "Blob",
      vi.fn(function (content, options) {
        return {
          content,
          options,
          size: content[0].length,
          type: options?.type,
        };
      })
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe("Rendering", () => {
    it("should render the component with all required elements", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      // Check for warning header
      expect(screen.getByText("CRITICAL: Save Your Share Code")).toBeInTheDocument();
      expect(
        screen.getByText(
          /You need this code to access your budget on other devices. If you lose it, you cannot recover your budget!/
        )
      ).toBeInTheDocument();

      // Check for title
      expect(screen.getByText("Your Budget Share Code")).toBeInTheDocument();

      // Check for instructions
      expect(screen.getByText("How to use your share code:")).toBeInTheDocument();
    });

    it("should display the share code with capitalized first letters", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      // The component capitalizes the first letter of each word
      expect(screen.getByText(/🔑 Alpha Bravo Charlie Delta/)).toBeInTheDocument();
    });

    it("should render Copy Code button", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(screen.getByText("Copy Code")).toBeInTheDocument();
    });

    it("should render Save to File button", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(screen.getByText("Save to File")).toBeInTheDocument();
    });

    it("should render Back button", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(screen.getByText("Back")).toBeInTheDocument();
    });

    it("should render Create My Budget button when not loading", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(screen.getByText("Create My Budget")).toBeInTheDocument();
    });

    it("should render Creating... text when loading", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      expect(screen.getByText("Creating...")).toBeInTheDocument();
      expect(screen.queryByText("Create My Budget")).not.toBeInTheDocument();
    });

    it("should render all icons correctly", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(screen.getByTestId("icon-AlertTriangle")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Copy")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Download")).toBeInTheDocument();
      expect(screen.getByTestId("icon-ArrowLeft")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Rocket")).toBeInTheDocument();
    });

    it("should render loading spinner icon when loading", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      expect(screen.getByTestId("icon-Loader2")).toBeInTheDocument();
    });
  });

  describe("Copy Functionality", () => {
    it("should copy share code to clipboard when Copy button is clicked", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const copyButton = screen.getByText("Copy Code").closest("button");
      fireEvent.click(copyButton!);

      expect(mockClipboard.writeText).toHaveBeenCalledWith(mockShareCode);
    });

    it("should show Copied! text temporarily after successful copy", async () => {
      vi.useFakeTimers();

      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const copyButton = screen.getByText("Copy Code").closest("button");

      // Trigger copy
      fireEvent.click(copyButton!);

      // Should show "Copied!" immediately
      // Since we use fake timers, the state update from the click (and promised writeText) might need a tick
      // But fireEvent is synchronous. The writeText is async though.
      await act(async () => {
        await Promise.resolve(); // Flush microtasks
      });

      expect(screen.getByText("Copied!")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Check")).toBeInTheDocument();

      // Advance time to trigger setTimeout
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      // Should revert back
      expect(screen.getByText("Copy Code")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("should handle clipboard copy failure gracefully", async () => {
      mockClipboard.writeText.mockRejectedValue(new Error("Clipboard error"));

      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const copyButton = screen.getByText("Copy Code").closest("button");
      await act(async () => {
        fireEvent.click(copyButton!);
      });

      // Should not show "Copied!" on failure
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });
  });

  describe("Download Functionality", () => {
    it("should create a blob with correct content and trigger download", () => {
      const createdAnchors: HTMLAnchorElement[] = [];
      const originalCreateElement = document.createElement.bind(document);

      const mockCreateElement = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName, options) => {
          const element = originalCreateElement(tagName, options);
          if (tagName === "a") {
            createdAnchors.push(element as HTMLAnchorElement);
            // Spy on the click method of the created anchor
            vi.spyOn(element, "click");
          }
          return element;
        });

      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const downloadButton = screen.getByText("Save to File").closest("button");
      fireEvent.click(downloadButton!);

      expect(global.Blob).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining(mockShareCode)]),
        { type: "text/plain" }
      );

      // Check that URL methods were called
      expect(global.URL.createObjectURL).toHaveBeenCalled();

      // Check that anchor tag was clicked
      // We expect the last created anchor to be the one (in case other anchors exist)
      // The filename includes the date, so we check for the prefix
      expect(createdAnchors.length).toBeGreaterThan(0);
      const downloadLink = createdAnchors.find((a) =>
        a.download.startsWith("violet-vault-share-code-")
      );
      expect(downloadLink).toBeDefined();
      expect(downloadLink?.click).toHaveBeenCalled();

      expect(global.URL.revokeObjectURL).toHaveBeenCalled();

      mockCreateElement.mockRestore();
    });

    it("should include warning and instructions in downloaded file", () => {
      // Setup a spy to capture the blob content
      let capturedContent = "";
      // Re-stub for this specific test to capture content
      vi.stubGlobal(
        "Blob",
        vi.fn(function (content) {
          capturedContent = content[0];
          return { size: content[0].length };
        })
      );

      // Use the same safe mocking strategy
      const createdAnchors: HTMLAnchorElement[] = [];
      const originalCreateElement = document.createElement.bind(document);

      const mockCreateElement = vi
        .spyOn(document, "createElement")
        .mockImplementation((tagName, options) => {
          const element = originalCreateElement(tagName, options);
          if (tagName === "a") {
            createdAnchors.push(element as HTMLAnchorElement);
            vi.spyOn(element, "click");
          }
          return element;
        });

      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const downloadButton = screen.getByText("Save to File").closest("button");
      fireEvent.click(downloadButton!);

      expect(capturedContent).toContain("Violet Vault Budget Share Code");
      expect(capturedContent).toContain("⚠️  IMPORTANT");
      expect(capturedContent).toContain(mockShareCode);
      expect(capturedContent).toContain("Instructions:");
      expect(capturedContent).toContain("Keep this code private and secure");

      mockCreateElement.mockRestore();
    });
  });

  describe("Button Interactions", () => {
    it("should call onBack when Back button is clicked", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const backButton = screen.getByText("Back").closest("button");
      fireEvent.click(backButton!);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it("should call onCreateBudget when Create My Budget button is clicked", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const createButton = screen.getByText("Create My Budget").closest("button");
      fireEvent.click(createButton!);

      expect(mockOnCreateBudget).toHaveBeenCalledTimes(1);
    });

    it("should disable Back button when loading", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      const backButton = screen.getByText("Back").closest("button");
      expect(backButton).toBeDisabled();
    });

    it("should disable Create My Budget button when loading", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      const createButton = screen.getByText("Creating...").closest("button");
      expect(createButton).toBeDisabled();
    });
  });

  describe("Share Code Formatting", () => {
    it("should capitalize first letter of each word in share code", () => {
      const lowercase = "word1 word2 word3 word4";

      render(
        <ShareCodeDisplay
          shareCode={lowercase}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(screen.getByText(/🔑 Word1 Word2 Word3 Word4/)).toBeInTheDocument();
    });

    it("should handle mixed case share codes", () => {
      const mixedCase = "WoRd1 wOrD2 WORD3 word4";

      render(
        <ShareCodeDisplay
          shareCode={mixedCase}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      // The component capitalizes first letter and KEEPS the rest so check for preserved case
      expect(screen.getByText(/🔑 WoRd1 WOrD2 WORD3 Word4/)).toBeInTheDocument();
    });

    it("should handle empty share code gracefully", () => {
      render(
        <ShareCodeDisplay
          shareCode=""
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      // Should render without error
      expect(screen.getByText("Your Budget Share Code")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper button types", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const buttons = screen.getAllByTestId("button");
      buttons.forEach((button) => {
        expect(button).toHaveAttribute("type", "button");
      });
    });

    it("should have disabled state on buttons when loading", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={true}
        />
      );

      const backButton = screen.getByText("Back").closest("button");
      const createButton = screen.getByText("Creating...").closest("button");

      expect(backButton).toHaveAttribute("disabled");
      expect(createButton).toHaveAttribute("disabled");
    });
  });

  describe("Instructions Section", () => {
    it("should render all instruction items", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      expect(
        screen.getByText(/Keep this code private and secure \(like a password\)/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/To access your budget: enter your password \+ this share code/)
      ).toBeInTheDocument();
      expect(screen.getByText(/Same code works on all your devices/)).toBeInTheDocument();
      expect(screen.getByText(/No more device-specific lockouts!/)).toBeInTheDocument();
    });
  });

  describe("Warning Section", () => {
    it("should render warning header with proper styling context", () => {
      render(
        <ShareCodeDisplay
          shareCode={mockShareCode}
          onCreateBudget={mockOnCreateBudget}
          onBack={mockOnBack}
          isLoading={false}
        />
      );

      const warningHeader = screen.getByText("CRITICAL: Save Your Share Code");
      expect(warningHeader).toBeInTheDocument();

      // Check parent elements for appropriate styling classes
      const warningContainer = warningHeader.closest(".bg-red-50");
      expect(warningContainer).toBeInTheDocument();
    });
  });
});
