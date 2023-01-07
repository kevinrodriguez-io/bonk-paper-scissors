import { web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

export const useIsAdminWallet = () => {
  const wallet = useWallet();
  return wallet?.publicKey?.equals(
    new web3.PublicKey("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R")
  );
};
