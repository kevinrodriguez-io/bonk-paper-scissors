import { Program, web3, AnchorProvider } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import useSWR from "swr";
import { getBPSProgramId } from "../constants/constants";
import { getBPSSettingsPDAV2 } from "../lib/solana/pdaHelpers";
import { IDL } from "../resources/idl/bonk_paper_scissors";

export const useBPSSettings = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  return useSWR(["bpsSettings"], ([_]) => {
    const program = new Program(
      IDL,
      getBPSProgramId(),
      // @ts-ignore
      new AnchorProvider(connection, wallet, {})
    );
    const [bpsSettingsPDA] = getBPSSettingsPDAV2(program.programId);
    return program.account.bpsSettingsV2.fetch(bpsSettingsPDA);
  });
};
