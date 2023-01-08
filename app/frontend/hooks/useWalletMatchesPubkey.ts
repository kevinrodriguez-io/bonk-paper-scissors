import { web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";

export const useWalletMatchesPubkey = (pubkey?: string) => {
  const wallet = useWallet();
  if (!pubkey) return false;
  return wallet?.publicKey?.equals(new web3.PublicKey(pubkey!));
};
