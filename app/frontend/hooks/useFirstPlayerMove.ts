import useSWRMutation from "swr/mutation";
import { web3, AnchorProvider, Program, BN } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { getBPSProgramId, getMintPubKey } from "../constants/constants";
import { findTokenAccountForMintByOwnerPublicKey } from "../lib/solana/findTokenAccountForMint";
import { getHash, SaltResult } from "../lib/crypto/crypto";
import { Choice } from "../types/Choice";
import { getEscrowPDA, getGamePDA } from "../lib/solana/pdaHelpers";
import { AnchorWallet } from "@solana/wallet-adapter-react";

type AnchorDependencies = {
  connection: web3.Connection;
  wallet: AnchorWallet;
};

type FirstPlayerMovePayload = {
  amount: number;
  gameId: string;
  choice: Choice;
  salt: SaltResult;
};

type FirstPlayerMove = {
  payload: FirstPlayerMovePayload;
  dependencies: AnchorDependencies;
};

const firstPlayerMove = async (
  key: string,
  firstPlayerMove: FirstPlayerMove
) => {
  const { connection, wallet } = firstPlayerMove.dependencies;
  const { amount, gameId, salt, choice } = firstPlayerMove.payload;

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, getBPSProgramId(), provider);

  const mint = getMintPubKey();

  const playerATA = await findTokenAccountForMintByOwnerPublicKey(
    provider.connection,
    provider.wallet.publicKey,
    mint
  );

  if (!playerATA) {
    throw new Error("No ATA found");
  }

  const hash = await getHash(salt, choice);

  const [gamePDA] = getGamePDA(
    provider.wallet.publicKey,
    gameId,
    program.programId
  );

  const [playerEscrowPDA] = getEscrowPDA("first", gamePDA, program.programId);

  const txId = await program.methods
    .firstPlayerMove(gameId, new BN(amount), [...hash.hash])
    .accountsStrict({
      game: gamePDA,
      firstPlayer: provider.wallet.publicKey,
      firstPlayerEscrow: playerEscrowPDA,
      firstPlayerTokenAccount: playerATA,
      mint: mint,
      systemProgram: web3.SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return txId;
};

type FirstPlayerMoveHookInput = {
  onSuccess?: (data: string) => void;
  onError?: (error: Error) => void;
};

export const useFirstPlayerMove = ({
  onSuccess,
  onError,
}: FirstPlayerMoveHookInput) => {
  const { trigger, ...options } = useSWRMutation(
    "firstPlayerMove",
    async (_key, { arg }: { arg: FirstPlayerMove }) =>
      firstPlayerMove(_key, arg),
    {
      onSuccess,
      onError,
    }
  );
  return {
    ...options,
    firstPlayerMove: trigger,
  };
};
