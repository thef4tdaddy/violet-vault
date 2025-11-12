/**
 * Amazon Receipt Parser Service
 * Server-side parser that extracts transaction data from Amazon email receipts
 */

import type { AmazonReceipt, AmazonReceiptItem } from "@/domain/schemas/amazon-receipt";
import logger from "@/utils/common/logger";

/**
 * Amazon category mapping for better organization
 */
const AMAZON_CATEGORIES = {
  "Pet Supplies": {
    keywords: /\b(pet|dog|cat|puppy|kitten|animal)\b.*(food|treat|toy|collar|leash|supplies)/i,
    icon: "🐕",
    color: "#f97316",
  },
  "Electronics & Tech": {
    keywords:
      /\b(electronic|computer|phone|tablet|headphone|cable|charger|tech|device|kindle|echo|fire tv|mouse|keyboard|laptop|monitor)\b/i,
    icon: "📱",
    color: "#3b82f6",
  },
  "Home & Kitchen": {
    keywords:
      /\b(kitchen|furniture|decor|appliance|cookware|bedding|bathroom|cleaning|maker|stand)\b/i,
    icon: "🏠",
    color: "#8b5cf6",
  },
  "Groceries & Food": {
    keywords:
      /\b(grocery|groceries|snack|drink|pantry|beverage|fresh|whole foods|amazon fresh|milk|produce|spinach)\b/i,
    icon: "🛒",
    color: "#10b981",
  },
  "Clothing & Accessories": {
    keywords: /\b(clothing|shirt|pants|shoes|dress|jacket|accessories|jewelry|watch|apparel)\b/i,
    icon: "👕",
    color: "#ec4899",
  },
  "Health & Beauty": {
    keywords: /\b(health|beauty|vitamin|supplement|cosmetic|skincare|personal care|pharmacy)\b/i,
    icon: "💊",
    color: "#06b6d4",
  },
  "Books & Media": {
    keywords: /\b(book|kindle|audible|movie|music|video|dvd|cd|magazine)\b/i,
    icon: "📚",
    color: "#f59e0b",
  },
  "Sports & Outdoors": {
    keywords: /\b(sport|outdoor|fitness|exercise|camping|hiking|athletic|gym|yoga|mat)\b/i,
    icon: "⚽",
    color: "#84cc16",
  },
  "Office & Business": {
    keywords: /\b(office|business|supply|paper|pen|desk|chair|printer|stationery)\b/i,
    icon: "📝",
    color: "#6366f1",
  },
  "Amazon Services": {
    keywords: /\b(prime|subscription|membership|aws|kindle unlimited|audible music)\b/i,
    icon: "⭐",
    color: "#a855f7",
  },
};

/**
 * Email data structure
 */
interface EmailData {
  content: string;
  subject: string;
  date: string;
  messageId?: string;
}

/**
 * Categorize individual items
 */
function categorizeItem(itemName: string): {
  name: string;
  icon: string;
  color: string;
} {
  const item = itemName.toLowerCase();

  for (const [categoryName, categoryData] of Object.entries(AMAZON_CATEGORIES)) {
    if (categoryData.keywords.test(item)) {
      return {
        name: categoryName,
        icon: categoryData.icon,
        color: categoryData.color,
      };
    }
  }

  return {
    name: "General Shopping",
    icon: "🛍️",
    color: "#64748b",
  };
}

/**
 * Determine primary category for the order
 */
function determinePrimaryCategory(
  items: AmazonReceiptItem[],
  subject: string
): { name: string; icon: string; color: string } {
  if (items.length === 0) {
    return categorizeItem(subject);
  }

  // If single item, use its category
  if (items.length === 1) {
    return items[0].category;
  }

  // For multiple items, use the category with highest total value
  const categoryTotals: Record<
    string,
    { total: number; name: string; icon: string; color: string }
  > = {};

  items.forEach((item) => {
    const category = item.category.name;
    if (!categoryTotals[category]) {
      categoryTotals[category] = {
        total: 0,
        ...item.category,
      };
    }
    categoryTotals[category].total += item.totalPrice;
  });

  const primaryCategory = Object.values(categoryTotals).sort((a, b) => b.total - a.total)[0];

  return {
    name: primaryCategory.name,
    icon: primaryCategory.icon,
    color: primaryCategory.color,
  };
}

/**
 * Parse Amazon receipt from email data
 */
export function parseAmazonReceipt(emailData: EmailData): AmazonReceipt | null {
  try {
    const { content, subject, date } = emailData;

    const patterns = {
      orderNumber: /Order #([\w-]+)|Your order of ([\w-]+)/i,
      total: /Order Total[:\s]*\$?(\d+[,.]?\d*\.?\d{2})|Total[:\s]*\$?(\d+[,.]?\d*\.?\d{2})/i,
      items: /(\d+)\s+of\s+([^$\n]+?)\s+\$(\d+[,.]?\d*\.?\d{2})/gi,
      shipping: /Shipping[:\s]*\$?(\d+[,.]?\d*\.?\d{2})/i,
      tax: /Tax[:\s]*\$?(\d+[,.]?\d*\.?\d{2})/i,
      deliveryDate: /Delivery[:\s]*([A-Za-z]+,\s*[A-Za-z]+\s*\d+)/i,
      trackingNumber: /Tracking.*?(\w{10,})/i,
    };

    // Extract order number
    const orderMatch = patterns.orderNumber.exec(content);
    const orderId = orderMatch ? orderMatch[1] || orderMatch[2] : `ORDER_${Date.now()}`;

    // Extract total amount
    const totalMatch = patterns.total.exec(content);
    const total = totalMatch
      ? parseFloat((totalMatch[1] || totalMatch[2]).replace(/[,$]/g, ""))
      : 0;

    // Extract individual items
    const items: AmazonReceiptItem[] = [];
    let itemMatch;
    while ((itemMatch = patterns.items.exec(content)) !== null) {
      const quantity = parseInt(itemMatch[1]) || 1;
      const itemName = itemMatch[2].trim();
      const itemPrice = parseFloat(itemMatch[3].replace(/[,$]/g, ""));

      items.push({
        name: itemName,
        quantity: quantity,
        price: itemPrice,
        totalPrice: quantity * itemPrice,
        category: categorizeItem(itemName),
      });
    }

    // Extract shipping and tax
    const shippingMatch = patterns.shipping.exec(content);
    const shipping = shippingMatch ? parseFloat(shippingMatch[1].replace(/[,$]/g, "")) : 0;

    const taxMatch = patterns.tax.exec(content);
    const tax = taxMatch ? parseFloat(taxMatch[1].replace(/[,$]/g, "")) : 0;

    // Determine primary category
    const primaryCategory = determinePrimaryCategory(items, subject);

    return {
      id: `amazon_${orderId}_${Date.now()}`,
      orderId: orderId,
      subject: subject,
      date: new Date(date).toISOString().split("T")[0],
      total: total,
      shipping: shipping,
      tax: tax,
      subtotal: total - shipping - tax,
      items: items,
      primaryCategory: primaryCategory.name,
      categoryIcon: primaryCategory.icon,
      categoryColor: primaryCategory.color,
      deliveryDate: patterns.deliveryDate.exec(content)?.[1] || null,
      trackingNumber: patterns.trackingNumber.exec(content)?.[1] || null,
      source: "amazon_email",
      rawEmail: emailData,
    };
  } catch (error) {
    logger.error("Error parsing Amazon receipt", error);
    return null;
  }
}

/**
 * Parse multiple Amazon receipts from email data array
 */
export function parseAmazonReceipts(emailDataArray: EmailData[]): AmazonReceipt[] {
  return emailDataArray
    .map((emailData) => parseAmazonReceipt(emailData))
    .filter((receipt): receipt is AmazonReceipt => receipt !== null);
}
