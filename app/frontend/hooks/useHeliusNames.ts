import { web3 } from "@project-serum/anchor";
import useSWR from "swr/immutable";
import { getNames } from "../lib/helius/getName";

export const useHeliusNames = (address?: web3.PublicKey) =>
  useSWR(
    ["heliusNames", address?.toBase58()],
    async ([_, k]) => (k ? getNames(new web3.PublicKey(k)) : []),
    {
      revalidateOnFocus: false,
      revalidateOnMount: false,
      revalidateOnReconnect: false,
      refreshWhenOffline: false,
      refreshWhenHidden: false,
    }
  );
