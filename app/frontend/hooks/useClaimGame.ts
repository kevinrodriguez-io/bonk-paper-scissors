import useSWRMutation from "swr/mutation";
import { web3, AnchorProvider, Program } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { getBPSProgramId } from "../constants/constants";
import { findTokenAccountPKForMintByOwner } from "../lib/solana/findTokenAccountForMint";
import { AnchorHookDependencies } from "../types/AnchorHookDependencies";
import { getBPSSettingsPDAV2, getEscrowPDA } from "../lib/solana/pdaHelpers";

type ClaimGamePayload = {
  gamePubKey: web3.PublicKey;
};

type ClaimGame = {
  payload: ClaimGamePayload;
  dependencies: AnchorHookDependencies;
};

const claimGame = async (key: string, claimGame: ClaimGame) => {
  const { connection, wallet } = claimGame.dependencies;
  const { gamePubKey } = claimGame.payload;

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, getBPSProgramId(), provider);

  const game = await program.account.game.fetch(gamePubKey);

  if (
    !game.firstPlayerChoice &&
    !game.secondPlayerChoice &&
    !game.gameState.startedAndWaitingForReveal
  ) {
    throw new Error("Game not in valid state for claiming");
  }

  const mint = game.mint;
  const firstPlayerATA = await findTokenAccountPKForMintByOwner(
    provider.connection,
    game.firstPlayer,
    mint
  );

  if (!firstPlayerATA) {
    throw new Error("No ATA found for first player");
  }

  const secondPlayerATA = await findTokenAccountPKForMintByOwner(
    provider.connection,
    game.secondPlayer!,
    mint
  );

  if (!secondPlayerATA) {
    throw new Error("No ATA found for second player");
  }

  const [firstPlayerEscrowPDA] = getEscrowPDA(
    "first",
    gamePubKey,
    program.programId
  );

  const [secondPlayerEscrowPDA] = getEscrowPDA(
    "second",
    gamePubKey,
    program.programId
  );

  const [bpsSettingsPDA] = getBPSSettingsPDAV2(program.programId);

  const txId = await program.methods
    .claim()
    .accountsStrict({
      bpsSettingsV2: bpsSettingsPDA,
      game: gamePubKey,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      firstPlayer: game.firstPlayer,
      secondPlayer: game.secondPlayer!,
      firstPlayerTokenAccount: firstPlayerATA,
      secondPlayerTokenAccount: secondPlayerATA,
      firstPlayerEscrow: firstPlayerEscrowPDA,
      secondPlayerEscrow: secondPlayerEscrowPDA,
      mint: game.mint,
      payer: wallet.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  return txId;
};

type ClaimGameHookInput = {
  onSuccess?: (data: Awaited<ReturnType<typeof claimGame>>) => void;
  onError?: (error: Error) => void;
};

export const useClaimGame = ({ onSuccess, onError }: ClaimGameHookInput) => {
  const { trigger, ...options } = useSWRMutation(
    "claimGame",
    async (_key, { arg }: { arg: ClaimGame }) => claimGame(_key, arg),
    {
      onSuccess,
      onError,
    }
  );
  return {
    ...options,
    claimGame: trigger,
  };
};
