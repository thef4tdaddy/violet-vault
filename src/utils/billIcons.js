// Smart Bill Icon System - Contextual icons for different bill types
import {
  // Utilities
  Zap, // Electric
  Droplets, // Water
  Flame, // Gas/Heating
  Wifi, // Internet
  Phone, // Phone/Mobile
  Cable, // Cable/TV
  Radio, // Radio/Satellite

  // Housing & Property
  Home, // Rent/Mortgage
  Building, // HOA/Property Management
  Wrench, // Maintenance/Repairs
  Lock, // Security Systems

  // Transportation
  Car, // Car Payment/Insurance
  Fuel, // Gas/Fuel
  ParkingCircle, // Parking

  // Insurance & Protection
  Shield, // Insurance (General)
  Heart, // Health Insurance
  Car as CarInsurance, // Auto Insurance
  Home as HomeInsurance, // Home Insurance
  Umbrella, // Life Insurance

  // Financial Services
  CreditCard, // Credit Card
  Building2, // Bank/Loan
  PiggyBank, // Savings/Investment
  Calculator, // Tax Services

  // Health & Medical
  Cross, // Medical Bills
  Pill, // Pharmacy
  Stethoscope, // Doctor Visits
  Eye, // Vision Care
  Smile, // Dental Care

  // Entertainment & Media
  Film, // Streaming Video
  Music, // Music Streaming
  Gamepad2, // Gaming Services
  Newspaper, // News/Magazines

  // Education & Development
  GraduationCap, // Education/Tuition
  Book, // Books/Materials
  Laptop, // Software/Tech

  // Personal & Family
  Baby, // Childcare
  Users, // Family Services
  Scissors, // Personal Care
  Activity, // Gym/Fitness

  // Business & Professional
  Briefcase, // Business Services
  FileText, // Professional Services
  Printer, // Office Supplies

  // Default fallback
  Receipt, // Generic bill
} from "lucide-react";

// Bill provider/company patterns with specific icons
const BILL_PROVIDER_ICONS = {
  // Electric Companies
  "pg&e": Zap,
  "pacific gas & electric": Zap,
  "southern california edison": Zap,
  sce: Zap,
  "duke energy": Zap,
  "florida power": Zap,
  electric: Zap,
  "power company": Zap,
  electricity: Zap,
  energy: Zap,

  // Water/Sewer
  "water department": Droplets,
  "water district": Droplets,
  "municipal water": Droplets,
  "water company": Droplets,
  sewer: Droplets,
  wastewater: Droplets,
  "water & sewer": Droplets,

  // Gas Companies
  "southern california gas": Flame,
  "socal gas": Flame,
  "national grid": Flame,
  "con edison": Flame,
  "gas company": Flame,
  "natural gas": Flame,
  propane: Flame,
  heating: Flame,

  // Internet/Cable/TV
  comcast: Wifi,
  xfinity: Wifi,
  spectrum: Cable,
  charter: Cable,
  cox: Cable,
  optimum: Cable,
  cablevision: Cable,
  directv: Cable,
  "dish network": Radio,
  satellite: Radio,
  internet: Wifi,
  cable: Cable,
  tv: Cable,
  television: Cable,

  // Phone/Mobile
  verizon: Phone,
  "at&t": Phone,
  "t-mobile": Phone,
  sprint: Phone,
  "metro pcs": Phone,
  "boost mobile": Phone,
  cricket: Phone,
  phone: Phone,
  mobile: Phone,
  wireless: Phone,
  cellular: Phone,

  // Streaming Services
  netflix: Film,
  hulu: Film,
  "disney+": Film,
  "disney plus": Film,
  "amazon prime": Film,
  hbo: Film,
  "hbo max": Film,
  "paramount+": Film,
  "apple tv": Film,
  "youtube premium": Film,
  spotify: Music,
  "apple music": Music,
  pandora: Music,
  "amazon music": Music,
  tidal: Music,

  // Insurance Companies
  allstate: Shield,
  geico: CarInsurance,
  progressive: CarInsurance,
  "state farm": Shield,
  farmers: Shield,
  nationwide: Shield,
  usaa: Shield,
  "liberty mutual": Shield,
  aetna: Heart,
  "blue cross": Heart,
  cigna: Heart,
  humana: Heart,
  kaiser: Heart,
  anthem: Heart,
  "united healthcare": Heart,
  "health insurance": Heart,
  "auto insurance": CarInsurance,
  "car insurance": CarInsurance,
  "home insurance": HomeInsurance,
  homeowners: HomeInsurance,
  "renters insurance": Home,
  "life insurance": Umbrella,

  // Banks & Financial
  chase: Building2,
  "bank of america": Building2,
  "wells fargo": Building2,
  citibank: Building2,
  "capital one": CreditCard,
  discover: CreditCard,
  "american express": CreditCard,
  amex: CreditCard,
  visa: CreditCard,
  mastercard: CreditCard,
  "credit card": CreditCard,
  loan: Building2,
  mortgage: Home,

  // Fitness & Health
  "planet fitness": Activity,
  "la fitness": Activity,
  "24 hour fitness": Activity,
  "gold's gym": Activity,
  "anytime fitness": Activity,
  gym: Activity,
  fitness: Activity,
  yoga: Activity,
  pilates: Activity,

  // Medical & Healthcare
  "kaiser permanente": Cross,
  "sutter health": Cross,
  "cedars-sinai": Cross,
  "ucla health": Cross,
  "mayo clinic": Cross,
  "cleveland clinic": Cross,
  "cvs pharmacy": Pill,
  walgreens: Pill,
  "rite aid": Pill,
  pharmacy: Pill,
  dental: Smile,
  orthodontist: Smile,
  dentist: Smile,
  vision: Eye,
  optometrist: Eye,
  "eye care": Eye,

  // Gaming & Entertainment
  xbox: Gamepad2,
  playstation: Gamepad2,
  nintendo: Gamepad2,
  steam: Gamepad2,
  gaming: Gamepad2,

  // Education
  university: GraduationCap,
  college: GraduationCap,
  school: GraduationCap,
  tuition: GraduationCap,
  "student loan": GraduationCap,
  pearson: Book,
  "mcgraw hill": Book,
  cengage: Book,

  // Childcare & Family
  daycare: Baby,
  preschool: Baby,
  babysitter: Baby,
  childcare: Baby,
  nanny: Baby,

  // Professional Services
  lawyer: Briefcase,
  attorney: Briefcase,
  accountant: Calculator,
  tax: Calculator,
  "h&r block": Calculator,
  turbotax: Calculator,
  consultant: Briefcase,

  // Security & Protection
  adt: Lock,
  "alarm.com": Lock,
  ring: Lock,
  security: Lock,
  alarm: Lock,
  monitoring: Lock,

  // Transportation
  "car payment": Car,
  "auto loan": Car,
  lease: Car,
  parking: ParkingCircle,
  toll: Car,
  registration: Car,
  dmv: Car,

  // Personal Care
  salon: Scissors,
  barber: Scissors,
  spa: Scissors,
  massage: Scissors,
  beauty: Scissors,
};

// Category-based fallback icons
const CATEGORY_FALLBACK_ICONS = {
  utilities: Zap,
  housing: Home,
  transportation: Car,
  insurance: Shield,
  healthcare: Cross,
  health: Cross,
  medical: Cross,
  entertainment: Film,
  subscriptions: CreditCard,
  financial: Building2,
  education: GraduationCap,
  "personal care": Scissors,
  fitness: Activity,
  business: Briefcase,
  security: Lock,
  childcare: Baby,
  food: Receipt,
  dining: Receipt,
  shopping: Receipt,
  other: Receipt,
  general: Receipt,
};

/**
 * Get smart icon for a bill based on provider/description
 * @param {string} provider - Bill provider name
 * @param {string} description - Bill description
 * @param {string} category - Bill category
 * @returns {React.Component} Lucide icon component
 */
export const getBillIcon = (provider = "", description = "", category = "") => {
  const searchText = `${provider} ${description}`.toLowerCase().trim();

  // First priority: Check specific provider patterns
  for (const [pattern, icon] of Object.entries(BILL_PROVIDER_ICONS)) {
    if (searchText.includes(pattern.toLowerCase())) {
      return icon;
    }
  }

  // Second priority: Check category fallbacks
  const normalizedCategory = category.toLowerCase().trim();
  const categoryIcon = CATEGORY_FALLBACK_ICONS[normalizedCategory];
  if (categoryIcon) {
    return categoryIcon;
  }

  // Third priority: Check if category partially matches any fallback
  for (const [categoryKey, icon] of Object.entries(CATEGORY_FALLBACK_ICONS)) {
    if (normalizedCategory.includes(categoryKey) || categoryKey.includes(normalizedCategory)) {
      return icon;
    }
  }

  // Final fallback
  return Receipt;
};

/**
 * Suggest a category and icon based on bill provider/description
 * @param {string} provider - Bill provider name
 * @param {string} description - Bill description
 * @returns {Object} { category, icon, confidence }
 */
export const suggestBillCategoryAndIcon = (provider = "", description = "") => {
  const searchText = `${provider} ${description}`.toLowerCase().trim();

  // Define category mappings based on provider patterns
  const categoryMappings = {
    // Utilities
    "electric|electricity|power|energy|pg&e|sce|duke": {
      category: "Utilities",
      icon: Zap,
    },
    "water|sewer|wastewater": { category: "Utilities", icon: Droplets },
    "gas|natural gas|heating|propane": { category: "Utilities", icon: Flame },
    "internet|wifi|broadband": { category: "Utilities", icon: Wifi },
    "phone|mobile|wireless|cellular|verizon|at&t|t-mobile": {
      category: "Utilities",
      icon: Phone,
    },
    "cable|tv|television|directv|dish|spectrum|comcast": {
      category: "Utilities",
      icon: Cable,
    },

    // Housing
    "rent|rental|apartment|mortgage|hoa|property": {
      category: "Housing",
      icon: Home,
    },

    // Insurance
    "insurance|allstate|geico|progressive|state farm": {
      category: "Insurance",
      icon: Shield,
    },
    "health insurance|aetna|blue cross|cigna|kaiser": {
      category: "Health Insurance",
      icon: Heart,
    },
    "auto insurance|car insurance": {
      category: "Auto Insurance",
      icon: CarInsurance,
    },
    "home insurance|homeowners": {
      category: "Home Insurance",
      icon: HomeInsurance,
    },

    // Entertainment & Subscriptions
    "netflix|hulu|disney|amazon prime|hbo|streaming": {
      category: "Entertainment",
      icon: Film,
    },
    "spotify|apple music|music|pandora": {
      category: "Entertainment",
      icon: Music,
    },
    "gym|fitness|planet fitness|24 hour": {
      category: "Health & Fitness",
      icon: Activity,
    },

    // Healthcare
    "medical|doctor|hospital|clinic|pharmacy|cvs|walgreens": {
      category: "Healthcare",
      icon: Cross,
    },
    "dental|dentist|orthodontist": { category: "Healthcare", icon: Smile },
    "vision|optometrist|eye care": { category: "Healthcare", icon: Eye },

    // Financial
    "credit card|loan|bank|chase|wells fargo|capital one": {
      category: "Financial",
      icon: CreditCard,
    },

    // Transportation
    "car payment|auto loan|parking|toll|dmv": {
      category: "Transportation",
      icon: Car,
    },

    // Education
    "tuition|university|college|school|student loan": {
      category: "Education",
      icon: GraduationCap,
    },

    // Personal Care
    "salon|barber|spa|beauty|massage": {
      category: "Personal Care",
      icon: Scissors,
    },

    // Childcare
    "daycare|childcare|babysitter|preschool": {
      category: "Childcare",
      icon: Baby,
    },

    // Security
    "security|alarm|adt|monitoring": { category: "Security", icon: Lock },
  };

  // Check for matches
  for (const [pattern, result] of Object.entries(categoryMappings)) {
    const regex = new RegExp(pattern, "i");
    if (regex.test(searchText)) {
      return {
        category: result.category,
        icon: result.icon,
        confidence: 0.8, // High confidence for pattern matches
      };
    }
  }

  // Default fallback
  return {
    category: "General",
    icon: Receipt,
    confidence: 0.1,
  };
};

/**
 * Get available icon options for a bill category
 * @param {string} category - Bill category
 * @returns {Array<React.Component>} Array of relevant icon options
 */
export const getBillIconOptions = (category = "") => {
  const normalizedCategory = category.toLowerCase().trim();

  const categoryIconSets = {
    utilities: [Zap, Droplets, Flame, Wifi, Phone, Cable],
    housing: [Home, Building, Lock, Wrench],
    insurance: [Shield, Heart, Car, Home, Umbrella],
    healthcare: [Cross, Pill, Stethoscope, Eye, Smile],
    entertainment: [Film, Music, Gamepad2, Cable],
    financial: [CreditCard, Building2, Calculator, PiggyBank],
    transportation: [Car, Fuel, ParkingCircle],
    education: [GraduationCap, Book, Laptop],
    "personal care": [Scissors, Activity, Heart],
    childcare: [Baby, Users],
    security: [Lock, Shield],
    business: [Briefcase, FileText, Printer],
  };

  // Find matching icon set
  for (const [categoryKey, icons] of Object.entries(categoryIconSets)) {
    if (normalizedCategory.includes(categoryKey) || categoryKey.includes(normalizedCategory)) {
      return icons;
    }
  }

  // Default set
  return [Receipt, Zap, Home, Shield, Cross, Car];
};

/**
 * Get display name for an icon component (for tooltips)
 * @param {React.Component} IconComponent - Lucide icon component
 * @returns {string} Display name
 */
export const getIconName = (IconComponent) => {
  if (!IconComponent || !IconComponent.name) return "Icon";

  // Convert component name to readable format
  // e.g., "Zap" -> "Electric", "Droplets" -> "Water"
  const nameMap = {
    Zap: "Electric",
    Droplets: "Water",
    Flame: "Gas/Heat",
    Wifi: "Internet",
    Phone: "Phone",
    Cable: "Cable/TV",
    Home: "Housing",
    Shield: "Insurance",
    Heart: "Health",
    Car: "Transportation",
    CreditCard: "Credit Card",
    Building2: "Banking",
    Cross: "Medical",
    Film: "Streaming",
    Music: "Music",
    Activity: "Fitness",
    Receipt: "Bill",
    GraduationCap: "Education",
    Scissors: "Personal Care",
    Baby: "Childcare",
    Lock: "Security",
    Briefcase: "Business",
  };

  return nameMap[IconComponent.name] || IconComponent.name || "Icon";
};

export default {
  getBillIcon,
  suggestBillCategoryAndIcon,
  getBillIconOptions,
  getIconName,
};
