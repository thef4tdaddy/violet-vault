/**
 * Route Configuration for MainLayout
 * Defines all application routes and their corresponding views
 * Eliminates repetitive route definitions in MainContent component
 */

export const routeConfig = [
  {
    path: "/app",
    activeView: "dashboard",
  },
  {
    path: "/app/dashboard",
    activeView: "dashboard",
  },
  {
    path: "/app/envelopes",
    activeView: "envelopes",
  },
  {
    path: "/app/savings",
    activeView: "savings",
  },
  {
    path: "/app/supplemental",
    activeView: "supplemental",
  },
  {
    path: "/app/paycheck",
    activeView: "paycheck",
  },
  {
    path: "/app/bills",
    activeView: "bills",
  },
  {
    path: "/app/transactions",
    activeView: "transactions",
  },
  {
    path: "/app/debts",
    activeView: "debts",
  },
  {
    path: "/app/analytics",
    activeView: "analytics",
  },
  {
    path: "/app/automation",
    activeView: "automation",
  },
  {
    path: "/app/activity",
    activeView: "activity",
  },
];

export const pathToViewMap = {
  "/app": "dashboard",
  "/app/dashboard": "dashboard",
  "/app/envelopes": "envelopes",
  "/app/savings": "savings",
  "/app/supplemental": "supplemental",
  "/app/paycheck": "paycheck",
  "/app/bills": "bills",
  "/app/transactions": "transactions",
  "/app/debts": "debts",
  "/app/analytics": "analytics",
  "/app/automation": "automation",
  "/app/activity": "activity",
};

export const viewToPathMap = {
  dashboard: "/app/dashboard",
  envelopes: "/app/envelopes",
  savings: "/app/savings",
  supplemental: "/app/supplemental",
  paycheck: "/app/paycheck",
  bills: "/app/bills",
  transactions: "/app/transactions",
  debts: "/app/debts",
  analytics: "/app/analytics",
  automation: "/app/automation",
  activity: "/app/activity",
};
