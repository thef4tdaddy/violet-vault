import type { ComponentType } from "react";
// Icon selection options for UI components
import {
  Zap,
  Droplets,
  Flame,
  Wifi,
  Phone,
  Cable,
  Radio,
  Home,
  Building,
  Wrench,
  Lock,
  Car,
  Fuel,
  ParkingCircle,
  Shield,
  Heart,
  Umbrella,
  CreditCard,
  Building2,
  PiggyBank,
  Calculator,
  Cross,
  Pill,
  Stethoscope,
  Eye,
  Smile,
  Film,
  Music,
  Gamepad2,
  Newspaper,
  GraduationCap,
  Book,
  Laptop,
  Baby,
  Users,
  Scissors,
  Activity,
  UtensilsCrossed,
  Coffee,
  ShoppingCart,
  Briefcase,
  FileText,
  Printer,
  Receipt,
} from "../icons";

export type BillIconOption = {
  name: string;
  Icon: ComponentType;
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
 * Get icon options for a specific category
 */
export const getBillIconOptions = (category = ""): BillIconOption[] => {
  const normalizedCategory = category.toLowerCase().trim();

  const categoryIconSets = {
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
