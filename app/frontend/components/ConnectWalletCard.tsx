export const ConnectWalletCard = () => {
  return (
    <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 space-y-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Wallet not connected
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Please connect your wallet to interact with the protocol.
          </p>
        </div>
      </div>
    </div>
  );
};
