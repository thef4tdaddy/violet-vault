import { renderHook, act } from "@testing-library/react";
import { useModalManager } from "../useModalManager";

describe("useModalManager", () => {
  it("should initialize with all modals closed", () => {
    const { result } = renderHook(() => useModalManager());

    expect(result.current.modals).toEqual({});
    expect(result.current.getOpenModalsCount()).toBe(0);
  });

  it("should open a modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(true);
    expect(result.current.getOpenModalsCount()).toBe(1);
  });

  it("should close a modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("testModal");
    });

    act(() => {
      result.current.closeModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(false);
    expect(result.current.getOpenModalsCount()).toBe(0);
  });

  it("should handle multiple modals", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    expect(result.current.isModalOpen("modal1")).toBe(true);
    expect(result.current.isModalOpen("modal2")).toBe(true);
    expect(result.current.isModalOpen("modal3")).toBe(true);
    expect(result.current.getOpenModalsCount()).toBe(3);
  });

  it("should maintain other modals when closing one modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });

    act(() => {
      result.current.closeModal("modal2");
    });

    expect(result.current.isModalOpen("modal1")).toBe(true);
    expect(result.current.isModalOpen("modal2")).toBe(false);
    expect(result.current.isModalOpen("modal3")).toBe(true);
    expect(result.current.getOpenModalsCount()).toBe(2);
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

    expect(result.current.getOpenModalsCount()).toBe(0);
    expect(result.current.isModalOpen("modal1")).toBe(false);
    expect(result.current.isModalOpen("modal2")).toBe(false);
    expect(result.current.isModalOpen("modal3")).toBe(false);
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

    act(() => {
      result.current.toggleModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(true);

    act(() => {
      result.current.toggleModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(false);
  });

  it("should handle opening same modal multiple times", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("testModal");
      result.current.openModal("testModal");
      result.current.openModal("testModal");
    });

    expect(result.current.isModalOpen("testModal")).toBe(true);
    expect(result.current.getOpenModalsCount()).toBe(1);
  });

  it("should handle closing non-existent modal", () => {
    const { result } = renderHook(() => useModalManager());

    act(() => {
      result.current.openModal("modal1");
    });

    act(() => {
      result.current.closeModal("nonExistent");
    });

    expect(result.current.isModalOpen("modal1")).toBe(true);
    expect(result.current.getOpenModalsCount()).toBe(1);
  });

  it("should initialize with custom initial modals", () => {
    const initialModals = {
      modal1: true,
      modal2: false,
      modal3: true,
    };

    const { result } = renderHook(() => useModalManager(initialModals));

    expect(result.current.isModalOpen("modal1")).toBe(true);
    expect(result.current.isModalOpen("modal2")).toBe(false);
    expect(result.current.isModalOpen("modal3")).toBe(true);
    expect(result.current.getOpenModalsCount()).toBe(2);
  });

  it("should count open modals correctly", () => {
    const { result } = renderHook(() => useModalManager());

    expect(result.current.getOpenModalsCount()).toBe(0);

    act(() => {
      result.current.openModal("modal1");
    });
    expect(result.current.getOpenModalsCount()).toBe(1);

    act(() => {
      result.current.openModal("modal2");
      result.current.openModal("modal3");
    });
    expect(result.current.getOpenModalsCount()).toBe(3);

    act(() => {
      result.current.closeModal("modal2");
    });
    expect(result.current.getOpenModalsCount()).toBe(2);

    act(() => {
      result.current.closeAllModals();
    });
    expect(result.current.getOpenModalsCount()).toBe(0);
  });
});
