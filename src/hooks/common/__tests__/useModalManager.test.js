import { renderHook, act } from "@testing-library/react";
import { useModalManager } from "../useModalManager";

describe("useModalManager", () => {
  it("should initialize with all modals closed", () => {
    const { result } = renderHook(() => useModalManager());

    expect(result.current.openModals).toEqual(new Set());
    expect(result.current.modalStack).toEqual([]);
    expect(result.current.activeModal).toBe(null);
  });

  it("should open a modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("testModal");
    });

    expect(result.current.openModals.has("testModal")).toBe(true);
    expect(result.current.modalStack).toEqual(["testModal"]);
    expect(result.current.activeModal).toBe("testModal");
  });

  it("should close a modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("testModal");
    });

    act(() => {
      result.current.closeModal("testModal");
    });

    expect(result.current.openModals.has("testModal")).toBe(false);
    expect(result.current.modalStack).toEqual([]);
    expect(result.current.activeModal).toBe(null);
  });

  it("should handle multiple modals in stack order", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    expect(result.current.modalStack).toEqual(["modal1", "modal2", "modal3"]);
    expect(result.current.activeModal).toBe("modal3"); // Latest opened is active
  });

  it("should maintain stack order when closing middle modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    // Close middle modal
    act(() => {
      result.current.closeModal("modal2");
    });

    expect(result.current.modalStack).toEqual(["modal1", "modal3"]);
    expect(result.current.activeModal).toBe("modal3");
    expect(result.current.openModals.has("modal2")).toBe(false);
  });

  it("should update active modal when closing the current active modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
    });

    expect(result.current.activeModal).toBe("modal2");

    // Close the active modal
    act(() => {
      result.current.closeModal("modal2");
    });

    expect(result.current.activeModal).toBe("modal1"); // Previous modal becomes active
  });

  it("should close all modals", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    act(() => {
      result.current.closeAllModals();
    });

    expect(result.current.openModals.size).toBe(0);
    expect(result.current.modalStack).toEqual([]);
    expect(result.current.activeModal).toBe(null);
  });

  it("should check if modal is open", () => {
    const { result } = renderHook(() => useModalManager());

    expect(result.current.isModalOpen("testModal")).toBe(false);

    act(() => {
      result.current.openModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(true);

    act(() => {
      result.current.closeModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(false);
  });

  it("should toggle modal state", () => {
    const { result } = renderHook(() => useModalManager());

    // Toggle open
    act(() => {
      result.current.toggleModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(true);

    // Toggle closed
    act(() => {
      result.current.toggleModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(false);
  });

  it("should get modal depth in stack", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    expect(result.current.getModalDepth("modal1")).toBe(0); // First in stack
    expect(result.current.getModalDepth("modal2")).toBe(1);
    expect(result.current.getModalDepth("modal3")).toBe(2); // Last in stack
    expect(result.current.getModalDepth("nonExistent")).toBe(-1);
  });

  it("should handle opening same modal multiple times", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("testModal");
      result.current.openModal("testModal");
      result.current.openModal("testModal");
    });

    expect(result.current.modalStack).toEqual(["testModal"]); // Should only appear once
    expect(result.current.openModals.size).toBe(1);
  });

  it("should handle closing non-existent modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
    });

    // Try to close modal that doesn't exist
    act(() => {
      result.current.closeModal("nonExistent");
    });

    // Should not affect existing modals
    expect(result.current.modalStack).toEqual(["modal1"]);
    expect(result.current.activeModal).toBe("modal1");
  });

  it("should provide modal count", () => {
    const { result } = renderHook(() => useModalManager());

    expect(result.current.modalCount).toBe(0);

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
    });

    expect(result.current.modalCount).toBe(2);

    act(() => {
      result.current.closeModal("modal1");
    });

    expect(result.current.modalCount).toBe(1);
  });

  it("should check if any modal is open", () => {
    const { result } = renderHook(() => useModalManager());

    expect(result.current.hasOpenModals).toBe(false);

    act(() => {
      result.current.openModal("testModal");
    });

    expect(result.current.hasOpenModals).toBe(true);

    act(() => {
      result.current.closeModal("testModal");
    });

    expect(result.current.hasOpenModals).toBe(false);
  });

  it("should get all open modal names", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    const openModalNames = result.current.getOpenModalNames();
    expect(openModalNames).toEqual(
      expect.arrayContaining(["modal1", "modal2", "modal3"]),
    );
    expect(openModalNames).toHaveLength(3);
  });

  it("should close modal by position in stack", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    // Close modal at position 1 (modal2)
    act(() => {
      result.current.closeModalByPosition(1);
    });

    expect(result.current.modalStack).toEqual(["modal1", "modal3"]);
    expect(result.current.isModalOpen("modal2")).toBe(false);
  });

  it("should handle invalid position when closing by position", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
    });

    // Try to close at invalid positions
    act(() => {
      result.current.closeModalByPosition(-1);
      result.current.closeModalByPosition(5);
    });

    // Should not affect existing modals
    expect(result.current.modalStack).toEqual(["modal1"]);
    expect(result.current.activeModal).toBe("modal1");
  });

  it("should close modals from top of stack", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    // Close top modal
    act(() => {
      result.current.closeTopModal();
    });

    expect(result.current.modalStack).toEqual(["modal1", "modal2"]);
    expect(result.current.activeModal).toBe("modal2");
  });

  it("should handle closing top modal when no modals are open", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.closeTopModal();
    });

    expect(result.current.modalStack).toEqual([]);
    expect(result.current.activeModal).toBe(null);
  });

  it("should replace current modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
    });

    // Replace current modal
    act(() => {
      result.current.replaceCurrentModal("modal3");
    });

    expect(result.current.modalStack).toEqual(["modal1", "modal3"]);
    expect(result.current.activeModal).toBe("modal3");
    expect(result.current.isModalOpen("modal2")).toBe(false);
  });

  it("should handle replacing when no modals are open", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.replaceCurrentModal("modal1");
    });

    expect(result.current.modalStack).toEqual(["modal1"]);
    expect(result.current.activeModal).toBe("modal1");
  });
});
