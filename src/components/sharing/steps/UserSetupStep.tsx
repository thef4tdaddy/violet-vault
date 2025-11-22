import { Button } from "@/components/ui";
import { renderIcon } from "@/utils";

interface UserSetupStepProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shareInfo: any;
  creatorInfo?: {
    userName: string;
    userColor: string;
    createdAt?: string;
  };
  password: string;
  setPassword: (password: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  userName: string;
  setUserName: (name: string) => void;
  userColor: string;
  onGenerateRandomColor: () => void;
  onJoin: () => void;
  onBack: () => void;
  isJoining: boolean;
}

/**
 * User Setup Step - Step 2 of join budget flow
 * Extracted from JoinBudgetModal to reduce complexity
 */
const UserSetupStep = ({
  shareInfo,
  creatorInfo,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  userName,
  setUserName,
  userColor,
  onGenerateRandomColor,
  onJoin,
  onBack,
  isJoining,
}: UserSetupStepProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSubmit = (e: any) => {
    e.preventDefault();
    onJoin();
  };

  return (
    <>
      {/* Share Info Display */}
      <div>
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            {renderIcon("CheckCircle", "h-5 w-5 text-green-600")}
            <h4 className="font-black text-green-800 uppercase tracking-wide text-sm">
              Valid Share Code
            </h4>
          </div>
          {creatorInfo ? (
            <>
              <p className="text-xs text-green-700 mt-1">
                Created by:{" "}
                <strong style={{ color: creatorInfo.userColor }}>{creatorInfo.userName}</strong>
              </p>
              <p className="text-xs text-green-700">
                {creatorInfo.createdAt && (
                  <>Shared: {new Date(creatorInfo.createdAt).toLocaleDateString()}</>
                )}
              </p>
              <p className="text-xs text-green-600 mt-2">
                Enter the same password they used to join their budget
              </p>
            </>
          ) : (
            <>
              <p className="text-xs text-green-700 mt-1">
                Type: <strong>Deterministic Budget</strong>
              </p>
              <p className="text-xs text-green-700">Access: {shareInfo.userCount}</p>
              <p className="text-xs text-green-600 mt-2">
                Same code + password = same budget across devices
              </p>
            </>
          )}
        </div>
      </div>

      {/* User Setup */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Your Display Name *
          </label>
          <div className="space-y-2">
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 bg-white border-2 border-black rounded-lg text-sm"
              maxLength={20}
              required
            />
            <p className="text-xs text-purple-900">
              This is how others will see you in the shared budget
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Your Color
          </label>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg border-2 border-black"
              style={{ backgroundColor: userColor }}
            ></div>
            <Button
              onClick={onGenerateRandomColor}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-lg text-sm font-black transition-colors"
            >
              Random Color
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-black text-black uppercase tracking-wider mb-2">
            Budget Password *
          </label>
          <div className="space-y-2">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 bg-white border-2 border-black rounded-lg text-sm"
                required
              />
              <Button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition-colors"
              >
                {renderIcon(showPassword ? "EyeOff" : "Eye", "h-5 w-5")}
              </Button>
            </div>
            <p className="text-xs text-purple-900">
              This password encrypts your budget data. Use the same password as the person who
              shared this code.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-black rounded-lg font-black transition-colors border-2 border-black"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!password || !userName.trim() || isJoining}
          className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-black transition-colors border-2 border-black disabled:cursor-not-allowed"
        >
          {isJoining ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Joining Budget...
            </span>
          ) : (
            "Join Budget"
          )}
        </Button>
      </div>
    </>
  );
};

export default UserSetupStep;
