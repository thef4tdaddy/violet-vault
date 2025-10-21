import { renderHook, act, waitFor } from "@testing-library/react";
import { Select } from "@/components/ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSmartCategoryManager } from "../useSmartCategoryManager";

// Mock dependencies
vi.mock("../../../services/smartCategoryService", () => ({
  smartCategoryService: {
    analyzeCategoryPatterns: vi.fn(),
    suggestCategories: vi.fn(),
    applyCategoryMapping: vi.fn(),
    trainCategoryModel: vi.fn(),
    getModelAccuracy: vi.fn(),
  },
}));

vi.mock("../../common/useTransactions", () => ({
  useTransactions: vi.fn(() => ({
    transactions: [],
    updateTransaction: vi.fn(),
    isLoading: false,
  })),
}));

vi.mock("../../budgeting/useEnvelopes", () => ({
  useEnvelopes: vi.fn(() => ({
    envelopes: [],
    isLoading: false,
  })),
}));

vi.mock("../../../utils/common/logger", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

const { smartCategoryService } = require("../../../services/smartCategoryService");
const { useTransactions } = require("../../common/useTransactions");
const { useEnvelopes } = require("../../budgeting/useEnvelopes");

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useSmartCategoryManager", () => {
  const mockTransactions = [
    {
      id: "1",
      description: "Walmart Grocery",
      amount: -85.5,
      envelopeId: "",
      date: "2023-09-01",
    },
    {
      id: "2",
      description: "Shell Gas Station",
      amount: -35.0,
      envelopeId: "",
      date: "2023-09-02",
    },
  ];

  const mockEnvelopes = [
    { id: "env1", name: "Groceries" },
    { id: "env2", name: "Transportation" },
    { id: "env3", name: "Dining Out" },
  ];

  const mockSuggestions = [
    {
      transactionId: "1",
      description: "Walmart Grocery",
      suggestedEnvelopeId: "env1",
      envelopeName: "Groceries",
      confidence: 0.92,
      reason: "Matched pattern: grocery stores",
    },
    {
      transactionId: "2",
      description: "Shell Gas Station",
      suggestedEnvelopeId: "env2",
      envelopeName: "Transportation",
      confidence: 0.88,
      reason: "Matched pattern: gas stations",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    useTransactions.mockReturnValue({
      transactions: mockTransactions,
      updateTransaction: vi.fn(),
      isLoading: false,
    });

    useEnvelopes.mockReturnValue({
      envelopes: mockEnvelopes,
      isLoading: false,
    });
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isAnalyzing).toBe(false);
    expect(result.current.isApplying).toBe(false);
    expect(result.current.selectedSuggestions).toEqual([]);
    expect(result.current.modelAccuracy).toBe(null);
    expect(result.current.analysisResults).toBe(null);
  });

  it("should analyze transactions and generate suggestions", async () => {
    smartCategoryService.suggestCategories.mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.analyzeSuggestions();
    });

    expect(smartCategoryService.suggestCategories).toHaveBeenCalledWith(
      mockTransactions,
      mockEnvelopes
    );
    expect(result.current.suggestions).toEqual(mockSuggestions);
    expect(result.current.isAnalyzing).toBe(false);
  });

  it("should handle analysis errors gracefully", async () => {
    const mockError = new Error("Analysis failed");
    smartCategoryService.suggestCategories.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.analyzeSuggestions();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isAnalyzing).toBe(false);
  });

  it("should toggle suggestion selection", () => {
    smartCategoryService.suggestCategories.mockResolvedValue(mockSuggestions);

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
    });

    // Select first suggestion
    act(() => {
      result.current.toggleSuggestionSelection("1");
    });

    expect(result.current.selectedSuggestions).toContain("1");

    // Deselect first suggestion
    act(() => {
      result.current.toggleSuggestionSelection("1");
    });

    expect(result.current.selectedSuggestions).not.toContain("1");
  });

  it("should select all high-confidence suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
    });

    act(() => {
      result.current.selectHighConfidenceSuggestions(0.85);
    });

    // Both suggestions have confidence > 0.85
    expect(result.current.selectedSuggestions).toEqual(["1", "2"]);
  });

  it("should apply selected suggestions", async () => {
    const mockUpdateTransaction = vi.fn();
    useTransactions.mockReturnValue({
      transactions: mockTransactions,
      updateTransaction: mockUpdateTransaction,
      isLoading: false,
    });

    smartCategoryService.applyCategoryMapping.mockResolvedValue({
      success: true,
      appliedCount: 2,
    });

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
      result.current.setSelectedSuggestions(["1", "2"]);
    });

    await act(async () => {
      await result.current.applySelectedSuggestions();
    });

    expect(smartCategoryService.applyCategoryMapping).toHaveBeenCalledWith(
      mockSuggestions.filter((s) => ["1", "2"].includes(s.transactionId)),
      mockUpdateTransaction
    );
    expect(result.current.isApplying).toBe(false);
  });

  it("should handle apply suggestions errors", async () => {
    const mockError = new Error("Apply failed");
    smartCategoryService.applyCategoryMapping.mockRejectedValue(mockError);

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
      result.current.setSelectedSuggestions(["1"]);
    });

    await act(async () => {
      await result.current.applySelectedSuggestions();
    });

    expect(result.current.isApplying).toBe(false);
  });

  it("should train the category model", async () => {
    smartCategoryService.trainCategoryModel.mockResolvedValue({
      success: true,
      accuracy: 0.94,
      trainingSize: 500,
    });

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.trainModel();
    });

    expect(smartCategoryService.trainCategoryModel).toHaveBeenCalledWith(mockTransactions);
  });

  it("should get current model accuracy", async () => {
    smartCategoryService.getModelAccuracy.mockResolvedValue({
      accuracy: 0.89,
      lastTrained: "2023-09-01T12:00:00Z",
      sampleSize: 300,
    });

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.checkModelAccuracy();
    });

    expect(result.current.modelAccuracy).toEqual({
      accuracy: 0.89,
      lastTrained: "2023-09-01T12:00:00Z",
      sampleSize: 300,
    });
  });

  it("should analyze category patterns", async () => {
    const mockPatterns = {
      frequentCategories: ["Groceries", "Gas"],
      categoryAccuracy: { Groceries: 0.95, Gas: 0.88 },
      unusedEnvelopes: ["env3"],
      recommendedEnvelopes: ["Restaurants", "Entertainment"],
    };

    smartCategoryService.analyzeCategoryPatterns.mockResolvedValue(mockPatterns);

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.analyzeCategoryPatterns();
    });

    expect(result.current.analysisResults).toEqual(mockPatterns);
  });

  it("should clear suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
      result.current.setSelectedSuggestions(["1", "2"]);
    });

    act(() => {
      result.current.clearSuggestions();
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.selectedSuggestions).toEqual([]);
  });

  it("should filter suggestions by confidence threshold", () => {
    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
    });

    const highConfidence = result.current.getFilteredSuggestions(0.9);
    const mediumConfidence = result.current.getFilteredSuggestions(0.85);
    const allSuggestions = result.current.getFilteredSuggestions(0.5);

    expect(highConfidence).toHaveLength(1); // Only 0.92 confidence
    expect(mediumConfidence).toHaveLength(2); // Both 0.92 and 0.88
    expect(allSuggestions).toHaveLength(2); // Both suggestions
  });

  it("should provide statistics about suggestions", () => {
    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSuggestions(mockSuggestions);
      result.current.setSelectedSuggestions(["1"]);
    });

    const stats = result.current.getSuggestionStats();

    expect(stats).toEqual({
      total: 2,
      selected: 1,
      highConfidence: 1, // >= 0.90
      mediumConfidence: 1, // 0.70-0.89
      lowConfidence: 0, // < 0.70
      averageConfidence: 0.9, // (0.92 + 0.88) / 2
    });
  });

  it("should handle loading states from dependencies", () => {
    useTransactions.mockReturnValue({
      transactions: [],
      updateTransaction: vi.fn(),
      isLoading: true,
    });

    useEnvelopes.mockReturnValue({
      envelopes: [],
      isLoading: true,
    });

    const { result } = renderHook(() => useSmartCategoryManager(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isDataLoading).toBe(true);
  });
});
