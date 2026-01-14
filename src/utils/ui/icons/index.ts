/**
 * Centralized Icon Utility
 * All-purpose icon management for the entire application
 */
/* eslint-disable no-restricted-imports, no-direct-icon-imports/no-direct-icon-imports */
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
  menu: Menu,
  x: X,
  X: X, // PascalCase alias for close buttons
  plus: Plus,
  minus: Minus,
  edit: Edit,
  trash: Trash2,
  search: Search,
  filter: Filter,
  settings: Settings,
  "more-horizontal": MoreHorizontal,
  "more-vertical": MoreVertical,

  // Status & Feedback
  check: Check,
  "check-circle": CheckCircle,
  CheckCircle: CheckCircle, // PascalCase alias
  "x-circle": XCircle,
  XCircle: XCircle, // PascalCase alias
  "alert-circle": AlertCircle,
  AlertCircle: AlertCircle, // PascalCase alias
  "alert-triangle": AlertTriangle,
  AlertTriangle: AlertTriangle, // PascalCase alias
  info: Info,
  Info: Info, // PascalCase alias
  eye: Eye,
  "eye-off": EyeOff,
  "thumbs-up": ThumbsUp,
  "thumbs-down": ThumbsDown,
  star: Star,
  heart: Heart,
  Tag: Tag,
  Target: Target,
  bug: Bug,
  Bug: Bug, // PascalCase alias

  // Financial & Business
  "dollar-sign": DollarSign,
  "credit-card": CreditCard,
  "piggy-bank": PiggyBank,
  calculator: Calculator,
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  TrendingUp: TrendingUp,
  Wallet: Wallet,
  "bar-chart": BarChart,
  "pie-chart": PieChart,
  activity: Activity,

  // Utilities & Services (matching debt constants)
  Zap: Zap,
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
  DollarSign: DollarSign, // For Other debt type
  CreditCard: CreditCard, // For Credit Card debt type
};

// Get icon component by name
export const getIcon = (
  iconName: string | undefined | null,
  fallback: React.ComponentType<{ className?: string; title?: string }> = FileText
): React.ComponentType<{ className?: string; title?: string }> => {
  if (!iconName) return fallback;
  return ICON_REGISTRY[iconName as keyof typeof ICON_REGISTRY] || fallback;
};

// Get icon name from component (reverse lookup)
export const getIconName = (iconComponent: React.ComponentType): string | null => {
  const entry = Object.entries(ICON_REGISTRY).find(([_, component]) => component === iconComponent);
  return entry ? entry[0] : null;
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

// Default export for common usage
export default {
  get: getIcon,
  render: renderIcon,
  getName: getIconName,
  registry: ICON_REGISTRY,
  sizes: ICON_SIZES,
  colors: ICON_COLORS,
};
