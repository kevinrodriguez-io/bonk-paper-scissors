import useSWRMutation from "swr/mutation";
import { web3, AnchorProvider, Program, BN } from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { getBPSProgramId, getBPSTreasuryPubKey, getMintPubKey } from "../constants/constants";
import { findTokenAccountPKForMintByOwner } from "../lib/solana/findTokenAccountForMint";
import { getHash, SaltResult } from "../lib/crypto/crypto";
import { Choice } from "../types/Choice";
import { getBPSSettingsPDA, getEscrowPDA, getGamePDA } from "../lib/solana/pdaHelpers";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorHookDependencies } from "../types/AnchorHookDependencies";

type SecondPlayerMovePayload = {
  gamePubKey: web3.PublicKey;
  choice: Choice;
  salt: SaltResult;
};

type SecondPlayerMove = {
  payload: SecondPlayerMovePayload;
  dependencies: AnchorHookDependencies;
};

const secondPlayerMove = async (
  key: string,
  secondPlayerMove: SecondPlayerMove
) => {
  const { connection, wallet } = secondPlayerMove.dependencies;
  const { salt, choice, gamePubKey } = secondPlayerMove.payload;

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, getBPSProgramId(), provider);

  const game = await program.account.game.fetch(gamePubKey);

  const mint = game.mint;
  const playerATA = await findTokenAccountPKForMintByOwner(
    provider.connection,
    provider.wallet.publicKey,
    mint
  );

  if (!playerATA) {
    throw new Error("No ATA found");
  }

  const hash = await getHash(salt, choice);

  const [playerEscrowPDA] = getEscrowPDA(
    "second",
    gamePubKey,
    program.programId
  );

  const [bpsSettingsPDA] = getBPSSettingsPDA(program.programId);
  const bpsTreasury = getBPSTreasuryPubKey();

  const txId = await program.methods
    .secondPlayerMove([...hash.hash])
    .accountsStrict({
      game: gamePubKey,
      secondPlayer: provider.wallet.publicKey,
      secondPlayerEscrow: playerEscrowPDA,
      secondPlayerTokenAccount: playerATA,
      mint: mint,
      bpsSettings: bpsSettingsPDA,
      bpsTreasury: bpsTreasury,
      systemProgram: web3.SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return {
    txId,
    gamePDA: gamePubKey,
    salt,
    choice,
    walletPubKey: wallet.publicKey,
  };
};

type SecondPlayerMoveHookInput = {
  onSuccess?: (data: Awaited<ReturnType<typeof secondPlayerMove>>) => void;
  onError?: (error: Error) => void;
};

export const useSecondPlayerMove = ({
  onSuccess,
  onError,
}: SecondPlayerMoveHookInput) => {
  const { trigger, ...options } = useSWRMutation(
    "secondPlayerMove",
    async (_key, { arg }: { arg: SecondPlayerMove }) =>
      secondPlayerMove(_key, arg),
    {
      onSuccess,
      onError,
    }
  );
  return {
    ...options,
    secondPlayerMove: trigger,
  };
};
