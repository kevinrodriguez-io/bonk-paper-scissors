import { Program, web3, AnchorProvider } from "@project-serum/anchor";
import { EventEmitter } from "@solana/wallet-adapter-base";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect } from "react";
import { getBPSProgramId } from "../constants/constants";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { GameAccount } from "../types/GameAccount";

export const useGameChangesListener = (
  gamePubKey: web3.PublicKey,
  onChange: (data: GameAccount) => void
) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  useEffect(() => {
    const program = new Program(
      IDL,
      getBPSProgramId(),
      // @ts-ignore
      new AnchorProvider(connection, wallet, {})
    );

    let emitter: EventEmitter<string | symbol, any> | null = null;
    let listenerFn: ((...args: any[]) => void) | null = null;

    (async () => {
      emitter = program.account.game.subscribe(gamePubKey);
      listenerFn = (data: GameAccount) => {
        onChange(data);
      };
      emitter.on("change", listenerFn);
    })();

    return () => {
      emitter?.off("change");
    };
  }, [onChange]);
};
