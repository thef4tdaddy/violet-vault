import React from "react";
import Button from "@/components/ui/buttons/Button";
import { getIcon } from "@/utils/ui/icons";
import ModalCloseButton from "@/components/ui/ModalCloseButton";

interface PrivacyExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoIcon = getIcon("Info");
const ShieldIcon = getIcon("Shield");
const LockIcon = getIcon("Lock");
const CloudIcon = getIcon("Cloud");
const ArrowRightIcon = getIcon("ArrowRight");

/**
 * PrivacyExplainerModal Component
 * Explains data flow and privacy trade-offs for each analytics tier
 *
 * Features:
 * - Clear explanation of what data is sent where
 * - Visual diagram of data flow
 * - Tier-by-tier breakdown
 * - Accessible modal with keyboard support
 *
 * Usage:
 * <PrivacyExplainerModal
 *   isOpen={showExplainer}
 *   onClose={() => setShowExplainer(false)}
 * />
 */
const PrivacyExplainerModal: React.FC<PrivacyExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-60 overflow-y-auto">
      <div className="glassmorphism rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border-2 border-black bg-purple-100/40 backdrop-blur-3xl my-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="glassmorphism rounded-full p-3 bg-blue-500/20 border border-blue-400">
                <InfoIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black uppercase tracking-wide">
                  Privacy Explained
                </h3>
                <p className="text-sm text-purple-800 font-medium mt-1">
                  🔐 What data is sent where?
                </p>
              </div>
            </div>
            <ModalCloseButton onClick={onClose} />
          </div>

          {/* Content */}
          <PrivacyTiers />

          {/* Footer */}

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg border-2 border-black hover:bg-blue-700 transition-colors shadow-sm"
            >
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TierOneCard = () => (
  <div className="glassmorphism rounded-2xl p-4 bg-green-50/80 border-2 border-green-400">
    <div className="flex items-start gap-3 mb-3">
      <div className="p-2 rounded-lg bg-green-100 border border-black">
        <ShieldIcon className="h-5 w-5 text-green-600" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900">Tier 1: 100% Offline</h4>
        <p className="text-sm text-gray-700 font-semibold">Maximum Privacy</p>
      </div>
    </div>

    <div className="bg-white/60 rounded-lg p-4 mb-3 border border-gray-300">
      <div className="flex items-center justify-center gap-4 text-sm font-semibold text-gray-900">
        <span className="px-3 py-2 bg-blue-100 rounded-lg border-2 border-black">
          📱 Your Browser
        </span>
        <span className="text-red-600 text-xl">✗</span>
        <span className="px-3 py-2 bg-gray-100 rounded-lg border-2 border-black opacity-50">
          🌐 Server
        </span>
      </div>
    </div>

    <ul className="space-y-2 text-sm text-gray-700">
      <li className="flex items-start gap-2">
        <span className="text-green-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Nothing leaves your device</strong> - All calculations happen locally
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>No network requests</strong> - Complete offline functionality
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-green-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Zero tracking</strong> - No analytics or telemetry
        </span>
      </li>
    </ul>
  </div>
);

const TierTwoCard = () => (
  <div className="glassmorphism rounded-2xl p-4 bg-blue-50/80 border-2 border-blue-400">
    <div className="flex items-start gap-3 mb-3">
      <div className="p-2 rounded-lg bg-blue-100 border border-black">
        <LockIcon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900">Tier 2: Private Backend</h4>
        <p className="text-sm text-gray-700 font-semibold">High Privacy</p>
      </div>
    </div>

    <div className="bg-white/60 rounded-lg p-4 mb-3 border border-gray-300">
      <div className="flex items-center justify-center gap-3 text-sm font-semibold text-gray-900">
        <span className="px-3 py-2 bg-blue-100 rounded-lg border-2 border-black">
          📱 Your Browser
        </span>
        <ArrowRightIcon className="h-4 w-4 text-blue-600" />
        <span className="px-3 py-2 bg-purple-100 rounded-lg border-2 border-black">
          🔐 Encrypted
        </span>
        <ArrowRightIcon className="h-4 w-4 text-blue-600" />
        <span className="px-3 py-2 bg-green-100 rounded-lg border-2 border-black">⚡ Vercel</span>
        <ArrowRightIcon className="h-4 w-4 text-blue-600" />
        <span className="px-3 py-2 bg-blue-100 rounded-lg border-2 border-black">📱 Back</span>
      </div>
    </div>

    <ul className="space-y-2 text-sm text-gray-700">
      <li className="flex items-start gap-2">
        <span className="text-blue-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>End-to-end encryption</strong> - Data encrypted before leaving device
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-blue-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Ephemeral processing</strong> - No data stored on servers
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-blue-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Faster computation</strong> - Serverless functions for heavy calculations
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-blue-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>No data retention</strong> - Results returned, then deleted immediately
        </span>
      </li>
    </ul>
  </div>
);

const TierThreeCard = () => (
  <div className="glassmorphism rounded-2xl p-4 bg-purple-50/80 border-2 border-purple-400 opacity-70">
    <div className="flex items-start gap-3 mb-3">
      <div className="p-2 rounded-lg bg-purple-100 border border-black">
        <CloudIcon className="h-5 w-5 text-purple-600" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-lg font-bold text-gray-900">Tier 3: Cloud Sync</h4>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
            Coming Soon
          </span>
        </div>
        <p className="text-sm text-gray-700 font-semibold">Standard Privacy</p>
      </div>
    </div>

    <div className="bg-white/60 rounded-lg p-4 mb-3 border border-gray-300">
      <div className="flex items-center justify-center gap-3 text-sm font-semibold text-gray-900">
        <span className="px-3 py-2 bg-blue-100 rounded-lg border-2 border-black">📱 Device 1</span>
        <ArrowRightIcon className="h-4 w-4 text-purple-600" />
        <span className="px-3 py-2 bg-purple-100 rounded-lg border-2 border-black">☁️ Cloud</span>
        <ArrowRightIcon className="h-4 w-4 text-purple-600" />
        <span className="px-3 py-2 bg-blue-100 rounded-lg border-2 border-black">💻 Device 2</span>
      </div>
    </div>

    <ul className="space-y-2 text-sm text-gray-700">
      <li className="flex items-start gap-2">
        <span className="text-purple-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Multi-device sync</strong> - Access your data anywhere
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-purple-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Cloud backup</strong> - Automatic data backup
        </span>
      </li>
      <li className="flex items-start gap-2">
        <span className="text-purple-600 font-bold mt-0.5">✓</span>
        <span>
          <strong>Advanced analytics</strong> - Server-side insights
        </span>
      </li>
    </ul>
  </div>
);

const PrivacyTiers = () => (
  <div className="space-y-6 max-h-[60vh] overflow-y-auto">
    <TierOneCard />
    <TierTwoCard />
    <TierThreeCard />

    {/* Privacy Commitment */}
    <div className="glassmorphism rounded-2xl p-4 bg-yellow-50/80 border-2 border-yellow-400">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-yellow-100 border border-black">
          <ShieldIcon className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-gray-900 mb-2">Our Privacy Commitment</h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong>Your data is yours.</strong> We never sell, share, or use your financial data
            for any purpose other than providing the service you requested.
          </p>
          <p className="text-sm text-gray-700">
            All tiers are designed with privacy-first principles. Choose the tier that best matches
            your privacy needs and performance preferences.
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default PrivacyExplainerModal;
