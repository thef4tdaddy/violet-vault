import { useState, useEffect } from "react";
import { useReceipts } from "../common/useReceipts";
import { useTransactions } from "../common/useTransactions";
import { useEnvelopes } from "../budgeting/useEnvelopes";
import logger from "../../utils/common/logger";
import type { Envelope } from "@/types/finance";

interface ReceiptData {
  merchant?: string;
  total?: number;
  date?: string;
  imageData?: string;
  rawText?: string;
  confidence?: number;
  items?: unknown[];
  tax?: number;
  subtotal?: number;
  processingTime?: number;
}

/**
 * Hook for managing receipt-to-transaction conversion process
 * Handles form state, envelope suggestions, and submission workflow
 */
export const useReceiptToTransaction = (receiptData: ReceiptData) => {
  const { addReceiptAsync } = useReceipts();
  const { addTransactionAsync } = useTransactions();
  const { envelopes } = useEnvelopes();

  const [transactionForm, setTransactionForm] = useState({
    description: receiptData?.merchant || "",
    amount: receiptData?.total || 0,
    date: receiptData?.date || new Date().toISOString().split("T")[0],
    envelopeId: "",
    category: "shopping",
    type: "expense",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Edit data, 2: Select envelope, 3: Confirm

  // Auto-suggest envelope based on merchant
  useEffect(() => {
    if (receiptData?.merchant && envelopes.length > 0) {
      const suggestedEnvelope = suggestEnvelopeForMerchant(receiptData.merchant, envelopes);
      if (suggestedEnvelope) {
        setTransactionForm((prev) => ({
          ...prev,
          envelopeId: suggestedEnvelope.envelope.id,
          category: suggestedEnvelope.category,
        }));
      }
    }
  }, [receiptData?.merchant, envelopes]);

  const handleFormChange = (field: string, value: string | number) => {
    setTransactionForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!transactionForm.description || !transactionForm.amount) {
      return { success: false, error: "Description and amount are required" };
    }

    setIsSubmitting(true);

    try {
      // Create the transaction with proper type casting
      const transaction = await addTransactionAsync({
        amount: Math.abs(parseFloat(transactionForm.amount)),
        description: transactionForm.description,
        date: transactionForm.date,
        envelopeId: transactionForm.envelopeId,
        category: transactionForm.category,
        type: transactionForm.type as "income" | "expense" | "transfer",
        notes: transactionForm.notes,
      } as Parameters<typeof addTransactionAsync>[0]);

      // Save the receipt with reference to transaction
      const receipt = await addReceiptAsync({
        merchant: receiptData.merchant,
        amount: receiptData.total,
        date: receiptData.date,
        transactionId: transaction.id,
        imageData: receiptData.imageData,
        ocrData: {
          rawText: receiptData.rawText,
          confidence: receiptData.confidence,
          items: receiptData.items,
          tax: receiptData.tax,
          subtotal: receiptData.subtotal,
          processingTime: receiptData.processingTime,
        },
      });

      logger.info("✅ Receipt converted to transaction successfully", {
        transactionId: transaction.id,
        receiptId: receipt.id,
        merchant: receiptData.merchant,
        amount: receiptData.total,
      });

      return { success: true, transaction, receipt };
    } catch (error) {
      logger.error("❌ Failed to create transaction from receipt:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    transactionForm,
    isSubmitting,
    step,
    envelopes,
    handleFormChange,
    handleNext,
    handleBack,
    handleSubmit,
    setStep,
  };
};

/**
 * Suggest envelope based on merchant name
 */
const suggestEnvelopeForMerchant = (merchant: string, envelopes: Envelope[]) => {
  if (!merchant || !envelopes.length) return null;

  const merchantLower = merchant.toLowerCase();

  const suggestions = [
    {
      keywords: ["walmart", "target", "grocery", "food", "market"],
      category: "groceries",
    },
    {
      keywords: ["gas", "shell", "exxon", "chevron", "fuel"],
      category: "transportation",
    },
    {
      keywords: ["restaurant", "mcdonald", "pizza", "cafe", "dining"],
      category: "dining",
    },
    {
      keywords: ["pharmacy", "cvs", "walgreens", "health"],
      category: "healthcare",
    },
    { keywords: ["home depot", "lowes", "hardware"], category: "home" },
  ];

  for (const suggestion of suggestions) {
    if (suggestion.keywords.some((keyword) => merchantLower.includes(keyword))) {
      const matchingEnvelope = envelopes.find(
        (env: Envelope) =>
          env.category?.toLowerCase().includes(suggestion.category) ||
          env.name?.toLowerCase().includes(suggestion.category)
      );

      if (matchingEnvelope) {
        return {
          envelope: matchingEnvelope,
          category: suggestion.category,
        };
      }
    }
  }

  return null;
};

export default useReceiptToTransaction;
