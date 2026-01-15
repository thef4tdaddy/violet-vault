/**
 * Payday Prediction Utility
 * Analyzes paycheck history to predict future payday dates
 */

export interface PaycheckEntry {
  date?: Date | string;
  [key: string]: unknown;
}

export interface PaydayPrediction {
  nextPayday: Date | null;
  confidence: number;
  pattern: string | null;
  intervalDays?: number;
  message: string;
}

/**
 * Calculate the most common interval between paychecks
 * @param {Array} paycheckHistory - Array of paycheck objects with date field
 * @returns {Object} Prediction data including next payday and confidence
 */
// eslint-disable-next-line max-statements -- Complex prediction logic requires multiple steps
export const predictNextPayday = (paycheckHistory: PaycheckEntry[]): PaydayPrediction => {
  if (!paycheckHistory || paycheckHistory.length < 2) {
    return {
      nextPayday: null,
      confidence: 0,
      pattern: null,
      message: "Need at least 2 paychecks to predict payday",
    };
  }

  // Helper to get date from either processedAt or date field
  const getPaycheckDate = (paycheck: PaycheckEntry): Date => {
    return new Date(paycheck.date || 0);
  };

  // Sort paychecks by date (most recent first)
  const sortedPaychecks = paycheckHistory
    .slice()
    .sort((a, b) => getPaycheckDate(b).getTime() - getPaycheckDate(a).getTime());

  // Calculate intervals between consecutive paychecks
  const intervals: number[] = [];
  for (let i = 0; i < sortedPaychecks.length - 1; i++) {
    const current = getPaycheckDate(sortedPaychecks[i]);
    const previous = getPaycheckDate(sortedPaychecks[i + 1]);
    const diffInDays = Math.round((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(diffInDays);
  }

  // Find the most common interval
  const intervalCounts: Record<number, number> = {};
  intervals.forEach((interval) => {
    // Group similar intervals (±1 day tolerance)
    const key = Math.round(interval / 7) * 7; // Round to nearest week
    intervalCounts[key] = (intervalCounts[key] || 0) + 1;
  });

  // Get the most frequent interval
  const mostCommonInterval = Object.keys(intervalCounts).reduce((a, b) =>
    intervalCounts[Number(a)] > intervalCounts[Number(b)] ? a : b
  );

  const intervalFrequency = intervalCounts[Number(mostCommonInterval)];
  const confidence = Math.min((intervalFrequency / intervals.length) * 100, 95);

  // Predict next payday
  const lastPaycheck = getPaycheckDate(sortedPaychecks[0]);
  if (isNaN(lastPaycheck.getTime())) {
    return {
      nextPayday: null,
      confidence: 0,
      pattern: null,
      intervalDays: parseInt(mostCommonInterval),
      message: "Invalid paycheck date encountered",
    };
  }

  const nextPayday = new Date(lastPaycheck);
  nextPayday.setDate(lastPaycheck.getDate() + parseInt(mostCommonInterval, 10));

  // Determine pattern type
  let pattern: string;
  const commonInterval = parseInt(mostCommonInterval);
  if (commonInterval >= 13 && commonInterval <= 15) {
    pattern = "biweekly";
  } else if (commonInterval >= 6 && commonInterval <= 8) {
    pattern = "weekly";
  } else if (commonInterval >= 27 && commonInterval <= 33) {
    pattern = "monthly";
  } else {
    pattern = `${commonInterval}-day cycle`;
  }

  return {
    nextPayday,
    confidence: Math.round(confidence),
    pattern,
    intervalDays: commonInterval,
    message:
      confidence > 70
        ? `High confidence ${pattern} pattern detected`
        : confidence > 50
          ? `Moderate confidence ${pattern} pattern detected`
          : "Low confidence prediction - irregular paycheck schedule",
  };
};

/**
 * Check if today matches a predicted payday
 * @param {Object} prediction - Prediction object from predictNextPayday
 * @param {Date} today - Today's date (optional, defaults to new Date())
 * @returns {boolean} True if today is a predicted payday
 */
export const isPaydayToday = (prediction: PaydayPrediction, today: Date = new Date()): boolean => {
  if (!prediction.nextPayday) return false;

  const todayStr = today.toDateString();
  const paydayStr = prediction.nextPayday.toDateString();

  return todayStr === paydayStr;
};

/**
 * Check if a payday occurred recently (within the last 1-2 days)
 * @param {Object} prediction - Prediction object from predictNextPayday
 * @param {Date} today - Today's date (optional, defaults to new Date())
 * @returns {Object} Information about recent payday
 */
export const checkRecentPayday = (
  prediction: PaydayPrediction,
  today: Date = new Date()
): { occurred: boolean; daysAgo: number; wasToday?: boolean; wasYesterday?: boolean } => {
  if (!prediction.nextPayday) {
    return { occurred: false, daysAgo: 0 };
  }

  const diffTime = today.getTime() - prediction.nextPayday.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Check if payday was in the last 2 days (including today)
  const occurred = diffDays >= 0 && diffDays <= 2;

  return {
    occurred,
    daysAgo: diffDays,
    wasToday: diffDays === 0,
    wasYesterday: diffDays === 1,
  };
};

/**
 * Get days until next payday
 * @param {Object} prediction - Prediction object from predictNextPayday
 * @param {Date} today - Today's date (optional, defaults to new Date())
 * @returns {number} Days until next payday (negative if past due)
 */
export const getDaysUntilPayday = (
  prediction: PaydayPrediction,
  today: Date = new Date()
): number | null => {
  if (!prediction.nextPayday) return null;

  const diffTime = prediction.nextPayday.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Get proactive funding recommendations based on payday timing
 * @param {Object} prediction - Prediction object from predictNextPayday
 * @param {Date} today - Today's date (optional, defaults to new Date())
 * @returns {Object} Funding recommendations
 */
export const getPaydayRecommendations = (
  prediction: PaydayPrediction,
  today: Date = new Date()
): {
  showRecommendations: boolean;
  actions: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    actionText: string;
    color: string;
  }>;
  daysUntil?: number | null;
  confidence?: number;
} => {
  const daysUntil = getDaysUntilPayday(prediction, today);

  if (!prediction.nextPayday || daysUntil === null || daysUntil < 0 || daysUntil > 7) {
    return {
      showRecommendations: false,
      actions: [],
    };
  }

  const actions: Array<{
    type: string;
    priority: string;
    title: string;
    description: string;
    actionText: string;
    color: string;
  }> = [];

  if (daysUntil === 0) {
    actions.push({
      type: "process_paycheck",
      priority: "high",
      title: "Process Today's Paycheck",
      description: "Add your paycheck and distribute to envelopes",
      actionText: "Process Now",
      color: "purple",
    });
  } else if (daysUntil === 1) {
    actions.push({
      type: "prepare_tomorrow",
      priority: "medium",
      title: "Payday Tomorrow!",
      description: "Review your envelope allocation plan",
      actionText: "Review Plan",
      color: "emerald",
    });
  } else if (daysUntil >= 2 && daysUntil <= 3) {
    actions.push({
      type: "plan_ahead",
      priority: "low",
      title: `Payday in ${daysUntil} days`,
      description: "Plan your envelope funding strategy",
      actionText: "Plan Ahead",
      color: "amber",
    });
  } else if (daysUntil >= 4 && daysUntil <= 7) {
    actions.push({
      type: "early_planning",
      priority: "low",
      title: `Payday in ${daysUntil} days`,
      description: "Consider reviewing your budget allocation",
      actionText: "Review Budget",
      color: "blue",
    });
  }

  return {
    showRecommendations: actions.length > 0,
    actions,
    daysUntil,
    confidence: prediction.confidence,
  };
};

/**
 * Format payday prediction for display
 * @param {Object} prediction - Prediction object from predictNextPayday
 * @returns {Object} Formatted display information
 */
export const formatPaydayPrediction = (
  prediction: PaydayPrediction
): {
  displayText: string;
  shortText: string;
  confidence: number;
  pattern?: string | null;
  date: string;
} => {
  if (!prediction.nextPayday) {
    return {
      displayText: "Unable to predict next payday",
      shortText: "Unknown",
      confidence: prediction.confidence || 0,
      date: "Unknown",
      pattern: prediction.pattern,
    };
  }

  const daysUntil = getDaysUntilPayday(prediction);
  const date = prediction.nextPayday.toLocaleDateString();

  let displayText: string;
  let shortText: string;

  if (daysUntil === 0) {
    displayText = `Payday predicted for today (${date})`;
    shortText = "Today";
  } else if (daysUntil === 1) {
    displayText = `Payday predicted for tomorrow (${date})`;
    shortText = "Tomorrow";
  } else if (daysUntil !== null && daysUntil > 0 && daysUntil <= 7) {
    displayText = `Payday predicted in ${daysUntil} days (${date})`;
    shortText = `${daysUntil} days`;
  } else if (daysUntil !== null && daysUntil > 0) {
    displayText = `Next payday predicted for ${date}`;
    shortText = date;
  } else if (daysUntil !== null) {
    displayText = `Predicted payday was ${Math.abs(daysUntil)} days ago (${date})`;
    shortText = `${Math.abs(daysUntil)} days ago`;
  } else {
    displayText = `Next payday predicted for ${date}`;
    shortText = date;
  }

  return {
    displayText,
    shortText,
    confidence: prediction.confidence ?? 0,
    pattern: prediction.pattern,
    date,
  };
};
