import { ExtendedReceiptData } from "@/hooks/platform/receipts/useReceiptScanner";

interface ScannerResultsProps {
  data: ExtendedReceiptData;
}

/**
 * ScannerResults - High-contrast display of OCR results
 */
const ScannerResults = ({ data }: ScannerResultsProps) => {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "bg-emerald-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-0.5 border-2 border-black bg-black text-white text-[10px] font-black uppercase font-mono tracking-widest">
          SYSTEM_SCAN_RESULT
        </span>
        <div className="h-[2px] flex-1 bg-black" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Merchant Info */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest mb-1 font-mono">
            MERCHANT_NAME
          </label>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-black uppercase font-mono break-all">
              {data.merchant || "NOT_DETECTED"}
            </span>
            <div
              className={`w-3 h-3 border border-black ${getConfidenceColor(data.confidence.merchant)}`}
              title={`Confidence: ${data.confidence.merchant}`}
            />
          </div>
        </div>

        {/* Total Info */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest mb-1 font-mono">
            TOTAL_AMOUNT
          </label>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-black font-mono">
              ${data.total || "0.00"}
            </span>
            <div
              className={`w-3 h-3 border border-black ${getConfidenceColor(data.confidence.total)}`}
              title={`Confidence: ${data.confidence.total}`}
            />
          </div>
        </div>

        {/* Date Info */}
        <div className="border-2 border-black bg-white p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest mb-1 font-mono">
            TRANSACTION_DATE
          </label>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-black font-mono">
              {data.date || "NO_DATE"}
            </span>
            <div
              className={`w-3 h-3 border border-black ${getConfidenceColor(data.confidence.date)}`}
              title={`Confidence: ${data.confidence.date}`}
            />
          </div>
        </div>

        {/* Metadata */}
        <div className="border-2 border-black bg-purple-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest mb-1 font-mono">
            OCR_METADATA
          </label>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold font-mono">
              <span className="text-purple-700">TIME:</span>
              <span className="text-black">{data.processingTime}MS</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold font-mono">
              <span className="text-purple-700">ENGINE:</span>
              <span className="text-black">TESSERACT_SENTINEL</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table if available */}
      {data.items && data.items.length > 0 && (
        <div className="mb-8 overflow-hidden border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full text-left font-mono">
            <thead className="bg-black text-white text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-4 py-2 border-r border-white/20">DESCRIPTION</th>
                <th className="px-4 py-2 w-24 text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.items.map((item, index) => (
                <tr key={index} className="border-t border-black text-xs font-bold leading-tight">
                  <td className="px-4 py-3 border-r border-black uppercase truncate max-w-[200px]">
                    {item.description}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">${item.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Raw Text Preview */}
      <div className="space-y-2">
        <label className="block text-[10px] font-black text-purple-900 uppercase tracking-widest font-mono">
          RAW_OCR_DUMP
        </label>
        <div className="border-2 border-black bg-gray-900 text-gray-400 p-4 font-mono text-[10px] max-h-32 overflow-y-auto whitespace-pre-wrap leading-tight shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          {data.rawText || "NO_RAW_DATA"}
        </div>
      </div>
    </div>
  );
};

export default ScannerResults;
