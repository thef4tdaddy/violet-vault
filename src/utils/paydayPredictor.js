/**
 * Payday Prediction Utility
 * Analyzes paycheck history to predict future payday dates
 */

/**
 * Calculate the most common interval between paychecks
 * @param {Array} paycheckHistory - Array of paycheck objects with date field
 * @returns {Object} Prediction data including next payday and confidence
 */
export const predictNextPayday = (paycheckHistory) => {
  if (!paycheckHistory || paycheckHistory.length < 2) {
    return {
      nextPayday: null,
      confidence: 0,
      pattern: null,
      message: "Need at least 2 paychecks to predict payday",
    };
  }

  // Sort paychecks by date (most recent first)
  const sortedPaychecks = paycheckHistory
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate intervals between consecutive paychecks
  const intervals = [];
  for (let i = 0; i < sortedPaychecks.length - 1; i++) {
    const current = new Date(sortedPaychecks[i].date);
    const previous = new Date(sortedPaychecks[i + 1].date);
    const diffInDays = Math.round((current - previous) / (1000 * 60 * 60 * 24));
    intervals.push(diffInDays);
  }

  // Find the most common interval
  const intervalCounts = {};
  intervals.forEach((interval) => {
    // Group similar intervals (±1 day tolerance)
    const key = Math.round(interval / 7) * 7; // Round to nearest week
    intervalCounts[key] = (intervalCounts[key] || 0) + 1;
  });

  // Get the most frequent interval
  const mostCommonInterval = Object.keys(intervalCounts).reduce((a, b) =>
    intervalCounts[a] > intervalCounts[b] ? a : b
  );

  const intervalFrequency = intervalCounts[mostCommonInterval];
  const confidence = Math.min((intervalFrequency / intervals.length) * 100, 95);

  // Predict next payday
  const lastPaycheck = new Date(sortedPaychecks[0].date);
  const nextPayday = new Date(lastPaycheck);
  nextPayday.setDate(lastPaycheck.getDate() + parseInt(mostCommonInterval));

  // Determine pattern type
  let pattern;
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
export const isPaydayToday = (prediction, today = new Date()) => {
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
export const checkRecentPayday = (prediction, today = new Date()) => {
  if (!prediction.nextPayday) {
    return { occurred: false, daysAgo: 0 };
  }

  const diffTime = today - prediction.nextPayday;
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
export const getDaysUntilPayday = (prediction, today = new Date()) => {
  if (!prediction.nextPayday) return null;

  const diffTime = prediction.nextPayday - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format payday prediction for display
 * @param {Object} prediction - Prediction object from predictNextPayday
 * @returns {Object} Formatted display information
 */
export const formatPaydayPrediction = (prediction) => {
  if (!prediction.nextPayday) {
    return {
      displayText: "Unable to predict next payday",
      shortText: "Unknown",
      confidence: prediction.confidence || 0,
    };
  }

  const daysUntil = getDaysUntilPayday(prediction);
  const date = prediction.nextPayday.toLocaleDateString();

  let displayText;
  let shortText;

  if (daysUntil === 0) {
    displayText = `Payday predicted for today (${date})`;
    shortText = "Today";
  } else if (daysUntil === 1) {
    displayText = `Payday predicted for tomorrow (${date})`;
    shortText = "Tomorrow";
  } else if (daysUntil > 0 && daysUntil <= 7) {
    displayText = `Payday predicted in ${daysUntil} days (${date})`;
    shortText = `${daysUntil} days`;
  } else if (daysUntil > 0) {
    displayText = `Next payday predicted for ${date}`;
    shortText = date;
  } else {
    displayText = `Predicted payday was ${Math.abs(daysUntil)} days ago (${date})`;
    shortText = `${Math.abs(daysUntil)} days ago`;
  }

  return {
    displayText,
    shortText,
    confidence: prediction.confidence,
    pattern: prediction.pattern,
  };
};
