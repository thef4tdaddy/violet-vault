/**
 * Extracted Items List Component
 * Displays receipt line items in a scrollable container
 */

interface ReceiptItem {
  description: string;
  amount: number;
  rawLine?: string;
}

interface ExtractedItemsListProps {
  items: ReceiptItem[];
}

const ExtractedItemsList = ({ items }: ExtractedItemsListProps) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-4 pt-4 border-t-2 border-black">
      <h4 className="font-black text-black text-sm mb-3">
        <span className="text-base">I</span>TEMS <span className="text-base">F</span>OUND (
        {items.length})
      </h4>
      <div className="glassmorphism rounded-lg p-3 border border-white/20 bg-white/20 backdrop-blur-sm max-h-32 overflow-y-auto">
        <div className="space-y-1">
          {items.slice(0, 5).map((item: ReceiptItem, index: number) => (
            <div
              key={index}
              className="flex justify-between text-sm py-1 px-2 glassmorphism rounded border border-white/10 bg-white/10"
            >
              <span className="text-purple-900 truncate flex-1 font-medium">
                {item.description}
              </span>
              <span className="font-black text-black ml-2">${item.amount.toFixed(2)}</span>
            </div>
          ))}
          {items.length > 5 && (
            <div className="text-xs text-purple-900 text-center py-1 font-semibold">
              +{items.length - 5} more items
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractedItemsList;
