/**
 * Route Configuration for MainLayout
 * Defines all application routes and their corresponding views
 * Eliminates repetitive route definitions in MainContent component
 */

export const routeConfig = [
  {
    path: "/",
    activeView: "dashboard",
  },
  {
    path: "/envelopes",
    activeView: "envelopes",
  },
  {
    path: "/savings",
    activeView: "savings",
  },
  {
    path: "/supplemental",
    activeView: "supplemental",
  },
  {
    path: "/paycheck",
    activeView: "paycheck",
  },
  {
    path: "/bills",
    activeView: "bills",
  },
  {
    path: "/transactions",
    activeView: "transactions",
  },
  {
    path: "/debts",
    activeView: "debts",
  },
  {
    path: "/analytics",
    activeView: "analytics",
  },
  {
    path: "/automation",
    activeView: "automation",
  },
  {
    path: "/activity",
    activeView: "activity",
  },
];

export const pathToViewMap = {
  "/": "dashboard",
  "/envelopes": "envelopes",
  "/savings": "savings",
  "/supplemental": "supplemental",
  "/paycheck": "paycheck",
  "/bills": "bills",
  "/transactions": "transactions",
  "/debts": "debts",
  "/analytics": "analytics",
  "/automation": "automation",
  "/activity": "activity",
};

export const viewToPathMap = {
  dashboard: "/",
  envelopes: "/envelopes",
  savings: "/savings",
  supplemental: "/supplemental",
  paycheck: "/paycheck",
  bills: "/bills",
  transactions: "/transactions",
  debts: "/debts",
  analytics: "/analytics",
  automation: "/automation",
  activity: "/activity",
};
