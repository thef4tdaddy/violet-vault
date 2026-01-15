/**
 * User Setup Utility Functions
 * Constants and helper functions for user setup flow
 */

/**
 * Available color options for user profile
 */
export const USER_COLORS = [
  { name: "Purple", value: "#a855f7" },
  { name: "Emerald", value: "#10b981" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
];

/**
 * Validate setup form data
 */
export const validateSetupData = ({
  masterPassword,
  userName,
  userColor,
}: {
  masterPassword: string;
  userName: string;
  userColor: string;
}) => {
  const errors = [];

  if (!masterPassword || masterPassword.trim().length === 0) {
    errors.push("Master password is required");
  }

  if (!userName || userName.trim().length === 0) {
    errors.push("User name is required");
  }

  if (!userColor) {
    errors.push("User color is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get step title based on current state
 */
export const getStepTitle = (step: number, isReturningUser: boolean, userName: string) => {
  if (isReturningUser) {
    return (
      <span className="uppercase tracking-wider text-black">
        <span className="text-4xl">W</span>ELCOME <span className="text-4xl">B</span>ACK,{" "}
        <span className="text-4xl font-black">{userName.toUpperCase()}</span>!
      </span>
    );
  }

  if (step === 1) {
    return (
      <span className="uppercase tracking-wider text-black">
        <span className="text-4xl">G</span>ET <span className="text-4xl">S</span>TARTED
      </span>
    );
  }

  if (step === 2) {
    return (
      <span className="uppercase tracking-wider text-black">
        <span className="text-4xl">S</span>ET <span className="text-4xl">U</span>P{" "}
        <span className="text-4xl">P</span>
        ROFILE
      </span>
    );
  }

  return (
    <span className="uppercase tracking-wider text-black">
      <span className="text-4xl">S</span>AVE <span className="text-4xl">Y</span>
      OUR <span className="text-4xl">C</span>ODE
    </span>
  );
};

/**
 * Get step subtitle based on current state
 */
export const getStepSubtitle = (step: number, isReturningUser: boolean) => {
  if (isReturningUser) {
    return (
      <span>
        <span className="text-lg">E</span>NTER YOUR PASSWORD TO CONTINUE
      </span>
    );
  }

  if (step === 1) {
    return (
      <span>
        <span className="text-lg">C</span>REATE A SECURE MASTER PASSWORD TO PROTECT YOUR DATA
      </span>
    );
  }

  if (step === 2) {
    return (
      <span>
        <span className="text-lg">C</span>HOOSE YOUR NAME AND COLOR FOR TRACKING
      </span>
    );
  }

  return (
    <span>
      <span className="text-lg">S</span>AVE THIS CODE TO ACCESS YOUR BUDGET ON OTHER DEVICES
    </span>
  );
};
