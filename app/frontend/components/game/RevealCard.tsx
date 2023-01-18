import { ShieldCheckIcon } from "@heroicons/react/20/solid";
import { web3 } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import bs58 from "bs58";
import { useState } from "react";
import { toast } from "react-toastify";
import { useReadLocalStorage } from "usehooks-ts";
import { useReveal } from "../../hooks/useReveal";
import { useWalletMatchesPubkey } from "../../hooks/useWalletMatchesPubkey";
import { numberToChoice } from "../../lib/choice";
import { SaltResult } from "../../lib/crypto/crypto";
import { getChoiceKey, getSaltKey } from "../../lib/storage";
import { ChoiceLocalStorageResult } from "../../types/ChoiceLocalStorageResult";
import { GameAccount } from "../../types/GameAccount";
import { MessageLinkToast } from "../MessageLinkToast";

type RevealCardProps = {
  game: GameAccount;
  gamePubkey: string;
};

export const RevealCard = ({ game, gamePubkey }: RevealCardProps) => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const [gameSecret, setGameSecret] = useState("");
  const isFirstPlayer = useWalletMatchesPubkey(game.firstPlayer.toBase58());
  const isSecondPlayer = useWalletMatchesPubkey(game.secondPlayer?.toBase58()!);
  const choice = useReadLocalStorage<ChoiceLocalStorageResult>(
    getChoiceKey(gamePubkey, wallet?.publicKey?.toBase58()!)
  );
  const salt = useReadLocalStorage<SaltResult>(
    getSaltKey(gamePubkey, wallet?.publicKey?.toBase58()!)
  );
  const hasChoiceAndSaltFromLocalStorage = !!choice && !!salt;
  const reveal = useReveal({
    onSuccess: (txId) => {
      toast.success(() => (
        <MessageLinkToast
          title="Revealed!"
          url={`https://explorer.solana.com/tx/${txId}`}
          urlText="View on Solana Explorer"
        />
      ));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleReveal = () => {
    if (!hasChoiceAndSaltFromLocalStorage && gameSecret.length < 16) {
      toast.error("Please enter a game your game secret.");
      return;
    } else if (!hasChoiceAndSaltFromLocalStorage && gameSecret.length >= 16) {
      const bytes = [...bs58.decode(gameSecret)];
      const [choiceByte, ...saltBytes] = bytes;

      if (choiceByte <= 0 || choiceByte >= 4) {
        toast.error("Invalid game secret.");
        return;
      }
      if (saltBytes.length !== 32) {
        toast.error("Invalid game secret.");
        return;
      }

      const choice = numberToChoice(choiceByte);
      reveal.reveal({
        dependencies: {
          connection,
          wallet: wallet!,
        },
        payload: {
          gamePubKey: new web3.PublicKey(gamePubkey),
          choice: choice,
          salt: saltBytes,
        },
      });
    } else {
      reveal.reveal({
        dependencies: {
          connection,
          wallet: wallet!,
        },
        payload: {
          gamePubKey: new web3.PublicKey(gamePubkey),
          choice: choice!.choice,
          salt: [...salt!.randomBytes],
        },
      });
    }
  };

  const didPlayerAlreadyReveal =
    (isFirstPlayer && game.firstPlayerRevealedAt) ||
    (isSecondPlayer && game.secondPlayerRevealedAt);

  const opponentRevealed =
    (isFirstPlayer && game.secondPlayerRevealedAt) ||
    (isSecondPlayer && game.firstPlayerRevealedAt);

  return (
    <div className="space-y-6 mt-8">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Revealing your choice
            </h3>
            <p className="mt-1 text-sm text-gray-500 text-justify">
              Remember to always reveal your choice. If you don't, you will lose
              the game after 7 days.
            </p>
          </div>
          <div className="mt-5 space-y-6 md:col-span-1 md:mt-0">
            {!didPlayerAlreadyReveal ? (
              <>
                <p className="text-xs mb-2 text-gray-500 text-justify">
                  {hasChoiceAndSaltFromLocalStorage
                    ? "Your browser remembers your game secret, this is used to reveal your choice. Remember, if you switch your device or clear the browser history you might have to input your game secret manually before revealing your choice."
                    : "Oops, looks like this browser doesn't have your choice/salt stored. You can still reveal your choice by entering it manually."}
                </p>
                {!hasChoiceAndSaltFromLocalStorage ? (
                  <div>
                    <div className="relative rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <ShieldCheckIcon
                          className="h-5 w-5 text-green-400"
                          aria-hidden="true"
                        />
                      </div>
                      <input
                        type="text"
                        id="gameSecret"
                        name="gameSecret"
                        value={gameSecret}
                        onChange={(e) => setGameSecret(e.target.value)}
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Game secret"
                      />
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleReveal}
                  className="items-center disabled:bg-slate-400 disabled:cursor-not-allowed inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  disabled={
                    !hasChoiceAndSaltFromLocalStorage && gameSecret.length < 16
                  }
                >
                  <img src="/doggo.png" className="h-6 w-6 mr-2" />
                  Reveal
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="text-sm text-green-500">
                  You already revealed your choice
                </div>
                <img src="/doggo.png" className="h-6 w-6" />
              </div>
            )}
          </div>
          <div className="mt-5 space-y-6 md:col-span-1 md:mt-0">
            {opponentRevealed ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="text-sm text-green-500">
                  Your opponent already revealed their choice
                </div>
                <img src="/doggo.png" className="h-6 w-6" />
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <div className="text-sm text-red-500">
                  Your opponent hasn't revealed their choice yet
                </div>
                <img src="/doggo.png" className="h-6 w-6" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
