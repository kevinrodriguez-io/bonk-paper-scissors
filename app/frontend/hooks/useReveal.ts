import useSWRMutation from "swr/mutation";
import { web3, AnchorProvider, Program } from "@project-serum/anchor";
import { IDL } from "../resources/idl/bonk_paper_scissors";
import { getBPSProgramId } from "../constants/constants";
import { AnchorHookDependencies } from "../types/AnchorHookDependencies";
import { Choice } from "../types/Choice";
import { useWallet } from "@solana/wallet-adapter-react";

type RevealPayload = {
  gamePubKey: web3.PublicKey;
  choice: Choice;
  salt: number[];
};

type Reveal = {
  payload: RevealPayload;
  dependencies: AnchorHookDependencies;
};

const reveal = async (_key: [string, string | undefined], reveal: Reveal) => {
  const { connection, wallet } = reveal.dependencies;
  const { gamePubKey, choice, salt } = reveal.payload;

  const provider = new AnchorProvider(connection, wallet!, {});
  const program = new Program(IDL, getBPSProgramId(), provider);

  const game = await program.account.game.fetch(gamePubKey);

  if (!game.gameState.startedAndWaitingForReveal) {
    throw new Error("Game not started");
  }
  if (game.firstPlayerRevealedAt && game.secondPlayerRevealedAt) {
    throw new Error("Game already revealed");
  }

  console.log({
    choice,
    salt,
  })

  const txId = await program.methods
    .reveal({ [choice]: {} }, salt)
    .accountsStrict({
      game: gamePubKey,
      player: wallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .rpc();
  return txId;
};

type RevealHookInput = {
  onSuccess?: (data: Awaited<ReturnType<typeof reveal>>) => void;
  onError?: (error: Error) => void;
};

export const useReveal = ({
  onSuccess,
  onError,
}: RevealHookInput) => {
  const wallet = useWallet();
  const { trigger, ...options } = useSWRMutation(
    ["reveal", wallet?.publicKey?.toBase58()],
    async (_key, { arg }: { arg: Reveal }) => reveal(_key, arg),
    {
      onSuccess,
      onError,
    }
  );
  return {
    ...options,
    reveal: trigger,
  };
};
