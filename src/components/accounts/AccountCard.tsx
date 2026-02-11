import AccountCardHeader from "./shared/AccountCardHeader";
import AccountCardDetails from "./shared/AccountCardDetails";

interface AccountTypeInfo {
  value: string;
  label: string;
  icon: string;
}

interface ExpirationStatus {
  text: string;
  color: string;
}

interface Account {
  id: string | number;
  name: string;
  type: string;
  currentBalance: number;
  annualContribution: number;
  expirationDate: string | null;
  description: string | null;
  color: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  lastUpdated: string;
  transactions: unknown[];
}

interface AccountCardProps {
  account: Account;
  typeInfo: AccountTypeInfo;
  expirationStatus: ExpirationStatus;
  showBalances: boolean;
  onEdit: (account: Account) => void;
  onDelete: (accountId: string | number) => void;
  onStartTransfer: (account: Account) => void;
}

const AccountCard = ({
  account,
  typeInfo,
  expirationStatus,
  showBalances,
  onEdit,
  onDelete,
  onStartTransfer,
}: AccountCardProps) => {
  return (
    <div className="bg-white/80 backdrop-blur-lg rounded-lg p-4 border border-white/20 hover:bg-white/90 transition-all">
      <AccountCardHeader
        account={account}
        typeInfo={typeInfo}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <AccountCardDetails
        account={account}
        expirationStatus={expirationStatus}
        showBalances={showBalances}
        onStartTransfer={onStartTransfer}
      />
    </div>
  );
};

export default AccountCard;
