/**
 * Merchant Alias Mapping for Receipt-to-Transaction Matching
 *
 * This module contains common merchant name aliases and abbreviations
 * used to normalize merchant names for fuzzy matching.
 */

/**
 * Common merchant name aliases/abbreviations
 * Maps shortened or variant names to their canonical form
 */
export const MERCHANT_ALIASES: Record<string, string> = {
  // Amazon variations
  AMZN: "Amazon",
  "AMZN MKTP": "Amazon",
  "AMZN MKTPLACE": "Amazon",
  "AMAZON.COM": "Amazon",
  "AMAZON PRIME": "Amazon",
  AMZNPRIME: "Amazon",

  // Square/POS systems
  "SQ *": "Square",
  "SQUARE *": "Square",
  "TST*": "Toast",
  "TOAST*": "Toast",

  // Grocery stores
  WHOLEFDS: "Whole Foods",
  "WF MKT": "Whole Foods",
  WHOLEFOODS: "Whole Foods",
  WMT: "Walmart",
  "WAL-MART": "Walmart",
  WALMART: "Walmart",
  "TRADER JOE": "Trader Joe's",
  TJ: "Trader Joe's",
  COSTCO: "Costco",
  "COSTCO WHSE": "Costco",
  TARGET: "Target",
  TGTSTORE: "Target",
  KROGER: "Kroger",
  PUBLIX: "Publix",
  SAFEWAY: "Safeway",
  ALBERTSONS: "Albertsons",
  ALDI: "Aldi",

  // Gas stations
  SHELL: "Shell",
  EXXON: "Exxon",
  CHEVRON: "Chevron",
  BP: "BP",
  MARATHON: "Marathon",
  SPEEDWAY: "Speedway",
  "CIRCLE K": "Circle K",
  "7-ELEVEN": "7-Eleven",
  "711": "7-Eleven",
  WAWA: "Wawa",
  SHEETZ: "Sheetz",
  QT: "QuikTrip",
  QUIKTRIP: "QuikTrip",

  // Fast food & restaurants
  MCDONALD: "McDonald's",
  MCDONALDS: "McDonald's",
  "MCD'S": "McDonald's",
  STARBUCKS: "Starbucks",
  SBUX: "Starbucks",
  CHICK: "Chick-fil-A",
  "CHICK-FIL-A": "Chick-fil-A",
  CHIPOTLE: "Chipotle",
  WENDYS: "Wendy's",
  "WENDY'S": "Wendy's",
  SUBWAY: "Subway",
  "BURGER KING": "Burger King",
  BK: "Burger King",
  DOMINOS: "Domino's",
  "PIZZA HUT": "Pizza Hut",
  PANERA: "Panera Bread",
  DUNKIN: "Dunkin'",
  "DUNKIN DONUTS": "Dunkin'",
  "TACO BELL": "Taco Bell",

  // Pharmacies & health
  CVS: "CVS Pharmacy",
  WALGREENS: "Walgreens",
  WAG: "Walgreens",
  RITEAID: "Rite Aid",
  "RITE AID": "Rite Aid",

  // Electronics & retail
  "BEST BUY": "Best Buy",
  BESTBUY: "Best Buy",
  BBY: "Best Buy",
  "HOME DEPOT": "Home Depot",
  HOMEDEPOT: "Home Depot",
  LOWES: "Lowe's",
  "LOWE'S": "Lowe's",
  IKEA: "IKEA",
  STAPLES: "Staples",
  "OFFICE DEPOT": "Office Depot",

  // Online services
  NETFLIX: "Netflix",
  NFLX: "Netflix",
  SPOTIFY: "Spotify",
  HULU: "Hulu",
  "DISNEY+": "Disney+",
  DISNEYPLUS: "Disney+",
  APPLE: "Apple",
  "APPLE.COM": "Apple",
  GOOGLE: "Google",
  "GOOGLE*": "Google",

  // Payment processors (strip these)
  "PAYPAL *": "",
  "VENMO *": "",
  "ZELLE *": "",
  "CASH APP*": "",
};

export default MERCHANT_ALIASES;
