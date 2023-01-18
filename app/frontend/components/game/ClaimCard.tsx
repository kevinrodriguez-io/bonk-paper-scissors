import { web3 } from "@project-serum/anchor";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { isDraw } from "../../lib/game";
import { useClaimGame } from "../../hooks/useClaimGame";
import {
  useWalletIsGameLoserButHasntClaimed,
  useWalletIsGameWinnerButHasntClaimed,
} from "../../hooks/useIsGameWinner";
import { GameAccount } from "../../types/GameAccount";
import { SuccessModal } from "../SuccessModal";
import { MessageLinkToast } from "../MessageLinkToast";

type ClaimCardProps = {
  game: GameAccount;
  gamePubkey: string;
};

export const ClaimCard = ({ game, gamePubkey }: ClaimCardProps) => {
  const isWinnerButGameHasntClaimed =
    useWalletIsGameWinnerButHasntClaimed(game);
  const isLoserButGameHasntBeenClaimed =
    useWalletIsGameLoserButHasntClaimed(game);

  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [showModal, setShowModal] = useState(false);
  const claimGame = useClaimGame({
    onSuccess: (txId) => {
      toast.success(() => (
        <MessageLinkToast
          title="Claimed!"
          url={`https://explorer.solana.com/tx/${txId}`}
          urlText="View on Solana Explorer"
        />
      ));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  useEffect(() => {
    if (game.winner?.equals(anchorWallet?.publicKey!)) {
    }
  }, [game.winner]);

  const handleClaim = () => {
    claimGame.claimGame({
      dependencies: {
        connection: connection,
        wallet: anchorWallet!,
      },
      payload: {
        gamePubKey: new web3.PublicKey(gamePubkey),
      },
    });
  };

  const isGameClaimed = !!game.winner;

  const gameIsDraw = isDraw(game);

  return (
    <>
      {!isGameClaimed ? (
        <SuccessModal
          setOpen={setShowModal}
          open={showModal}
          message="The pot has been claimed! If you're the winner, then check your wallet for the winnings."
          title="Claimed!"
          buttonTitle="Close"
          onButtonClick={() => {
            setShowModal(false);
          }}
        />
      ) : null}
      <div className="space-y-6 mt-8">
        <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Claiming a game prize
              </h3>
              <p className="mt-1 text-sm text-gray-500 text-justify">
                By claiming a game prize, the winner will receive the prize and
                the loser will lose their stake, also burning a 10% fee.
              </p>
            </div>
            <div className="mt-5 space-y-6 md:col-span-1 md:mt-0">
              {!gameIsDraw && isWinnerButGameHasntClaimed ? (
                <div className="mt-5 space-y-6 md:col-span-1 md:mt-0 text-green-800 text-justify">
                  Looks like you won this game! Claim your prize by clicking the
                  claim button.
                </div>
              ) : null}
              {!gameIsDraw && isLoserButGameHasntBeenClaimed ? (
                <div className="mt-5 space-y-6 md:col-span-1 md:mt-0 text-gray-800 text-justify">
                  Sorry, but it looks like you lost this game!
                </div>
              ) : null}
              {gameIsDraw ? (
                <div className="mt-5 space-y-6 md:col-span-1 md:mt-0 text-gray-800 text-justify">
                  This game is a draw, so no one wins or loses.
                </div>
              ) : null}
            </div>
            <div className="mt-5 space-y-6 md:col-span-1 md:mt-0">
              <button
                type="button"
                onClick={handleClaim}
                disabled={claimGame.isMutating}
                className="items-center inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <img src="/doggo.png" className="h-6 w-6 mr-2" />
                Settle pot
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
