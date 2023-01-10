import { AnchorProvider, Program } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { encode } from "bs58";
import useSWR from "swr";
import {
  GAME_ACCOUNT_OFFSET_FOR_GAME_STATE,
  GAME_ACCOUNT_SIZE,
  getBPSProgramId,
} from "../constants/constants";
import { decapitalize } from "../lib/string";
import { IDL } from "../resources/idl/bonk_paper_scissors";

export const GameStatus = {
  CreatedAndWaitingForStart: 0,
  StartedAndWaitingForReveal: 1,
  FirstPlayerWon: 2,
  SecondPlayerWon: 3,
  Draw: 4,
} as const;

export type GameStatusOption = keyof typeof GameStatus;

export const useGamesByStatuses = (options: GameStatusOption[]) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  return useSWR("games", async () => {
    const program = new Program(
      IDL,
      getBPSProgramId(),
      // @ts-ignore
      new AnchorProvider(connection, wallet, {})
    );
    return (
      await program.account.game.all([
        // TODO: SORRY THIS IS NOT WORKING YET :(
        // { dataSize: GAME_ACCOUNT_SIZE },
        // {
        //   // I feel so proud of myself, I always thought this was black magic
        //   // but now I understand it and can create my own memcmp filters.
        //   // TODO: Is still better to use an indexer service, so plan to move to GraphQL.
        //   memcmp: {
        //     offset: GAME_ACCOUNT_OFFSET_FOR_GAME_STATE,
        //     bytes: encode([value]),
        //   },
        // },
      ])
    ).filter((i) =>
      options
        .map((o) => decapitalize(o))
        .includes(Object.keys(i.account.gameState)[0])
    );
  });
};
