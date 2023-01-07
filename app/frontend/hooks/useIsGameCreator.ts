import { web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

export const useIsGameCreator = (creatorPubkey?: string) => {
  const wallet = useWallet();
  if (!creatorPubkey) return false;
  return wallet?.publicKey?.equals(new web3.PublicKey(creatorPubkey!));
};
