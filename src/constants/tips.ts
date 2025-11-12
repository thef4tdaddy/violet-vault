import { TipCategory, TipPriority, TipContext, type TipConfig } from "@/domain/schemas/tip";

/**
 * Central configuration for all tips in the application
 * Tips are organized by category for easy management
 */
export const TIP_CONFIGS: TipConfig[] = [
  // ONBOARDING TIPS
  {
    id: "onboarding-welcome",
    category: TipCategory.ONBOARDING,
    priority: TipPriority.HIGH,
    context: [TipContext.DASHBOARD, TipContext.ONBOARDING],
    title: "Welcome to Violet Vault!",
    content:
      "Start by setting up your first envelope to organize your money. Envelopes help you allocate funds for specific purposes like groceries, rent, or savings.",
    icon: "Sparkles",
    dismissible: false,
    showOnce: true,
    minUserMaturity: 0,
    conditions: {
      isNewUser: true,
      hasEnvelopes: false,
    },
  },
  {
    id: "onboarding-first-transaction",
    category: TipCategory.ONBOARDING,
    priority: TipPriority.HIGH,
    context: [TipContext.TRANSACTIONS],
    title: "Track Your First Transaction",
    content:
      "Record your spending to see where your money goes. This helps you stay within your budget and make informed financial decisions.",
    icon: "Receipt",
    dismissible: true,
    showOnce: true,
    minUserMaturity: 10,
    conditions: {
      hasEnvelopes: true,
      hasTransactions: false,
    },
  },
  {
    id: "onboarding-paychecks",
    category: TipCategory.ONBOARDING,
    priority: TipPriority.MEDIUM,
    context: [TipContext.DASHBOARD],
    title: "Set Up Your Paychecks",
    content:
      "Add your income sources to automatically track when money comes in. This helps you plan your budget around your pay schedule.",
    icon: "Wallet",
    dismissible: true,
    showOnce: true,
    minUserMaturity: 20,
    conditions: {
      hasEnvelopes: true,
      hasPaychecks: false,
    },
  },

  // BUDGETING TIPS
  {
    id: "budgeting-envelope-basics",
    category: TipCategory.BUDGETING,
    priority: TipPriority.MEDIUM,
    context: [TipContext.ENVELOPES],
    content:
      "Think of envelopes as digital cash envelopes. Money in each envelope is set aside for a specific purpose. When an envelope is empty, you've reached your budget limit for that category.",
    icon: "Lightbulb",
    dismissible: true,
    minUserMaturity: 0,
  },
  {
    id: "budgeting-unassigned-cash",
    category: TipCategory.BUDGETING,
    priority: TipPriority.MEDIUM,
    context: [TipContext.DASHBOARD, TipContext.ENVELOPES],
    title: "Allocate Your Unassigned Cash",
    content:
      "You have money that hasn't been assigned to an envelope yet. Allocate it to give every dollar a purpose and stay in control of your budget.",
    icon: "AlertCircle",
    dismissible: true,
    minUserMaturity: 10,
  },
  {
    id: "budgeting-quick-add",
    category: TipCategory.BUDGETING,
    priority: TipPriority.LOW,
    context: [TipContext.QUICK_ADD],
    content:
      "Use Quick Add to rapidly record transactions on the go. It's perfect for tracking purchases while you're out shopping.",
    icon: "Zap",
    dismissible: true,
    minUserMaturity: 30,
  },

  // DEBT MANAGEMENT TIPS
  {
    id: "debt-extra-payments",
    category: TipCategory.DEBT_MANAGEMENT,
    priority: TipPriority.MEDIUM,
    context: [TipContext.DEBT, TipContext.INSIGHTS],
    title: "Extra Payments Make a Big Difference",
    content:
      "Even small extra payments can significantly reduce your debt payoff time and interest costs. Consider rounding up payments or applying windfalls to accelerate your debt freedom.",
    icon: "TrendingDown",
    dismissible: true,
    minUserMaturity: 40,
    conditions: {
      hasDebts: true,
    },
  },
  {
    id: "debt-avalanche-vs-snowball",
    category: TipCategory.DEBT_MANAGEMENT,
    priority: TipPriority.LOW,
    context: [TipContext.DEBT],
    title: "Choose Your Payoff Strategy",
    content:
      "Avalanche method (highest interest first) saves the most money. Snowball method (smallest balance first) provides quick wins and motivation. Choose what works best for you!",
    icon: "Target",
    dismissible: true,
    minUserMaturity: 50,
    conditions: {
      hasDebts: true,
    },
  },

  // BILLS TIPS
  {
    id: "bills-automation",
    category: TipCategory.BILLS,
    priority: TipPriority.MEDIUM,
    context: [TipContext.BILLS],
    title: "Set Up Recurring Bills",
    content:
      "Mark bills as recurring to automatically track them each month. This helps you never miss a payment and budget accurately.",
    icon: "Calendar",
    dismissible: true,
    minUserMaturity: 30,
    conditions: {
      hasBills: true,
    },
  },

  // ADVANCED FEATURES
  {
    id: "advanced-auto-funding",
    category: TipCategory.ADVANCED_FEATURES,
    priority: TipPriority.LOW,
    context: [TipContext.ENVELOPES],
    title: "Try Auto-Funding",
    content:
      "Set up automatic funding rules to distribute your paycheck to envelopes automatically. Save time and never forget to budget!",
    icon: "Sparkles",
    dismissible: true,
    minUserMaturity: 60,
  },
  {
    id: "advanced-sync",
    category: TipCategory.SYNC,
    priority: TipPriority.LOW,
    context: [TipContext.SETTINGS],
    title: "Enable Cloud Sync",
    content:
      "Turn on cloud sync to access your budget from multiple devices and collaborate with family members. Your data is encrypted end-to-end for security.",
    icon: "Cloud",
    dismissible: true,
    minUserMaturity: 50,
  },

  // BEST PRACTICES
  {
    id: "best-practice-regular-review",
    category: TipCategory.BEST_PRACTICES,
    priority: TipPriority.LOW,
    context: [TipContext.DASHBOARD, TipContext.INSIGHTS],
    title: "Review Your Budget Weekly",
    content:
      "Spend 10 minutes each week reviewing your spending and adjusting your envelopes. Regular check-ins help you stay on track and catch issues early.",
    icon: "CheckCircle",
    dismissible: true,
    minUserMaturity: 70,
  },
  {
    id: "best-practice-emergency-fund",
    category: TipCategory.BEST_PRACTICES,
    priority: TipPriority.MEDIUM,
    context: [TipContext.ENVELOPES],
    title: "Build an Emergency Fund",
    content:
      "Create an emergency fund envelope and aim for 3-6 months of expenses. This financial cushion protects you from unexpected costs and reduces stress.",
    icon: "Shield",
    dismissible: true,
    minUserMaturity: 40,
  },

  // SECURITY TIPS
  {
    id: "security-backup",
    category: TipCategory.SECURITY,
    priority: TipPriority.HIGH,
    context: [TipContext.SETTINGS],
    title: "Back Up Your Recovery Phrase",
    content:
      "Your recovery phrase is the only way to restore your account if you lose access. Write it down and store it in a secure location - never share it with anyone.",
    icon: "Key",
    dismissible: true,
    minUserMaturity: 0,
  },
];

/**
 * Get tips by category
 */
export const getTipsByCategory = (category: TipCategory): TipConfig[] => {
  return TIP_CONFIGS.filter((tip) => tip.category === category);
};

/**
 * Get tips by context
 */
export const getTipsByContext = (context: TipContext): TipConfig[] => {
  return TIP_CONFIGS.filter((tip) => tip.context.includes(context));
};

/**
 * Get tip by ID
 */
export const getTipById = (id: string): TipConfig | undefined => {
  return TIP_CONFIGS.find((tip) => tip.id === id);
};
