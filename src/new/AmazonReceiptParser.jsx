import React, { useState } from "react";
import {
  Mail,
  ShoppingBag,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Package,
  Calendar,
  DollarSign,
  Download,
  FileText,
  Zap,
  Eye,
  Settings,
} from "lucide-react";

const AmazonReceiptParser = ({
  onNewTransactions,
  onError,
  existingTransactions = [], // Add existing transactions to check for dupes
  envelopes = [], // Add envelopes for category assignment
  className = "",
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedReceipts, setSelectedReceipts] = useState(new Set());
  const [lastSearchDate, setLastSearchDate] = useState(null);
  const [duplicateWarnings, setDuplicateWarnings] = useState(new Set());
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [editingReceipt, setEditingReceipt] = useState(null);
  const [searchFilters, setSearchFilters] = useState({
    dateRange: "30days",
    minAmount: 0,
    includeReturns: false,
    folders: ["INBOX"], // Default to INBOX
  });
  const [splittingReceipt, setSplittingReceipt] = useState(null);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitAllocations, setSplitAllocations] = useState([]);

  // Available categories from envelopes + general categories
  const availableCategories = [
    ...envelopes.map((env) => env.name),
    "Groceries & Food",
    "Electronics & Tech",
    "Home & Kitchen",
    "Clothing & Accessories",
    "Health & Beauty",
    "Books & Media",
    "Sports & Outdoors",
    "Pet Supplies",
    "Office & Business",
    "Amazon Services",
    "General Shopping",
    "Uncategorized",
  ];

  // Remove duplicates and sort
  const uniqueCategories = [...new Set(availableCategories)].sort();

  // Common email folders where Amazon receipts might be found
  const emailFolders = [
    { value: "INBOX", label: "Inbox", icon: "📥" },
    { value: "Shopping", label: "Shopping", icon: "🛍️" },
    { value: "Receipts", label: "Receipts", icon: "🧾" },
    { value: "Amazon", label: "Amazon", icon: "📦" },
    { value: "Orders", label: "Orders", icon: "📋" },
    { value: "Purchases", label: "Purchases", icon: "💳" },
    { value: "Commerce", label: "Commerce", icon: "🏪" },
    { value: "Promotions", label: "Promotions (Gmail)", icon: "🎯" },
    { value: "Updates", label: "Updates (Gmail)", icon: "📱" },
    { value: "Junk", label: "Junk/Spam", icon: "🗑️" },
    { value: "All Mail", label: "All Mail (Gmail)", icon: "📨" },
  ];

  // Amazon category mapping for better organization
  const amazonCategories = {
    "Groceries & Food": {
      keywords:
        /grocery|food|snack|drink|pantry|beverage|fresh|whole foods|amazon fresh/i,
      icon: "🛒",
      color: "#10b981",
    },
    "Electronics & Tech": {
      keywords:
        /electronic|computer|phone|tablet|headphone|cable|charger|tech|device|kindle|echo|fire tv/i,
      icon: "📱",
      color: "#3b82f6",
    },
    "Home & Kitchen": {
      keywords:
        /home|kitchen|furniture|decor|appliance|cookware|bedding|bathroom|cleaning/i,
      icon: "🏠",
      color: "#8b5cf6",
    },
    "Clothing & Accessories": {
      keywords:
        /clothing|shirt|pants|shoes|dress|jacket|accessories|jewelry|watch|apparel/i,
      icon: "👕",
      color: "#ec4899",
    },
    "Health & Beauty": {
      keywords:
        /health|beauty|vitamin|supplement|cosmetic|skincare|personal care|pharmacy/i,
      icon: "💊",
      color: "#06b6d4",
    },
    "Books & Media": {
      keywords: /book|kindle|audible|movie|music|video|dvd|cd|magazine/i,
      icon: "📚",
      color: "#f59e0b",
    },
    "Sports & Outdoors": {
      keywords: /sport|outdoor|fitness|exercise|camping|hiking|athletic|gym/i,
      icon: "⚽",
      color: "#84cc16",
    },
    "Pet Supplies": {
      keywords: /pet|dog|cat|animal|toy|food|treat|collar|leash/i,
      icon: "🐕",
      color: "#f97316",
    },
    "Office & Business": {
      keywords:
        /office|business|supply|paper|pen|desk|chair|printer|stationery/i,
      icon: "📝",
      color: "#6366f1",
    },
    "Amazon Services": {
      keywords:
        /prime|subscription|membership|aws|kindle unlimited|audible|music/i,
      icon: "⭐",
      color: "#a855f7",
    },
  };

  // Check for duplicate transactions
  const checkForDuplicates = (parsedReceipts) => {
    const duplicates = new Set();

    parsedReceipts.forEach((receipt) => {
      // Check for existing transactions with same order ID or similar details
      const isDuplicate = existingTransactions.some((existing) => {
        // Check by Amazon order ID in metadata
        if (existing.metadata?.orderId === receipt.orderId) {
          return true;
        }

        // Check by description and amount and date (within 1 day)
        if (
          existing.description?.includes(receipt.orderId) &&
          Math.abs(existing.amount + receipt.total) < 0.01
        ) {
          return true;
        }

        // Check by date and exact amount match
        const existingDate = new Date(existing.date);
        const receiptDate = new Date(receipt.date);
        const daysDiff =
          Math.abs(existingDate - receiptDate) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 1 && Math.abs(existing.amount + receipt.total) < 0.01) {
          return true;
        }

        return false;
      });

      if (isDuplicate) {
        duplicates.add(receipt.id);
      }
    });

    return duplicates;
  };

  // Find envelope by name or create category mapping
  const findEnvelopeForCategory = (categoryName) => {
    return envelopes.find(
      (env) =>
        env.name.toLowerCase() === categoryName.toLowerCase() ||
        env.category?.toLowerCase() === categoryName.toLowerCase(),
    );
  };
  const parseAmazonReceipt = (emailData) => {
    try {
      const { content, subject, date } = emailData;

      const patterns = {
        orderNumber: /Order #([\w-]+)|Your order of ([\w-]+)/i,
        total:
          /Order Total[:\s]*\$?(\d+[,.]?\d*\.?\d{2})|Total[:\s]*\$?(\d+[,.]?\d*\.?\d{2})/i,
        items: /(\d+)\s*(?:of\s+)?(.+?)\s*\$(\d+[,.]?\d*\.?\d{2})/gi,
        shipping: /Shipping[:\s]*\$?(\d+[,.]?\d*\.?\d{2})/i,
        tax: /Tax[:\s]*\$?(\d+[,.]?\d*\.?\d{2})/i,
        deliveryDate: /Delivery[:\s]*([A-Za-z]+,\s*[A-Za-z]+\s*\d+)/i,
        trackingNumber: /Tracking.*?(\w{10,})/i,
      };

      // Extract order number
      const orderMatch = patterns.orderNumber.exec(content);
      const orderId = orderMatch
        ? orderMatch[1] || orderMatch[2]
        : `ORDER_${Date.now()}`;

      // Extract total amount
      const totalMatch = patterns.total.exec(content);
      const total = totalMatch
        ? parseFloat((totalMatch[1] || totalMatch[2]).replace(/[,$]/g, ""))
        : 0;

      // Extract individual items
      const items = [];
      let itemMatch;
      while ((itemMatch = patterns.items.exec(content)) !== null) {
        const quantity = parseInt(itemMatch[1]) || 1;
        const itemName = itemMatch[2].trim();
        const itemPrice = parseFloat(itemMatch[3].replace(/[,$]/g, ""));

        items.push({
          name: itemName,
          quantity: quantity,
          price: itemPrice,
          totalPrice: quantity * itemPrice,
          category: categorizeItem(itemName),
        });
      }

      // Extract shipping and tax
      const shippingMatch = patterns.shipping.exec(content);
      const shipping = shippingMatch
        ? parseFloat(shippingMatch[1].replace(/[,$]/g, ""))
        : 0;

      const taxMatch = patterns.tax.exec(content);
      const tax = taxMatch ? parseFloat(taxMatch[1].replace(/[,$]/g, "")) : 0;

      // Determine primary category
      const primaryCategory = determinePrimaryCategory(items, subject);

      return {
        id: `amazon_${orderId}_${Date.now()}`,
        orderId: orderId,
        subject: subject,
        date: new Date(date).toISOString().split("T")[0],
        total: total,
        shipping: shipping,
        tax: tax,
        subtotal: total - shipping - tax,
        items: items,
        primaryCategory: primaryCategory.name,
        categoryIcon: primaryCategory.icon,
        categoryColor: primaryCategory.color,
        deliveryDate: patterns.deliveryDate.exec(content)?.[1] || null,
        trackingNumber: patterns.trackingNumber.exec(content)?.[1] || null,
        source: "amazon_email",
        rawEmail: emailData,
      };
    } catch (error) {
      console.error("Error parsing Amazon receipt:", error);
      return null;
    }
  };

  // Categorize individual items
  const categorizeItem = (itemName) => {
    const item = itemName.toLowerCase();

    for (const [categoryName, categoryData] of Object.entries(
      amazonCategories,
    )) {
      if (categoryData.keywords.test(item)) {
        return {
          name: categoryName,
          icon: categoryData.icon,
          color: categoryData.color,
        };
      }
    }

    return {
      name: "General Shopping",
      icon: "🛍️",
      color: "#64748b",
    };
  };

  // Determine primary category for the order
  const determinePrimaryCategory = (items, subject) => {
    if (items.length === 0) {
      return categorizeItem(subject);
    }

    // If single item, use its category
    if (items.length === 1) {
      return items[0].category;
    }

    // For multiple items, use the category with highest total value
    const categoryTotals = {};
    items.forEach((item) => {
      const category = item.category.name;
      if (!categoryTotals[category]) {
        categoryTotals[category] = {
          total: 0,
          ...item.category,
        };
      }
      categoryTotals[category].total += item.totalPrice;
    });

    const primaryCategory = Object.values(categoryTotals).sort(
      (a, b) => b.total - a.total,
    )[0];

    return {
      name: primaryCategory.name,
      icon: primaryCategory.icon,
      color: primaryCategory.color,
    };
  };

  // Search for Amazon receipts via backend API
  const searchAmazonReceipts = async () => {
    setIsSearching(true);
    setSearchResults([]);

    try {
      // Call your backend API endpoint
      const response = await fetch("/api/amazon/search-receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dateRange: searchFilters.dateRange,
          minAmount: searchFilters.minAmount,
          includeReturns: searchFilters.includeReturns,
          folders: searchFilters.folders,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const emailData = await response.json();

      // Parse each email receipt
      const parsedReceipts = emailData.emails
        .map((email) => parseAmazonReceipt(email))
        .filter((receipt) => receipt !== null)
        .filter((receipt) => receipt.total >= searchFilters.minAmount);

      // Check for duplicates
      const duplicateIds = checkForDuplicates(parsedReceipts);
      setDuplicateWarnings(duplicateIds);

      setSearchResults(parsedReceipts);
      setLastSearchDate(new Date());

      if (parsedReceipts.length === 0) {
        onError?.(
          new Error("No Amazon receipts found for the selected criteria"),
        );
      } else if (duplicateIds.size > 0) {
        onError?.(
          new Error(
            `Found ${duplicateIds.size} potential duplicate transactions`,
          ),
        );
      }
    } catch (error) {
      console.error("Error searching receipts:", error);
      onError?.(error);
    } finally {
      setIsSearching(false);
    }
  };

  // Import selected receipts as transactions
  const importSelectedReceipts = () => {
    const selectedReceiptList = searchResults.filter((receipt) =>
      selectedReceipts.has(receipt.id),
    );

    if (selectedReceiptList.length === 0) {
      onError?.(new Error("Please select at least one receipt to import"));
      return;
    }

    // Check for duplicates in selection
    const duplicatesInSelection = selectedReceiptList.filter((receipt) =>
      duplicateWarnings.has(receipt.id),
    );

    if (duplicatesInSelection.length > 0) {
      const proceed = confirm(
        `${duplicatesInSelection.length} selected receipts appear to be duplicates. Import anyway?`,
      );
      if (!proceed) return;
    }

    // Convert to VioletVault transactions
    const transactions = selectedReceiptList.map((receipt) => {
      const envelope = findEnvelopeForCategory(receipt.primaryCategory);

      return {
        id: receipt.id,
        date: receipt.date,
        description: `Amazon Order #${receipt.orderId}`,
        amount: -receipt.total,
        category: receipt.primaryCategory,
        envelopeId: envelope?.id || "", // Assign to envelope if found
        notes: `${receipt.items.length} items${receipt.trackingNumber ? ` • Tracking: ${receipt.trackingNumber}` : ""}`,
        source: "amazon_email",
        reconciled: false,
        metadata: {
          orderId: receipt.orderId,
          items: receipt.items,
          shipping: receipt.shipping,
          tax: receipt.tax,
          deliveryDate: receipt.deliveryDate,
          categoryIcon: receipt.categoryIcon,
          categoryColor: receipt.categoryColor,
        },
      };
    });

    // Send to parent component
    onNewTransactions?.(transactions);

    // Clear selections
    setSelectedReceipts(new Set());
    setDuplicateWarnings(new Set());

    // Show success feedback
    alert(`Successfully imported ${transactions.length} Amazon transactions!`);
  };

  // Edit receipt category
  const editReceiptCategory = (receipt) => {
    setEditingReceipt(receipt);
    setShowCategoryEditor(true);
  };

  const updateReceiptCategory = (selectedCategory, envelopeId) => {
    if (editingReceipt) {
      setSearchResults((prev) =>
        prev.map((receipt) =>
          receipt.id === editingReceipt.id
            ? {
                ...receipt,
                primaryCategory: selectedCategory,
                categoryIcon: amazonCategories[selectedCategory]?.icon || "🛍️",
                categoryColor:
                  amazonCategories[selectedCategory]?.color || "#64748b",
              }
            : receipt,
        ),
      );
      setShowCategoryEditor(false);
      setEditingReceipt(null);
    }
  };

  // Start transaction splitting
  const startSplitTransaction = (receipt) => {
    setSplittingReceipt(receipt);

    // Initialize split allocations with individual items if available
    if (receipt.items && receipt.items.length > 1) {
      const itemAllocations = receipt.items.map((item, index) => ({
        id: Date.now() + index,
        description: item.name,
        amount: item.totalPrice,
        category: item.category.name,
        envelopeId: findEnvelopeForCategory(item.category.name)?.id || "",
        isItem: true,
        originalItem: item,
      }));

      // Add shipping/tax as separate line items if they exist
      const additionalItems = [];
      if (receipt.shipping > 0) {
        additionalItems.push({
          id: Date.now() + 1000,
          description: "Shipping",
          amount: receipt.shipping,
          category: "Shipping & Handling",
          envelopeId: "",
          isItem: false,
        });
      }

      if (receipt.tax > 0) {
        additionalItems.push({
          id: Date.now() + 2000,
          description: "Tax",
          amount: receipt.tax,
          category: "Sales Tax",
          envelopeId: "",
          isItem: false,
        });
      }

      setSplitAllocations([...itemAllocations, ...additionalItems]);
    } else {
      // Single item or no item details - create one split for the total
      setSplitAllocations([
        {
          id: Date.now(),
          description: receipt.orderId,
          amount: receipt.total,
          category: receipt.primaryCategory,
          envelopeId:
            findEnvelopeForCategory(receipt.primaryCategory)?.id || "",
          isItem: false,
        },
      ]);
    }

    setShowSplitModal(true);
  };

  // Add new split allocation
  const addSplitAllocation = () => {
    const remaining =
      splittingReceipt.total -
      splitAllocations.reduce((sum, split) => sum + split.amount, 0);

    setSplitAllocations((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: "",
        amount: Math.max(0, remaining),
        category: "",
        envelopeId: "",
        isItem: false,
      },
    ]);
  };

  // Update split allocation
  const updateSplitAllocation = (id, field, value) => {
    setSplitAllocations((prev) =>
      prev.map((split) => {
        if (split.id === id) {
          const updated = { ...split, [field]: value };

          // If category changes, try to find matching envelope
          if (field === "category") {
            const envelope = findEnvelopeForCategory(value);
            updated.envelopeId = envelope?.id || "";
          }

          return updated;
        }
        return split;
      }),
    );
  };

  // Remove split allocation
  const removeSplitAllocation = (id) => {
    setSplitAllocations((prev) => prev.filter((split) => split.id !== id));
  };

  // Calculate split totals
  const calculateSplitTotals = () => {
    const allocated = splitAllocations.reduce(
      (sum, split) => sum + (parseFloat(split.amount) || 0),
      0,
    );
    const remaining = splittingReceipt ? splittingReceipt.total - allocated : 0;

    return {
      allocated: allocated,
      remaining: remaining,
      isValid: Math.abs(remaining) < 0.01, // Allow for small rounding differences
    };
  };

  // Apply split transaction
  const applySplitTransaction = () => {
    const totals = calculateSplitTotals();

    if (!totals.isValid) {
      alert(
        `Split amounts must equal the total transaction amount. Remaining: ${totals.remaining.toFixed(2)}`,
      );
      return;
    }

    // Validate all splits have required fields
    const invalidSplits = splitAllocations.filter(
      (split) =>
        !split.description.trim() ||
        !split.category.trim() ||
        split.amount <= 0,
    );

    if (invalidSplits.length > 0) {
      alert(
        "Please fill in all split details (description, category, and amount)",
      );
      return;
    }

    // Create multiple transactions from splits
    const splitTransactions = splitAllocations.map((split, index) => ({
      id: `${splittingReceipt.id}_split_${index}`,
      date: splittingReceipt.date,
      description: split.description,
      amount: -split.amount, // Negative for expenses
      category: split.category,
      envelopeId: split.envelopeId,
      notes: `Split from Amazon Order #${splittingReceipt.orderId} (${index + 1}/${splitAllocations.length})`,
      source: "amazon_email_split",
      reconciled: false,
      metadata: {
        parentOrderId: splittingReceipt.orderId,
        splitIndex: index,
        totalSplits: splitAllocations.length,
        originalAmount: splittingReceipt.total,
        isItemSplit: split.isItem,
        originalItem: split.originalItem || null,
      },
    }));

    // Send split transactions to parent
    onNewTransactions?.(splitTransactions);

    // Remove the original receipt from search results and close modal
    setSearchResults((prev) =>
      prev.filter((r) => r.id !== splittingReceipt.id),
    );
    setSelectedReceipts((prev) => {
      const newSet = new Set(prev);
      newSet.delete(splittingReceipt.id);
      return newSet;
    });

    setShowSplitModal(false);
    setSplittingReceipt(null);
    setSplitAllocations([]);

    alert(
      `Successfully created ${splitTransactions.length} split transactions!`,
    );
  };

  // Auto-split by items (smart split)
  const autoSplitByItems = () => {
    if (!splittingReceipt?.items || splittingReceipt.items.length <= 1) {
      alert("This transaction cannot be auto-split by items");
      return;
    }

    const itemSplits = splittingReceipt.items.map((item, index) => ({
      id: Date.now() + index,
      description: item.name,
      amount: item.totalPrice,
      category: item.category.name,
      envelopeId: findEnvelopeForCategory(item.category.name)?.id || "",
      isItem: true,
      originalItem: item,
    }));

    // Distribute shipping and tax proportionally
    const itemTotal = itemSplits.reduce((sum, split) => sum + split.amount, 0);
    const extraCosts = splittingReceipt.shipping + splittingReceipt.tax;

    if (extraCosts > 0) {
      itemSplits.forEach((split) => {
        const proportion = split.amount / itemTotal;
        split.amount += extraCosts * proportion;
      });
    }

    setSplitAllocations(itemSplits);
  };

  const toggleReceiptSelection = (receiptId) => {
    setSelectedReceipts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(receiptId)) {
        newSet.delete(receiptId);
      } else {
        newSet.add(receiptId);
      }
      return newSet;
    });
  };

  const selectAllReceipts = () => {
    if (selectedReceipts.size === searchResults.length) {
      setSelectedReceipts(new Set());
    } else {
      setSelectedReceipts(new Set(searchResults.map((r) => r.id)));
    }
  };

  return (
    <div className={`glassmorphism rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="relative mr-3">
              <div className="absolute inset-0 bg-orange-500 rounded-xl blur-lg opacity-30"></div>
              <div className="relative bg-orange-500 p-2 rounded-xl">
                <ShoppingBag className="h-5 w-5 text-white" />
              </div>
            </div>
            Amazon Receipt Importer
          </h3>
          <p className="text-gray-600 mt-1">
            Search and import Amazon purchases from your email
          </p>
        </div>

        <div className="flex items-center gap-3">
          {lastSearchDate && (
            <div className="text-sm text-gray-600">
              Last search: {lastSearchDate.toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>

      {/* Search Filters */}
      <div className="mb-6 p-4 bg-white/60 rounded-lg border border-white/20">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Search Filters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={searchFilters.dateRange}
              onChange={(e) =>
                setSearchFilters((prev) => ({
                  ...prev,
                  dateRange: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="6months">Last 6 months</option>
              <option value="1year">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={searchFilters.minAmount}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    minAmount: parseFloat(e.target.value) || 0,
                  }))
                }
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Folders
            </label>
            <div className="relative">
              <select
                multiple
                value={searchFilters.folders}
                onChange={(e) => {
                  const selectedFolders = Array.from(
                    e.target.selectedOptions,
                    (option) => option.value,
                  );
                  setSearchFilters((prev) => ({
                    ...prev,
                    folders: selectedFolders,
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 h-20"
              >
                {emailFolders.map((folder) => (
                  <option key={folder.value} value={folder.value}>
                    {folder.icon} {folder.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple folders
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-end space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={searchFilters.includeReturns}
                onChange={(e) =>
                  setSearchFilters((prev) => ({
                    ...prev,
                    includeReturns: e.target.checked,
                  }))
                }
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Include returns
              </span>
            </label>

            <button
              onClick={() =>
                setSearchFilters((prev) => ({
                  ...prev,
                  folders: ["INBOX", "Shopping", "Receipts", "Amazon"],
                }))
              }
              className="text-xs text-orange-600 hover:text-orange-700 text-left"
            >
              Select common folders
            </button>
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="mb-6">
        <button
          onClick={searchAmazonReceipts}
          disabled={isSearching}
          className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center text-lg font-medium"
        >
          {isSearching ? (
            <>
              <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
              Searching your email...
            </>
          ) : (
            <>
              <Search className="h-5 w-5 mr-3" />
              Search Amazon Receipts
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-600 mt-2">
          Searching {searchFilters.folders.length} folder
          {searchFilters.folders.length !== 1 ? "s" : ""}:{" "}
          {searchFilters.folders.join(", ")}
        </p>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Found {searchResults.length} Amazon Receipts
            </h4>

            <div className="flex gap-2">
              <button
                onClick={selectAllReceipts}
                className="text-sm px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                {selectedReceipts.size === searchResults.length
                  ? "Deselect All"
                  : "Select All"}
              </button>

              {selectedReceipts.size > 0 && (
                <button
                  onClick={importSelectedReceipts}
                  className="text-sm px-4 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Import {selectedReceipts.size} Selected
                </button>
              )}
            </div>
          </div>

          {/* Receipt List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {searchResults.map((receipt) => {
              const isDuplicate = duplicateWarnings.has(receipt.id);
              const envelope = findEnvelopeForCategory(receipt.primaryCategory);

              return (
                <div
                  key={receipt.id}
                  className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                    isDuplicate
                      ? "border-red-400 bg-red-50"
                      : selectedReceipts.has(receipt.id)
                        ? "border-orange-400 bg-orange-50"
                        : "border-gray-200 bg-white/60 hover:border-orange-200"
                  }`}
                  onClick={() =>
                    !isDuplicate && toggleReceiptSelection(receipt.id)
                  }
                >
                  {/* Duplicate Warning */}
                  {isDuplicate && (
                    <div className="mb-3 p-2 bg-red-100 border border-red-300 rounded flex items-center">
                      <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm text-red-700 font-medium">
                        Potential duplicate transaction detected
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReceipts.has(receipt.id)}
                        onChange={() => toggleReceiptSelection(receipt.id)}
                        disabled={isDuplicate}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mr-3"
                      />

                      <div className="text-2xl mr-3">
                        {receipt.categoryIcon}
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">
                          Order #{receipt.orderId}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-600">
                            {receipt.items.length} items •{" "}
                            {receipt.primaryCategory}
                          </p>
                          {envelope && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                              → {envelope.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(receipt.date).toLocaleDateString()}
                          {receipt.deliveryDate &&
                            ` • Delivered: ${receipt.deliveryDate}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">
                          ${receipt.total.toFixed(2)}
                        </p>
                        {receipt.shipping > 0 && (
                          <p className="text-xs text-gray-500">
                            +${receipt.shipping.toFixed(2)} shipping
                          </p>
                        )}
                        {receipt.tax > 0 && (
                          <p className="text-xs text-gray-500">
                            +${receipt.tax.toFixed(2)} tax
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editReceiptCategory(receipt);
                        }}
                        className="p-2 text-gray-400 hover:text-orange-600 rounded-lg hover:bg-orange-50"
                        title="Edit category"
                      >
                        <Settings className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Details */}
                  {receipt.items.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        {receipt.items.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex justify-between">
                            <span>
                              {item.quantity}x {item.name}
                            </span>
                            <span>${item.totalPrice.toFixed(2)}</span>
                          </div>
                        ))}
                        {receipt.items.length > 3 && (
                          <p className="text-xs text-gray-500 mt-1">
                            +{receipt.items.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {searchResults.length === 0 && lastSearchDate && (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No Amazon receipts found</p>
          <p className="text-sm mt-1">
            Try adjusting your search filters or check a longer date range
          </p>
        </div>
      )}

      {/* Category Editor Modal */}
      {showCategoryEditor && editingReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Edit Category</h3>
                <button
                  onClick={() => setShowCategoryEditor(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Order #{editingReceipt.orderId} • $
                    {editingReceipt.total.toFixed(2)}
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    Current Category: {editingReceipt.primaryCategory}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Category
                  </label>
                  <select
                    defaultValue={editingReceipt.primaryCategory}
                    onChange={(e) => {
                      const selectedCategory = e.target.value;
                      const envelope =
                        findEnvelopeForCategory(selectedCategory);
                      updateReceiptCategory(
                        selectedCategory,
                        envelope?.id || "",
                      );
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    {uniqueCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Tip:</strong> If you have an envelope with a
                    matching name, the transaction will be automatically
                    assigned to that envelope.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backend Setup Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Backend Setup Required
        </h4>
        <div className="text-sm text-blue-700 space-y-2">
          <p>Add these environment variables to your backend:</p>
          <div className="bg-blue-100 p-3 rounded font-mono text-xs">
            <div>ICLOUD_EMAIL=your-email@icloud.com</div>
            <div>ICLOUD_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx</div>
            <div>IMAP_HOST=imap.mail.me.com</div>
            <div>IMAP_PORT=993</div>
          </div>
          <p>
            Create endpoint:{" "}
            <code className="bg-blue-100 px-1 rounded">
              POST /api/amazon/search-receipts
            </code>
          </p>
          <p className="text-xs">
            The backend will search multiple folders: INBOX, Shopping, Receipts,
            Amazon, etc.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AmazonReceiptParser;
