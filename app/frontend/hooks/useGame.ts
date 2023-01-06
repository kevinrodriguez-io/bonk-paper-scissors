import { Program, web3, AnchorProvider } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { getBPSProgramId } from "../constants/constants";
import { IDL } from "../resources/idl/bonk_paper_scissors";

export const useGame = (gamePubKey: web3.PublicKey) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  return useSWR(["game", gamePubKey.toBase58()], ([_, key]) => {
    const program = new Program(
      IDL,
      getBPSProgramId(),
      // @ts-ignore
      new AnchorProvider(connection, wallet, {})
    );
    return program.account.game.fetch(key);
  });
};
