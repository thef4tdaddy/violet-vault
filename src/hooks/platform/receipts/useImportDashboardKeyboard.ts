import { useEffect } from "react";

/**
 * Keyboard shortcuts for import dashboard
 * D = Digital mode, S = Scan mode
 */
export const useImportDashboardKeyboard = (
  setSelectedMode: (mode: "digital" | "scan") => void
) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case "d":
          setSelectedMode("digital");
          break;
        case "s":
          setSelectedMode("scan");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line zustand-safe-patterns/zustand-no-store-actions-in-deps -- setSelectedMode is a React setState, not a Zustand action
  }, [setSelectedMode]);
};
