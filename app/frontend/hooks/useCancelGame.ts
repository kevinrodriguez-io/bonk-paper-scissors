import useSWRMutation from "swr/mutation";
import { web3, AnchorProvider, Program } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { getBPSProgramId } from "../constants/constants";
import { findTokenAccountPKForMintByOwner } from "../lib/solana/findTokenAccountForMint";
import { AnchorHookDependencies } from "../types/AnchorHookDependencies";

type CancelGamePayload = {
  gamePubKey: web3.PublicKey;
};

type CancelGame = {
  payload: CancelGamePayload;
  dependencies: AnchorHookDependencies;
};

const cancelGame = async (key: string, cancelGame: CancelGame) => {
  const { connection, wallet } = cancelGame.dependencies;
  const { gamePubKey } = cancelGame.payload;

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, getBPSProgramId(), provider);

  const game = await program.account.game.fetch(gamePubKey);

  if (!wallet.publicKey.equals(game.firstPlayer)) {
    throw new Error("Not authorized");
  }

  if (!game.gameState.createdAndWaitingForStart) {
    throw new Error("Game already started");
  }

  const mint = game.mint;
  const firstPlayerATA = await findTokenAccountPKForMintByOwner(
    provider.connection,
    game.firstPlayer,
    mint
  );

  if (!firstPlayerATA) {
    throw new Error("No ATA found");
  }

  const txId = await program.methods
    .cancelGame()
    .accountsStrict({
      game: gamePubKey,
      firstPlayer: game.firstPlayer,
      firstPlayerEscrow: game.firstPlayerEscrowAddress,
      firstPlayerTokenAccount: firstPlayerATA,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  return txId;
};

type CancelGameHookInput = {
  onSuccess?: (data: string) => void;
  onError?: (error: Error) => void;
};

export const useCancelGame = ({ onSuccess, onError }: CancelGameHookInput) => {
  const { trigger, ...options } = useSWRMutation(
    "cancelGame",
    async (_key, { arg }: { arg: CancelGame }) => cancelGame(_key, arg),
    {
      onSuccess,
      onError,
    }
  );
  return {
    ...options,
    cancelGame: trigger,
  };
};
