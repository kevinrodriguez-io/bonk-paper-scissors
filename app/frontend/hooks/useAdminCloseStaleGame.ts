import useSWRMutation from "swr/mutation";
import { web3, AnchorProvider, Program } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { getBPSProgramId } from "../constants/constants";
import { findTokenAccountPubKeyForMintByOwnerPublicKey } from "../lib/solana/findTokenAccountForMint";
import { AnchorHookDependencies } from "../types/AnchorHookDependencies";

type AdminCloseStaleGamePayload = {
  gamePubKey: web3.PublicKey;
};

type AdminCloseStaleGame = {
  payload: AdminCloseStaleGamePayload;
  dependencies: AnchorHookDependencies;
};

const adminCloseStaleGame = async (
  key: string,
  adminCloseStaleGame: AdminCloseStaleGame
) => {
  const { connection, wallet } = adminCloseStaleGame.dependencies;
  const { gamePubKey } = adminCloseStaleGame.payload;

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, getBPSProgramId(), provider);

  if (
    !wallet.publicKey.equals(
      new web3.PublicKey("bpstzWLPDetyjiD33HPGGE96MzkhEA7dhRFzhc8Ay5R")
    )
  ) {
    throw new Error("Not authorized");
  }

  const game = await program.account.game.fetch(gamePubKey);

  if (!game.gameState.startedAndWaitingForReveal) {
    throw new Error("Game not started");
  }
  if (game.firstPlayerRevealedAt || game.secondPlayerRevealedAt) {
    throw new Error("Game already revealed");
  }

  const mint = game.mint;
  const firstPlayerATA = await findTokenAccountPubKeyForMintByOwnerPublicKey(
    provider.connection,
    game.firstPlayer,
    mint
  );

  if (!firstPlayerATA) {
    throw new Error("No ATA found");
  }

  const secondPlayerATA = await findTokenAccountPubKeyForMintByOwnerPublicKey(
    provider.connection,
    game.secondPlayer!,
    mint
  );

  const txId = await program.methods
    .adminUnwindStaleGame()
    .accountsStrict({
      game: gamePubKey,
      firstPlayer: game.firstPlayer,
      firstPlayerEscrow: game.firstPlayerEscrowAddress,
      firstPlayerTokenAccount: firstPlayerATA,
      secondPlayer: game.secondPlayer!,
      secondPlayerEscrow: game.secondPlayerEscrowAddress!,
      secondPlayerTokenAccount: secondPlayerATA!,
      signer: wallet.publicKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  return txId;
};

type AdminCloseStaleGameHookInput = {
  onSuccess?: (data: string) => void;
  onError?: (error: Error) => void;
};

export const useAdminCloseStaleGame = ({
  onSuccess,
  onError,
}: AdminCloseStaleGameHookInput) => {
  const { trigger, ...options } = useSWRMutation(
    "adminCloseStaleGame",
    async (_key, { arg }: { arg: AdminCloseStaleGame }) =>
      adminCloseStaleGame(_key, arg),
    {
      onSuccess,
      onError,
    }
  );
  return {
    ...options,
    adminCloseStaleGame: trigger,
  };
};
