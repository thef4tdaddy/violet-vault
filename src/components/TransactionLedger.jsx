import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Upload,
  Download,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Edit3,
  Trash2,
  Check,
  X,
  FileText,
  Target,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";

const TransactionLedger = ({
  transactions = [],
  envelopes = [],
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onBulkImport,
  currentUser = { userName: "User", userColor: "#a855f7" },
}) => {
  const [activeTab, setActiveTab] = useState("ledger");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [envelopeFilter, setEnvelopeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());

  // Transaction form state
  const [transactionForm, setTransactionForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense", // expense, income, transfer
    envelopeId: "",
    category: "",
    notes: "",
    reconciled: false,
  });

  // Import state
  const [importData, setImportData] = useState([]);
  const [importStep, setImportStep] = useState(1); // 1: upload, 2: map, 3: review
  const [fieldMapping, setFieldMapping] = useState({});
  const [importProgress, setImportProgress] = useState(0);

  const categories = [
    "Food & Dining",
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Transportation",
    "Travel",
    "Health & Medical",
    "Education",
    "Personal Care",
    "Gifts & Donations",
    "Business",
    "Other",
  ];

  const resetTransactionForm = () => {
    setTransactionForm({
      date: new Date().toISOString().split("T")[0],
      description: "",
      amount: "",
      type: "expense",
      envelopeId: "",
      category: "",
      notes: "",
      reconciled: false,
    });
  };

  const handleAddTransaction = () => {
    if (!transactionForm.description.trim() || !transactionForm.amount) {
      alert("Please fill in description and amount");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      ...transactionForm,
      amount:
        transactionForm.type === "expense"
          ? -Math.abs(parseFloat(transactionForm.amount))
          : Math.abs(parseFloat(transactionForm.amount)),
      createdBy: currentUser.userName,
      createdAt: new Date().toISOString(),
      importSource: "manual",
    };

    if (editingTransaction) {
      onUpdateTransaction(editingTransaction.id, newTransaction);
      setEditingTransaction(null);
    } else {
      onAddTransaction(newTransaction);
    }

    setShowAddModal(false);
    resetTransactionForm();
  };

  const startEdit = (transaction) => {
    setTransactionForm({
      date: transaction.date,
      description: transaction.description,
      amount: Math.abs(transaction.amount).toString(),
      type: transaction.amount >= 0 ? "income" : "expense",
      envelopeId: transaction.envelopeId || "",
      category: transaction.category || "",
      notes: transaction.notes || "",
      reconciled: transaction.reconciled || false,
    });
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const handleDelete = (transactionId) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      onDeleteTransaction(transactionId);
    }
  };

  // File parsing functions
  const parseCSV = (csvText) => {
    const lines = csvText.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    return lines.slice(1).map((line, index) => {
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
      const row = {};
      headers.forEach((header, i) => {
        row[header] = values[i] || "";
      });
      row._index = index;
      return row;
    });
  };

  const parseOFX = (ofxText) => {
    // Basic OFX parsing - in production, use a proper OFX parser
    const transactions = [];
    const stmtTrnRegex = /<STMTTRN>(.*?)<\/STMTTRN>/gs;
    const matches = ofxText.match(stmtTrnRegex);

    if (matches) {
      matches.forEach((match, index) => {
        const transaction = { _index: index };

        // Extract common OFX fields
        const fields = {
          TRNTYPE: "type",
          DTPOSTED: "date",
          TRNAMT: "amount",
          FITID: "id",
          NAME: "description",
          MEMO: "notes",
        };

        Object.entries(fields).forEach(([ofxField, ourField]) => {
          const regex = new RegExp(`<${ofxField}>(.*?)<\/${ofxField}>`, "i");
          const fieldMatch = match.match(regex);
          if (fieldMatch) {
            transaction[ourField] = fieldMatch[1].trim();
          }
        });

        // Format date if found
        if (transaction.date && transaction.date.length >= 8) {
          const dateStr = transaction.date;
          transaction.date = `${dateStr.slice(0, 4)}-${dateStr.slice(
            4,
            6
          )}-${dateStr.slice(6, 8)}`;
        }

        transactions.push(transaction);
      });
    }

    return transactions;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      let parsedData = [];

      try {
        if (file.name.toLowerCase().endsWith(".csv")) {
          parsedData = parseCSV(content);
        } else if (file.name.toLowerCase().endsWith(".ofx")) {
          parsedData = parseOFX(content);
        } else {
          alert("Unsupported file type. Please use CSV or OFX files.");
          return;
        }

        setImportData(parsedData);
        setImportStep(2);

        // Auto-detect common field mappings
        const headers = Object.keys(parsedData[0] || {});
        const mapping = {};

        headers.forEach((header) => {
          const lower = header.toLowerCase();
          if (lower.includes("date")) mapping.date = header;
          if (
            lower.includes("description") ||
            lower.includes("name") ||
            lower.includes("memo")
          )
            mapping.description = header;
          if (
            lower.includes("amount") ||
            lower.includes("debit") ||
            lower.includes("credit")
          )
            mapping.amount = header;
          if (lower.includes("category")) mapping.category = header;
        });

        setFieldMapping(mapping);
      } catch (error) {
        alert("Error parsing file: " + error.message);
      }
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const handleImport = async () => {
    if (
      !fieldMapping.date ||
      !fieldMapping.description ||
      !fieldMapping.amount
    ) {
      alert("Please map at least Date, Description, and Amount fields");
      return;
    }

    setImportStep(3);
    const processedTransactions = [];

    for (let i = 0; i < importData.length; i++) {
      const row = importData[i];
      setImportProgress((i / importData.length) * 100);

      try {
        const transaction = {
          id: Date.now() + i,
          date:
            row[fieldMapping.date] || new Date().toISOString().split("T")[0],
          description: row[fieldMapping.description] || "Imported Transaction",
          amount: parseFloat(
            row[fieldMapping.amount]?.replace(/[$,]/g, "") || "0"
          ),
          category: row[fieldMapping.category] || "Other",
          notes: row[fieldMapping.notes] || "",
          envelopeId: "", // Will be assigned manually or via smart matching
          reconciled: false,
          createdBy: currentUser.userName,
          createdAt: new Date().toISOString(),
          importSource: "file",
        };

        processedTransactions.push(transaction);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
      }

      // Small delay to show progress
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    onBulkImport(processedTransactions);
    setShowImportModal(false);
    setImportStep(1);
    setImportData([]);
    setImportProgress(0);
    alert(
      `Successfully imported ${processedTransactions.length} transactions!`
    );
  };

  // Smart envelope matching
  const suggestEnvelope = (description) => {
    const desc = description.toLowerCase();

    // Find envelope by exact name match first
    let match = envelopes.find((env) => desc.includes(env.name.toLowerCase()));

    if (match) return match;

    // Common merchant/category mappings
    const mappings = {
      grocery: ["food", "kroger", "walmart", "safeway", "whole foods"],
      gas: ["shell", "exxon", "chevron", "bp", "gas station"],
      restaurant: ["restaurant", "cafe", "pizza", "mcdonalds", "starbucks"],
      utilities: ["electric", "water", "gas bill", "internet", "phone"],
      entertainment: ["netflix", "spotify", "movie", "theater", "game"],
    };

    for (const [category, keywords] of Object.entries(mappings)) {
      if (keywords.some((keyword) => desc.includes(keyword))) {
        match = envelopes.find(
          (env) =>
            env.category?.toLowerCase().includes(category) ||
            env.name.toLowerCase().includes(category)
        );
        if (match) return match;
      }
    }

    return null;
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((transaction) => {
      if (
        searchTerm &&
        !transaction.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "all") {
        if (typeFilter === "income" && transaction.amount <= 0) return false;
        if (typeFilter === "expense" && transaction.amount >= 0) return false;
      }

      if (
        envelopeFilter !== "all" &&
        transaction.envelopeId !== envelopeFilter
      ) {
        return false;
      }

      if (dateFilter !== "all") {
        const transactionDate = new Date(transaction.date);
        const now = new Date();

        switch (dateFilter) {
          case "today":
            return transactionDate.toDateString() === now.toDateString();
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return transactionDate >= weekAgo;
          case "month":
            return (
              transactionDate.getMonth() === now.getMonth() &&
              transactionDate.getFullYear() === now.getFullYear()
            );
        }
      }

      return true;
    })
    .sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case "date":
          aVal = new Date(a.date);
          bVal = new Date(b.date);
          break;
        case "amount":
          aVal = Math.abs(a.amount);
          bVal = Math.abs(b.amount);
          break;
        case "description":
          aVal = a.description.toLowerCase();
          bVal = b.description.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

  // Calculate summary stats
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const netCashFlow = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center text-gray-900">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-emerald-500 p-3 rounded-2xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
            </div>
            Transaction Ledger
          </h2>
          <p className="text-gray-600 mt-1">
            {transactions.length} transactions • Net: ${netCashFlow.toFixed(2)}
          </p>
        </div>

        <div className="flex flex-row gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import File
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-emerald-500 p-3 rounded-2xl">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Total Income
              </p>
              <p className="text-2xl font-bold text-emerald-600">
                ${totalIncome.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div className="absolute inset-0 bg-red-500 rounded-2xl blur-lg opacity-30"></div>
              <div className="relative bg-red-500 p-3 rounded-2xl">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Total Expenses
              </p>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="glassmorphism rounded-xl p-6">
          <div className="flex items-center">
            <div className="relative mr-4">
              <div
                className={`absolute inset-0 ${
                  netCashFlow >= 0 ? "bg-cyan-500" : "bg-amber-500"
                } rounded-2xl blur-lg opacity-30`}
              ></div>
              <div
                className={`relative ${
                  netCashFlow >= 0 ? "bg-cyan-500" : "bg-amber-500"
                } p-3 rounded-2xl`}
              >
                <DollarSign className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Net Cash Flow
              </p>
              <p
                className={`text-2xl font-bold ${
                  netCashFlow >= 0 ? "text-cyan-600" : "text-amber-600"
                }`}
              >
                {netCashFlow >= 0 ? "+" : ""}${netCashFlow.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glassmorphism rounded-xl p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="glassmorphism w-full pl-10 pr-3 py-2 border border-white/20 rounded-lg"
                placeholder="Search transactions..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filter
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Envelope
            </label>
            <select
              value={envelopeFilter}
              onChange={(e) => setEnvelopeFilter(e.target.value)}
              className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
            >
              <option value="all">All Envelopes</option>
              <option value="">Unassigned</option>
              {envelopes.map((envelope) => (
                <option key={envelope.id} value={envelope.id}>
                  {envelope.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="glassmorphism flex-1 px-3 py-2 border border-white/20 rounded-lg"
              >
                <option value="date">Date</option>
                <option value="amount">Amount</option>
                <option value="description">Description</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="glassmorphism px-3 py-2 border border-white/20 rounded-lg hover:shadow-lg"
              >
                {sortOrder === "asc" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glassmorphism rounded-xl overflow-hidden border border-white/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Envelope
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => {
                  const envelope = envelopes.find(
                    (e) => e.id === transaction.envelopeId
                  );
                  return (
                    <tr key={transaction.id} className="hover:bg-white/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">
                          {transaction.description}
                        </div>
                        {transaction.notes && (
                          <div className="text-xs text-gray-500">
                            {transaction.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.category || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {envelope ? (
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: envelope.color }}
                            />
                            {envelope.name}
                          </div>
                        ) : (
                          <span className="text-gray-400">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <span
                          className={
                            transaction.amount >= 0
                              ? "text-emerald-600"
                              : "text-red-600"
                          }
                        >
                          {transaction.amount >= 0 ? "+" : ""}$
                          {Math.abs(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => startEdit(transaction)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingTransaction
                  ? "Edit Transaction"
                  : "Add New Transaction"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  resetTransactionForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        date: e.target.value,
                      })
                    }
                    className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTransactionForm({
                          ...transactionForm,
                          type: "expense",
                        })
                      }
                      className={`p-2 rounded-lg border-2 transition-all ${
                        transactionForm.type === "expense"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 hover:border-red-300"
                      }`}
                    >
                      <TrendingDown className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-sm">Expense</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTransactionForm({
                          ...transactionForm,
                          type: "income",
                        })
                      }
                      className={`p-2 rounded-lg border-2 transition-all ${
                        transactionForm.type === "income"
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-emerald-300"
                      }`}
                    >
                      <TrendingUp className="h-4 w-4 mx-auto mb-1" />
                      <span className="text-sm">Income</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <input
                  type="text"
                  value={transactionForm.description}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      description: e.target.value,
                    })
                  }
                  className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g., Grocery shopping at Walmart"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        amount: e.target.value,
                      })
                    }
                    className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) =>
                      setTransactionForm({
                        ...transactionForm,
                        category: e.target.value,
                      })
                    }
                    className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Envelope
                </label>
                <select
                  value={transactionForm.envelopeId}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      envelopeId: e.target.value,
                    })
                  }
                  className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Leave unassigned</option>
                  {envelopes.map((envelope) => (
                    <option key={envelope.id} value={envelope.id}>
                      {envelope.name}
                    </option>
                  ))}
                </select>
                {transactionForm.description && (
                  <div className="mt-2">
                    {(() => {
                      const suggested = suggestEnvelope(
                        transactionForm.description
                      );
                      return suggested ? (
                        <button
                          type="button"
                          onClick={() =>
                            setTransactionForm({
                              ...transactionForm,
                              envelopeId: suggested.id,
                            })
                          }
                          className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Suggested: {suggested.name}
                        </button>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={transactionForm.notes}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      notes: e.target.value,
                    })
                  }
                  rows={3}
                  className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Additional notes about this transaction..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="reconciled"
                  checked={transactionForm.reconciled}
                  onChange={(e) =>
                    setTransactionForm({
                      ...transactionForm,
                      reconciled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="reconciled"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Mark as reconciled
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTransaction(null);
                  resetTransactionForm();
                }}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTransaction}
                className="flex-1 btn btn-primary"
              >
                {editingTransaction ? "Update Transaction" : "Add Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glassmorphism rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-white/30 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Import Transactions</h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportStep(1);
                  setImportData([]);
                  setImportProgress(0);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Step 1: File Upload */}
            {importStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-4 text-lg font-medium text-gray-900">
                    Upload Transaction File
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Support for CSV and OFX files from your bank
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    accept=".csv,.ofx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block text-center"
                  >
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Click to upload or drag and drop
                    </span>
                    <span className="block text-sm text-gray-600">
                      CSV or OFX files only
                    </span>
                  </label>
                </div>

                <div className="glassmorphism rounded-lg p-4 border border-white/20">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <h5 className="text-sm font-medium text-blue-800">
                        Supported File Formats
                      </h5>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>
                            <strong>CSV:</strong> Exported from banks like
                            Chase, Wells Fargo, etc.
                          </li>
                          <li>
                            <strong>OFX:</strong> Open Financial Exchange format
                          </li>
                          <li>
                            Files should include Date, Description, and Amount
                            columns
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Field Mapping */}
            {importStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Map Your File Fields
                  </h4>
                  <p className="text-sm text-gray-600">
                    Match your file columns to transaction fields. Preview shows
                    data from your file.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">
                      Field Mapping
                    </h5>
                    <div className="space-y-4">
                      {[
                        "date",
                        "description",
                        "amount",
                        "category",
                        "notes",
                      ].map((field) => (
                        <div key={field}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.charAt(0).toUpperCase() + field.slice(1)}
                            {["date", "description", "amount"].includes(
                              field
                            ) && " *"}
                          </label>
                          <select
                            value={fieldMapping[field] || ""}
                            onChange={(e) =>
                              setFieldMapping({
                                ...fieldMapping,
                                [field]: e.target.value,
                              })
                            }
                            className="glassmorphism w-full px-3 py-2 border border-white/20 rounded-lg"
                          >
                            <option value="">Skip this field</option>
                            {Object.keys(importData[0] || {}).map((header) => (
                              <option key={header} value={header}>
                                {header}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-gray-900 mb-3">
                      Preview ({importData.length} rows)
                    </h5>
                    <div className="glassmorphism border rounded-lg overflow-hidden border-white/20">
                      <div className="max-h-64 overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-white/50">
                            <tr>
                              {Object.keys(importData[0] || {})
                                .slice(0, 4)
                                .map((header) => (
                                  <th
                                    key={header}
                                    className="px-3 py-2 text-left font-medium text-gray-900"
                                  >
                                    {header}
                                  </th>
                                ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {importData.slice(0, 5).map((row, index) => (
                              <tr key={index}>
                                {Object.values(row)
                                  .slice(0, 4)
                                  .map((value, i) => (
                                    <td
                                      key={i}
                                      className="px-3 py-2 text-gray-900"
                                    >
                                      {String(value).substring(0, 20)}
                                      {String(value).length > 20 && "..."}
                                    </td>
                                  ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setImportStep(1)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={
                      !fieldMapping.date ||
                      !fieldMapping.description ||
                      !fieldMapping.amount
                    }
                    className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Import Transactions
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Import Progress */}
            {importStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <RefreshCw className="mx-auto h-12 w-12 text-emerald-600 animate-spin" />
                  <h4 className="mt-4 text-lg font-medium text-gray-900">
                    Importing Transactions
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    Processing {importData.length} transactions...
                  </p>
                </div>

                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${importProgress}%` }}
                  />
                </div>

                <p className="text-center text-sm text-gray-600">
                  {Math.round(importProgress)}% complete
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionLedger;
