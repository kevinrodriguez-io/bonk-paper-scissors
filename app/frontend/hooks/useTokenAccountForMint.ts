import { web3 } from "@project-serum/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { findTokenAccountForMintByOwnerPublicKeyFullData } from "../lib/solana/findTokenAccountForMint";

export const useTokenAccountForMint = (mint: string) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  return useSWR(
    ["tokenAccountForMint", wallet?.publicKey?.toBase58(), mint],
    async ([_, key, mint]) => {
      if (!key) throw new Error("No wallet connected");
      return findTokenAccountForMintByOwnerPublicKeyFullData(
        connection,
        new web3.PublicKey(key!),
        new web3.PublicKey(mint)
      );
    }
  );
};
