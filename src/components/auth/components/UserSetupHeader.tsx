import logoOnly from "../../../assets/icon-512x512.png";
import { getStepTitle, getStepSubtitle } from "../../../utils/auth/userSetupHelpers.tsx";

interface UserSetupHeaderProps {
  step: number;
  isReturningUser: boolean;
  userName: string;
  userColor: string;
}

/**
 * User Setup Header Component
 * Displays logo, title, and subtitle based on current step and user state
 * Extracted from UserSetup with UI standards compliance
 */
const UserSetupHeader = ({ step, isReturningUser, userName, userColor }: UserSetupHeaderProps) => {
  return (
    <div className="text-center mb-8">
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full border-2 border-black p-3">
          <img src={logoOnly} alt="VioletVault Logo" className="w-full h-full object-contain" />
        </div>
      </div>

      <h1 className="text-3xl font-black mb-2">
        {isReturningUser ? (
          <span className="uppercase tracking-wider text-black">
            <span className="text-4xl">W</span>ELCOME <span className="text-4xl">B</span>ACK,{" "}
            <span
              className="inline-flex items-center text-4xl font-black"
              style={{
                color: userColor,
                textShadow:
                  "2px 2px 0px black, -2px -2px 0px black, 2px -2px 0px black, -2px 2px 0px black, 0px 2px 0px black, 2px 0px 0px black, 0px -2px 0px black, -2px 0px 0px black",
              }}
            >
              {userName.toUpperCase()}
            </span>
            !
          </span>
        ) : (
          getStepTitle(step, isReturningUser, userName)
        )}
      </h1>

      <p className="text-purple-900 font-medium uppercase tracking-wider">
        {getStepSubtitle(step, isReturningUser)}
      </p>
    </div>
  );
};

export default UserSetupHeader;
