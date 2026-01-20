/**
 * Centralized Icon Utility
 * All-purpose icon management for the entire application
 */

import React from "react";
import {
  // Navigation & UI
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Menu,
  X,
  Plus,
  Minus,
  Edit,
  Trash2,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  MoreVertical,

  // Status & Feedback
  Check,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  Info,
  HelpCircle,
  Eye,
  EyeOff,
  ThumbsUp,
  ThumbsDown,
  Star,
  Heart,
  Tag,
  Target,
  Bug,

  // Financial & Business
  DollarSign,
  CreditCard,
  PiggyBank,
  Calculator,
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart,
  PieChart,
  Activity,

  // Utilities & Services
  Zap,
  Lightbulb,
  Droplets,
  Flame,
  Wifi,
  WifiOff,
  Phone,
  Cable,
  Radio,

  // Housing & Property
  Home,
  Building,
  Building2,
  Wrench,
  Lock,
  Key,

  // Transportation
  Car,
  Fuel,
  ParkingCircle,

  // Insurance & Protection
  Umbrella,

  // Healthcare
  Cross,
  Pill,
  Stethoscope,

  // Entertainment & Media
  Smile,
  Film,
  Music,
  Gamepad2,
  Newspaper,

  // Education & Work
  GraduationCap,
  Book,
  Laptop,
  Briefcase,

  // Family & Personal
  Baby,
  Users,
  User,
  Scissors,

  // Food & Shopping
  UtensilsCrossed,
  Coffee,
  ShoppingCart,

  // Documents & Files
  FileText,
  Printer,
  Receipt,
  Upload,
  Download,
  PencilLine,

  // Time & Calendar
  Clock,
  History,
  Calendar,
  Timer,

  // Communication
  Mail,
  MessageSquare,
  Bell,
  BellOff,

  // Security
  Shield,
  ShieldOff,
  ShieldCheck,
  ShieldAlert,
  Fingerprint,

  // Sync & Cloud
  Cloud,
  CloudOff,
  RefreshCw,
  RotateCcw,

  // Data & Analytics
  Database,
  BarChart3,
  LineChart,

  // Actions
  Copy,
  Save,
  Share,
  ExternalLink,
  SplitSquareHorizontal,

  // Loading & Progress
  Loader2,

  // Debt Types (matching constants/debts.js)
  Scale, // For Chapter 13
} from "lucide-react";

/**
 * Common props for icon components
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  title?: string;
  "data-testid"?: string;
}

/**
 * Type for icon components used in the application
 */
export type IconComponent = React.ComponentType<IconProps>;

// Icon registry - maps string names to components
export const ICON_REGISTRY = {
  // Navigation & UI
  "arrow-right": ArrowRight,
  "arrow-left": ArrowLeft,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevron-down": ChevronDown,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  menu: Menu,
  Menu: Menu,
  x: X,
  X: X,
  plus: Plus,
  Plus: Plus,
  minus: Minus,
  Minus: Minus,
  edit: Edit,
  Edit: Edit,
  edit2: Edit,
  Edit2: Edit,
  trash: Trash2,
  Trash2: Trash2,
  search: Search,
  Search: Search,
  filter: Filter,
  Filter: Filter,
  settings: Settings,
  Settings: Settings,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,
  MoreHorizontal,
  MoreVertical,

  // Status & Feedback
  check: Check,
  Check: Check,
  "check-circle": CheckCircle,
  CheckCircle: CheckCircle,
  "x-circle": XCircle,
  XCircle: XCircle,
  "alert-circle": AlertCircle,
  AlertCircle: AlertCircle,
  "alert-triangle": AlertTriangle,
  AlertTriangle: AlertTriangle,
  info: Info,
  Info: Info,
  help: HelpCircle,
  "help-circle": HelpCircle,
  HelpCircle: HelpCircle,
  eye: Eye,
  Eye: Eye,
  "eye-off": EyeOff,
  EyeOff: EyeOff,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  star: Star,
  Star: Star,
  heart: Heart,
  Heart: Heart,
  Tag: Tag,
  Target: Target,
  bug: Bug,
  Bug: Bug,

  // Financial & Business
  "dollar-sign": DollarSign,
  DollarSign: DollarSign,
  "credit-card": CreditCard,
  CreditCard: CreditCard,
  "piggy-bank": PiggyBank,
  PiggyBank: PiggyBank,
  calculator: Calculator,
  Calculator: Calculator,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  TrendingUp: TrendingUp,
  TrendingDown: TrendingDown,
  Wallet: Wallet,
  "bar-chart": BarChart,
  "pie-chart": PieChart,
  BarChart: BarChart,
  PieChart: PieChart,
  activity: Activity,
  Activity: Activity,

  // Utilities & Services (matching debt constants)
  Zap: Zap,
  zap: Zap,
  Lightbulb: Lightbulb,
  lightbulb: Lightbulb,
  Droplets: Droplets,
  Flame: Flame,
  Wifi: Wifi,
  WifiOff: WifiOff,
  "wifi-off": WifiOff,
  Phone: Phone,
  Cable: Cable,
  Radio: Radio,

  // Housing & Property (matching debt constants)
  Home: Home,
  Building: Building,
  Building2: Building2,
  Wrench: Wrench,
  Lock: Lock,
  Key: Key,

  // Transportation (matching debt constants)
  Car: Car,
  Fuel: Fuel,
  ParkingCircle: ParkingCircle,

  // Insurance & Protection
  Umbrella: Umbrella,

  // Healthcare
  Cross: Cross,
  Pill: Pill,
  Stethoscope: Stethoscope,

  // Entertainment & Media
  Smile: Smile,
  Film: Film,
  Music: Music,
  Gamepad2: Gamepad2,
  Newspaper: Newspaper,

  // Education & Work (matching debt constants)
  GraduationCap: GraduationCap,
  Book: Book,
  Laptop: Laptop,
  Briefcase: Briefcase,

  // Family & Personal (matching debt constants)
  Baby: Baby,
  Users: Users,
  User: User,
  Scissors: Scissors,

  // Food & Shopping
  UtensilsCrossed: UtensilsCrossed,
  Coffee: Coffee,
  ShoppingCart: ShoppingCart,

  // Documents & Files (matching debt constants)
  FileText: FileText,
  Printer: Printer,
  Receipt: Receipt,
  Upload: Upload,
  Download: Download,

  // Time & Calendar
  Clock: Clock,
  history: History,
  History: History,
  "clock-history": History,
  Calendar: Calendar,
  Timer: Timer,

  // Communication
  Mail: Mail,
  MessageSquare: MessageSquare,
  Bell: Bell,
  BellOff: BellOff,

  // Security
  Shield: Shield,
  ShieldOff: ShieldOff,
  ShieldCheck: ShieldCheck,
  ShieldAlert: ShieldAlert,
  Fingerprint: Fingerprint,

  // Sync & Cloud
  Cloud: Cloud,
  CloudOff: CloudOff,
  RefreshCw: RefreshCw,
  RotateCcw: RotateCcw,

  // Data & Analytics
  Database: Database,
  BarChart3: BarChart3,
  LineChart: LineChart,

  // Actions
  Copy: Copy,
  Save: Save,
  Share: Share,
  ExternalLink: ExternalLink,
  SplitSquareHorizontal: SplitSquareHorizontal,
  PencilLine: PencilLine,

  // Loading & Progress
  Loader2: Loader2,

  // Debt Types (matching constants/debts.js)
  Scale: Scale, // For Chapter 13
};

/**
 * Get an icon component by its name
 * Supports both dash-case and PascalCase
 */
export const getIcon = (name: string | null | undefined): IconComponent => {
  if (!name) return HelpCircle;
  return (ICON_REGISTRY[name as keyof typeof ICON_REGISTRY] as IconComponent) || HelpCircle;
};

/**
 * Get icon name from component (reverse lookup)
 */
export const getIconName = (IconComponent: IconComponent | null | undefined): string | null => {
  if (!IconComponent) return null;

  for (const [name, component] of Object.entries(ICON_REGISTRY)) {
    if (component === IconComponent) return name;
  }

  return null;
};

// Render icon with consistent props
export const renderIcon = (
  iconName: string | undefined | null,
  props: Record<string, unknown> = {}
): React.ReactElement | null => {
  const IconComponent = getIcon(iconName);
  return IconComponent ? React.createElement(IconComponent, props) : null;
};

// Common icon sizes
export const ICON_SIZES = {
  xs: "h-3 w-3",
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
  xl: "h-8 w-8",
  "2xl": "h-10 w-10",
};

// Common icon colors
export const ICON_COLORS = {
  primary: "text-purple-600",
  secondary: "text-gray-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
  info: "text-blue-600",
};

// Export all icons for direct use
export * from "lucide-react";

// =============================================================================
// Bill Icon System - Provider and Category-based icon selection
// =============================================================================

// Type for bill icon options used in UI components
export type BillIconOption = {
  name: string;
  Icon: React.ComponentType;
};

// Company-specific icon mappings based on provider names
export const BILL_PROVIDER_ICONS: Record<string, React.ComponentType> = {
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

  // Water/Sewer Companies
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
  "columbia gas": Flame,
  "peoples gas": Flame,
  "gas company": Flame,
  "natural gas": Flame,

  // Internet/Cable/Phone
  comcast: Wifi,
  xfinity: Wifi,
  verizon: Phone,
  att: Phone,
  "at&t": Phone,
  spectrum: Cable,
  "time warner": Cable,
  cox: Cable,
  directv: Radio,
  dish: Radio,
  satellite: Radio,
  internet: Wifi,
  cable: Cable,
  phone: Phone,
  wireless: Phone,
  cellular: Phone,
  broadband: Wifi,
  fiber: Wifi,

  // Housing
  rent: Home,
  mortgage: Home,
  "property management": Home,
  hoa: Home,
  "homeowners association": Home,
  "condo association": Home,
  landlord: Home,

  // Insurance Companies
  "state farm": Shield,
  geico: Shield,
  progressive: Shield,
  allstate: Shield,
  farmers: Shield,
  usaa: Shield,
  insurance: Shield,
  "auto insurance": Shield,
  "car insurance": Shield,
  "health insurance": Cross,
  "medical insurance": Cross,
  "life insurance": Shield,
  "home insurance": Shield,
  "renters insurance": Shield,

  // Financial/Credit
  chase: CreditCard,
  "bank of america": CreditCard,
  "wells fargo": CreditCard,
  citibank: CreditCard,
  "capital one": CreditCard,
  discover: CreditCard,
  "american express": CreditCard,
  amex: CreditCard,
  "credit card": CreditCard,
  loan: CreditCard,
  bank: CreditCard,

  // Streaming/Entertainment
  netflix: Film,
  hulu: Film,
  disney: Film,
  "amazon prime": Film,
  hbo: Film,
  youtube: Film,
  spotify: Music,
  "apple music": Music,
  pandora: Music,
  streaming: Film,
  music: Music,

  // Education
  tuition: GraduationCap,
  school: GraduationCap,
  university: GraduationCap,
  college: GraduationCap,
  education: GraduationCap,

  // Food/Dining
  "uber eats": UtensilsCrossed,
  doordash: UtensilsCrossed,
  grubhub: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  starbucks: Coffee,
  coffee: Coffee,
  grocery: ShoppingCart,
  supermarket: ShoppingCart,
  walmart: ShoppingCart,
  target: ShoppingCart,
  costco: ShoppingCart,
  safeway: ShoppingCart,

  // Transportation
  "car payment": Car,
  "auto loan": Car,
  "gas station": Fuel,
  shell: Fuel,
  chevron: Fuel,
  exxon: Fuel,
  bp: Fuel,
  fuel: Fuel,
  gasoline: Fuel,

  // Fitness/Health
  gym: Activity,
  fitness: Activity,
  "24 hour fitness": Activity,
  "planet fitness": Activity,
  "la fitness": Activity,
  ymca: Activity,
  "health club": Activity,

  // Default fallback
  bill: Receipt,
  payment: Receipt,
};

// Category-based fallback icons when provider matching fails
export const CATEGORY_FALLBACK_ICONS: Record<string, React.ComponentType> = {
  utilities: Zap,
  electric: Zap,
  electricity: Zap,
  gas: Flame,
  water: Droplets,
  internet: Wifi,
  phone: Phone,
  cable: Cable,
  satellite: Radio,

  housing: Home,
  rent: Home,
  mortgage: Home,
  hoa: Building,
  maintenance: Wrench,
  security: Lock,

  transportation: Car,
  car: Car,
  auto: Car,
  fuel: Fuel,
  parking: ParkingCircle,

  insurance: Shield,
  health: Heart,
  medical: Cross,
  dental: Smile,
  vision: Eye,
  life: Umbrella,

  financial: CreditCard,
  credit: CreditCard,
  loan: Building2,
  bank: Building2,
  savings: PiggyBank,
  investment: PiggyBank,
  tax: Calculator,

  healthcare: Cross,
  pharmacy: Pill,
  doctor: Stethoscope,

  entertainment: Film,
  streaming: Film,
  music: Music,
  gaming: Gamepad2,
  news: Newspaper,

  education: GraduationCap,
  tuition: GraduationCap,
  books: Book,
  software: Laptop,
  tech: Laptop,

  personal: Scissors,
  family: Users,
  childcare: Baby,
  fitness: Activity,
  gym: Activity,

  food: UtensilsCrossed,
  dining: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  grocery: ShoppingCart,
  shopping: ShoppingCart,
  coffee: Coffee,

  business: Briefcase,
  professional: FileText,
  office: Printer,

  // Default
  bills: Receipt,
  other: Receipt,
};

// Category detection patterns for auto-categorization
export const CATEGORY_PATTERNS: Record<string, string[]> = {
  utilities: [
    "electric",
    "electricity",
    "power",
    "energy",
    "gas",
    "natural gas",
    "water",
    "sewer",
    "wastewater",
    "internet",
    "wifi",
    "broadband",
    "phone",
    "cellular",
    "wireless",
    "cable",
    "satellite",
  ],

  housing: [
    "rent",
    "mortgage",
    "hoa",
    "homeowners",
    "property management",
    "landlord",
    "maintenance",
    "repair",
    "security system",
  ],

  transportation: [
    "car payment",
    "auto loan",
    "car insurance",
    "gas",
    "fuel",
    "parking",
    "toll",
    "registration",
    "dmv",
  ],

  insurance: [
    "insurance",
    "health insurance",
    "medical insurance",
    "auto insurance",
    "car insurance",
    "home insurance",
    "renters insurance",
    "life insurance",
    "dental insurance",
    "vision insurance",
  ],

  financial: [
    "credit card",
    "loan",
    "mortgage",
    "bank",
    "savings",
    "investment",
    "retirement",
    "401k",
    "ira",
    "tax",
  ],

  healthcare: [
    "doctor",
    "medical",
    "hospital",
    "clinic",
    "pharmacy",
    "prescription",
    "dental",
    "dentist",
    "vision",
    "eye care",
    "health",
  ],

  entertainment: [
    "netflix",
    "hulu",
    "disney",
    "streaming",
    "music",
    "spotify",
    "gaming",
    "gym",
    "fitness",
    "subscription",
  ],

  education: [
    "tuition",
    "school",
    "university",
    "college",
    "education",
    "books",
    "supplies",
    "software",
    "tech",
  ],

  food: [
    "restaurant",
    "dining",
    "food",
    "grocery",
    "supermarket",
    "coffee",
    "uber eats",
    "doordash",
    "delivery",
  ],

  business: [
    "business",
    "professional",
    "office",
    "supplies",
    "service",
    "consulting",
    "software",
    "subscription",
  ],
};

// Icon options grouped by category for UI selection
export const ICON_OPTIONS_BY_CATEGORY: Record<string, BillIconOption[]> = {
  utilities: [
    { name: "Zap", Icon: Zap },
    { name: "Droplets", Icon: Droplets },
    { name: "Flame", Icon: Flame },
    { name: "Wifi", Icon: Wifi },
    { name: "Phone", Icon: Phone },
    { name: "Cable", Icon: Cable },
    { name: "Radio", Icon: Radio },
  ],

  housing: [
    { name: "Home", Icon: Home },
    { name: "Building", Icon: Building },
    { name: "Wrench", Icon: Wrench },
    { name: "Lock", Icon: Lock },
  ],

  transportation: [
    { name: "Car", Icon: Car },
    { name: "Fuel", Icon: Fuel },
    { name: "ParkingCircle", Icon: ParkingCircle },
  ],

  insurance: [
    { name: "Shield", Icon: Shield },
    { name: "Heart", Icon: Heart },
    { name: "Car", Icon: Car },
    { name: "Home", Icon: Home },
    { name: "Umbrella", Icon: Umbrella },
  ],

  financial: [
    { name: "CreditCard", Icon: CreditCard },
    { name: "Building2", Icon: Building2 },
    { name: "PiggyBank", Icon: PiggyBank },
    { name: "Calculator", Icon: Calculator },
  ],

  healthcare: [
    { name: "Cross", Icon: Cross },
    { name: "Pill", Icon: Pill },
    { name: "Stethoscope", Icon: Stethoscope },
    { name: "Eye", Icon: Eye },
    { name: "Smile", Icon: Smile },
  ],

  entertainment: [
    { name: "Film", Icon: Film },
    { name: "Music", Icon: Music },
    { name: "Gamepad2", Icon: Gamepad2 },
    { name: "Newspaper", Icon: Newspaper },
  ],

  education: [
    { name: "GraduationCap", Icon: GraduationCap },
    { name: "Book", Icon: Book },
    { name: "Laptop", Icon: Laptop },
  ],

  personal: [
    { name: "Baby", Icon: Baby },
    { name: "Users", Icon: Users },
    { name: "Scissors", Icon: Scissors },
    { name: "Activity", Icon: Activity },
  ],

  food: [
    { name: "UtensilsCrossed", Icon: UtensilsCrossed },
    { name: "Coffee", Icon: Coffee },
    { name: "ShoppingCart", Icon: ShoppingCart },
  ],

  business: [
    { name: "Briefcase", Icon: Briefcase },
    { name: "FileText", Icon: FileText },
    { name: "Printer", Icon: Printer },
  ],

  default: [
    { name: "Receipt", Icon: Receipt },
    { name: "FileText", Icon: FileText },
  ],
};

// Default icon options for general use
export const DEFAULT_ICON_OPTIONS: BillIconOption[] = [
  { name: "Receipt", Icon: Receipt },
  { name: "FileText", Icon: FileText },
  { name: "Zap", Icon: Zap },
  { name: "Droplets", Icon: Droplets },
  { name: "Flame", Icon: Flame },
  { name: "Home", Icon: Home },
  { name: "Car", Icon: Car },
  { name: "Shield", Icon: Shield },
  { name: "CreditCard", Icon: CreditCard },
  { name: "Cross", Icon: Cross },
  { name: "Film", Icon: Film },
  { name: "GraduationCap", Icon: GraduationCap },
  { name: "UtensilsCrossed", Icon: UtensilsCrossed },
  { name: "Briefcase", Icon: Briefcase },
];

/**
 * Get appropriate icon based on provider name, description, and category
 */
export const getBillIcon = (provider = "", description = "", category = ""): IconComponent => {
  const searchText = `${provider} ${description}`.toLowerCase().trim();

  // First, try exact provider matching
  for (const [providerKey, icon] of Object.entries(BILL_PROVIDER_ICONS)) {
    if (searchText.includes(providerKey)) {
      return icon as IconComponent;
    }
  }

  // Fall back to category-based icon
  const normalizedCategory = category.toLowerCase().trim();
  const categoryIcon = CATEGORY_FALLBACK_ICONS[normalizedCategory];

  return (categoryIcon as IconComponent) || FileText; // Default fallback
};

/**
 * Suggest category and icon based on provider and description
 */
export const suggestBillCategoryAndIcon = (provider = "", description = "") => {
  const searchText = `${provider} ${description}`.toLowerCase().trim();

  // Check each category's patterns
  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    for (const pattern of patterns) {
      const regex = new RegExp(`\\b${pattern}\\b`, "i");
      if (regex.test(searchText)) {
        return {
          category,
          icon: CATEGORY_FALLBACK_ICONS[category] || FileText,
          iconName: getIconName(CATEGORY_FALLBACK_ICONS[category] || FileText) || "FileText",
          confidence: 0.8, // High confidence for pattern match
        };
      }
    }
  }

  // No pattern match found - return default
  return {
    category: "other",
    icon: FileText,
    iconName: "FileText",
    confidence: 0.1, // Low confidence - just a fallback
  };
};

/**
 * Get icon component from icon name string (bill icon version)
 */
export const getIconByName = (iconName: string): IconComponent => {
  if (!iconName || typeof iconName !== "string") {
    return FileText; // Default fallback
  }
  return (ICON_REGISTRY[iconName as keyof typeof ICON_REGISTRY] as IconComponent) || FileText;
};

/**
 * Get icon name for storage (serialization)
 */
export const getIconNameForStorage = (IconComponent: IconComponent): string => {
  if (!IconComponent) return "FileText";
  const displayName = (IconComponent as { displayName?: string }).displayName;
  return displayName || getIconName(IconComponent) || "FileText";
};

/**
 * Get icon options for a specific category
 */
export const getBillIconOptions = (category = ""): BillIconOption[] => {
  const normalizedCategory = category.toLowerCase().trim();

  const categoryIconSets: Record<string, BillIconOption[]> = {
    utilities: ICON_OPTIONS_BY_CATEGORY.utilities,
    housing: ICON_OPTIONS_BY_CATEGORY.housing,
    transportation: ICON_OPTIONS_BY_CATEGORY.transportation,
    insurance: ICON_OPTIONS_BY_CATEGORY.insurance,
    financial: ICON_OPTIONS_BY_CATEGORY.financial,
    healthcare: ICON_OPTIONS_BY_CATEGORY.healthcare,
    entertainment: ICON_OPTIONS_BY_CATEGORY.entertainment,
    education: ICON_OPTIONS_BY_CATEGORY.education,
    personal: ICON_OPTIONS_BY_CATEGORY.personal,
    food: ICON_OPTIONS_BY_CATEGORY.food,
    business: ICON_OPTIONS_BY_CATEGORY.business,
  };

  return categoryIconSets[normalizedCategory] || DEFAULT_ICON_OPTIONS;
};

// Backward compatibility exports
export const ALL_ICONS = ICON_REGISTRY;

// Default export for common usage
export default {
  get: getIcon,
  render: renderIcon,
  getName: getIconName,
  registry: ICON_REGISTRY,
  sizes: ICON_SIZES,
  colors: ICON_COLORS,
  // Bill-specific functions
  getBillIcon,
  suggestBillCategoryAndIcon,
  getIconByName,
  getBillIconOptions,
  getIconNameForStorage,
};
