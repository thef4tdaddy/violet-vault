// Debt payment strategy calculations
// Implements Avalanche, Snowball, and Custom debt payoff strategies

/**
 * Calculate optimal debt payment strategies
 */

// Strategy types
export const DEBT_STRATEGIES = {
  AVALANCHE: "avalanche", // Highest interest rate first
  SNOWBALL: "snowball", // Smallest balance first
  CUSTOM: "custom", // User-defined priority
};

/**
 * Calculate debt avalanche strategy (highest interest rate first)
 * @param {Array} debts - Array of debt objects
 * @param {number} extraPayment - Additional monthly payment amount
 * @returns {Object} Strategy analysis with payoff order and projections
 */
export const calculateDebtAvalanche = (debts, extraPayment = 0) => {
  const activeDebts = debts.filter(
    (debt) => debt.status === "active" && debt.currentBalance > 0,
  );

  // Sort by interest rate (highest first)
  const sortedDebts = [...activeDebts].sort(
    (a, b) => (b.interestRate || 0) - (a.interestRate || 0),
  );

  return calculatePayoffStrategy(sortedDebts, extraPayment, "avalanche");
};

/**
 * Calculate debt snowball strategy (smallest balance first)
 * @param {Array} debts - Array of debt objects
 * @param {number} extraPayment - Additional monthly payment amount
 * @returns {Object} Strategy analysis with payoff order and projections
 */
export const calculateDebtSnowball = (debts, extraPayment = 0) => {
  const activeDebts = debts.filter(
    (debt) => debt.status === "active" && debt.currentBalance > 0,
  );

  // Sort by balance (smallest first)
  const sortedDebts = [...activeDebts].sort(
    (a, b) => (a.currentBalance || 0) - (b.currentBalance || 0),
  );

  return calculatePayoffStrategy(sortedDebts, extraPayment, "snowball");
};

/**
 * Calculate custom debt strategy based on user-defined priorities
 * @param {Array} debts - Array of debt objects with priority field
 * @param {number} extraPayment - Additional monthly payment amount
 * @returns {Object} Strategy analysis with payoff order and projections
 */
export const calculateCustomStrategy = (debts, extraPayment = 0) => {
  const activeDebts = debts.filter(
    (debt) => debt.status === "active" && debt.currentBalance > 0,
  );

  // Sort by user-defined priority (highest priority first)
  const sortedDebts = [...activeDebts].sort(
    (a, b) => (b.priority || 1) - (a.priority || 1),
  );

  return calculatePayoffStrategy(sortedDebts, extraPayment, "custom");
};

/**
 * Core strategy calculation function
 * @param {Array} sortedDebts - Debts sorted by strategy priority
 * @param {number} extraPayment - Additional monthly payment
 * @param {string} strategyType - Type of strategy being calculated
 * @returns {Object} Complete strategy analysis
 */
const calculatePayoffStrategy = (sortedDebts, extraPayment, strategyType) => {
  if (sortedDebts.length === 0) {
    return {
      strategy: strategyType,
      totalMonths: 0,
      totalInterest: 0,
      monthlySavings: 0,
      payoffOrder: [],
      monthlyBreakdown: [],
      summary: {
        totalDebt: 0,
        totalMinimumPayment: 0,
        recommendedExtraPayment: extraPayment,
        estimatedPayoffDate: null,
      },
    };
  }

  const totalMinimumPayment = sortedDebts.reduce(
    (sum, debt) => sum + (debt.minimumPayment || 0),
    0,
  );

  const totalDebt = sortedDebts.reduce(
    (sum, debt) => sum + (debt.currentBalance || 0),
    0,
  );

  // Calculate month-by-month payoff simulation
  const simulation = simulatePayoffStrategy(sortedDebts, extraPayment);

  return {
    strategy: strategyType,
    totalMonths: simulation.totalMonths,
    totalInterest: simulation.totalInterest,
    totalSavings: simulation.interestSaved,
    payoffOrder: simulation.payoffOrder,
    monthlyBreakdown: simulation.monthlyBreakdown.slice(0, 60), // Limit to 5 years for display
    summary: {
      totalDebt,
      totalMinimumPayment,
      recommendedExtraPayment: extraPayment,
      totalPayment: totalDebt + simulation.totalInterest,
      estimatedPayoffDate: simulation.payoffDate,
      timeToPayoff: `${Math.floor(simulation.totalMonths / 12)} years ${simulation.totalMonths % 12} months`,
    },
  };
};

/**
 * Simulate month-by-month debt payoff
 * @param {Array} debts - Sorted debt array
 * @param {number} extraPayment - Extra monthly payment
 * @returns {Object} Detailed simulation results
 */
const simulatePayoffStrategy = (debts, extraPayment) => {
  // Create working copies of debts
  let workingDebts = debts.map((debt) => ({
    ...debt,
    remainingBalance: debt.currentBalance || 0,
    monthlyRate: (debt.interestRate || 0) / 100 / 12,
    isPaidOff: false,
  }));

  const payoffOrder = [];
  const monthlyBreakdown = [];
  let currentMonth = 0;
  let totalInterest = 0;
  let availableExtraPayment = extraPayment;

  while (workingDebts.some((debt) => !debt.isPaidOff) && currentMonth < 600) {
    // 50-year max
    currentMonth++;
    let monthlyInterest = 0;
    let monthlyPrincipal = 0;

    // Calculate interest and make minimum payments
    workingDebts.forEach((debt) => {
      if (debt.isPaidOff) return;

      const interestPayment = debt.remainingBalance * debt.monthlyRate;
      const minimumPayment = Math.min(
        debt.minimumPayment || 0,
        debt.remainingBalance + interestPayment,
      );
      const principalPayment = Math.max(0, minimumPayment - interestPayment);

      debt.remainingBalance = Math.max(
        0,
        debt.remainingBalance - principalPayment,
      );
      monthlyInterest += interestPayment;
      monthlyPrincipal += principalPayment;

      // Mark as paid off if balance is zero
      if (debt.remainingBalance <= 0.01) {
        debt.isPaidOff = true;
        payoffOrder.push({
          debtId: debt.id,
          debtName: debt.name,
          monthPaidOff: currentMonth,
          originalBalance: debt.currentBalance,
        });
      }
    });

    // Apply extra payment to first unpaid debt (strategy priority)
    if (availableExtraPayment > 0) {
      const targetDebt = workingDebts.find((debt) => !debt.isPaidOff);
      if (targetDebt) {
        const extraPrincipalPayment = Math.min(
          availableExtraPayment,
          targetDebt.remainingBalance,
        );
        targetDebt.remainingBalance -= extraPrincipalPayment;
        monthlyPrincipal += extraPrincipalPayment;

        // Mark as paid off if balance is zero
        if (targetDebt.remainingBalance <= 0.01) {
          targetDebt.isPaidOff = true;
          if (!payoffOrder.find((p) => p.debtId === targetDebt.id)) {
            payoffOrder.push({
              debtId: targetDebt.id,
              debtName: targetDebt.name,
              monthPaidOff: currentMonth,
              originalBalance: targetDebt.currentBalance,
            });
          }
        }
      }
    }

    totalInterest += monthlyInterest;

    monthlyBreakdown.push({
      month: currentMonth,
      totalInterest: monthlyInterest,
      totalPrincipal: monthlyPrincipal,
      remainingDebt: workingDebts.reduce(
        (sum, debt) => sum + debt.remainingBalance,
        0,
      ),
      debtsRemaining: workingDebts.filter((debt) => !debt.isPaidOff).length,
    });
  }

  // Calculate baseline (minimum payments only) for comparison
  const baselineSimulation = simulateMinimumPayments(debts);

  return {
    totalMonths: currentMonth,
    totalInterest: totalInterest,
    interestSaved: baselineSimulation.totalInterest - totalInterest,
    payoffOrder,
    monthlyBreakdown,
    payoffDate: new Date(Date.now() + currentMonth * 30 * 24 * 60 * 60 * 1000), // Approximate
  };
};

/**
 * Simulate minimum payments only (for comparison baseline)
 * @param {Array} debts - Original debt array
 * @returns {Object} Baseline simulation results
 */
const simulateMinimumPayments = (debts) => {
  // Simple baseline calculation - minimum payments only
  return debts.reduce(
    (total, debt) => {
      if (!debt.currentBalance || !debt.minimumPayment || !debt.interestRate) {
        return total;
      }

      const monthlyRate = debt.interestRate / 100 / 12;
      const balance = debt.currentBalance;
      const payment = debt.minimumPayment;

      // Calculate months to payoff with minimum payments
      let months = 0;
      if (payment > balance * monthlyRate) {
        months = Math.ceil(
          -Math.log(1 - (balance * monthlyRate) / payment) /
            Math.log(1 + monthlyRate),
        );
      } else {
        months = 600; // Never pays off (minimum < interest)
      }

      const totalInterest = payment * months - balance;

      return {
        totalMonths: Math.max(total.totalMonths, months),
        totalInterest: total.totalInterest + Math.max(0, totalInterest),
      };
    },
    { totalMonths: 0, totalInterest: 0 },
  );
};

/**
 * Compare all debt strategies
 * @param {Array} debts - Array of debt objects
 * @param {number} extraPayment - Additional monthly payment
 * @returns {Object} Comparison of all strategies
 */
export const compareDebtStrategies = (debts, extraPayment = 0) => {
  const avalanche = calculateDebtAvalanche(debts, extraPayment);
  const snowball = calculateDebtSnowball(debts, extraPayment);

  return {
    extraPayment,
    strategies: {
      avalanche,
      snowball,
    },
    recommendation: {
      bestForInterest:
        avalanche.totalInterest <= snowball.totalInterest
          ? "avalanche"
          : "snowball",
      bestForTime:
        avalanche.totalMonths <= snowball.totalMonths
          ? "avalanche"
          : "snowball",
      bestForMotivation: "snowball", // Snowball typically better for psychological wins
    },
    comparison: {
      interestDifference: Math.abs(
        avalanche.totalInterest - snowball.totalInterest,
      ),
      timeDifference: Math.abs(avalanche.totalMonths - snowball.totalMonths),
      savingsWithAvalanche: snowball.totalInterest - avalanche.totalInterest,
      timeWithSnowball: avalanche.totalMonths - snowball.totalMonths,
    },
  };
};

/**
 * Calculate the impact of different extra payment amounts
 * @param {Array} debts - Array of debt objects
 * @param {string} strategy - Strategy to use ("avalanche" or "snowball")
 * @param {Array} extraPaymentAmounts - Array of amounts to test [0, 50, 100, 200, 500]
 * @returns {Array} Impact analysis for each payment amount
 */
export const calculateExtraPaymentImpact = (
  debts,
  strategy = "avalanche",
  extraPaymentAmounts = [0, 50, 100, 200, 500],
) => {
  const calculateStrategy =
    strategy === "snowball" ? calculateDebtSnowball : calculateDebtAvalanche;

  return extraPaymentAmounts.map((amount) => {
    const result = calculateStrategy(debts, amount);
    return {
      extraPayment: amount,
      totalMonths: result.totalMonths,
      totalInterest: result.totalInterest,
      totalPayment: result.summary.totalPayment,
      timeToPayoff: result.summary.timeToPayoff,
      monthlySavings:
        amount === 0
          ? 0
          : (result.totalInterest - calculateStrategy(debts, 0).totalInterest) *
            -1,
    };
  });
};
