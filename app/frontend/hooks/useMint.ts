import { web3 } from "@project-serum/anchor";
import { getMint } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import useSWR from "swr";

export const useMintDetails = (mint: string) => {
  const { connection } = useConnection();
  return useSWR(["mint", mint], ([_, mint]) =>
    getMint(connection, new web3.PublicKey(mint))
  );
};
