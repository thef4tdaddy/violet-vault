export const predictNextPayday = (history) => {
  if (!Array.isArray(history) || history.length < 2) return null;
  const dates = history
    .map((p) => new Date(p.date))
    .filter((d) => !isNaN(d));
  if (dates.length < 2) return null;
  dates.sort((a, b) => a - b);
  const intervals = [];
  for (let i = 1; i < dates.length; i++) {
    intervals.push(dates[i] - dates[i - 1]);
  }
  if (intervals.length === 0) return null;
  const avgInterval =
    intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const nextDate = new Date(dates[dates.length - 1].getTime() + avgInterval);
  return nextDate;
};

export const isTodayPredictedPayday = (history) => {
  const next = predictNextPayday(history);
  if (!next) return false;
  const today = new Date();
  return next.toDateString() === today.toDateString();
};
