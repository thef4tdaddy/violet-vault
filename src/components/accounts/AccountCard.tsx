import AccountCardHeader from "./shared/AccountCardHeader";
import AccountCardDetails from "./shared/AccountCardDetails";

const AccountCard = ({
  account,
  typeInfo,
  expirationStatus,
  showBalances,
  onEdit,
  onDelete,
  onStartTransfer,
}) => {
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
