import { zodResolver } from "@hookform/resolvers/zod";
import { web3 } from "@project-serum/anchor";
import {
  useAnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

import type { ChoiceLocalStorageResult } from "../../types/ChoiceLocalStorageResult";
import { ConnectWalletCard } from "../../components/ConnectWalletCard";
import { GameCard } from "../../components/GameCard";
import { Layout } from "../../components/Layout";
import { LoadingCard } from "../../components/LoadingCard";
import { NotFoundCard } from "../../components/NotFoundCard";
import { Spinner } from "../../components/Spinner";
import { useAdminCloseStaleGame } from "../../hooks/useAdminCloseStaleGame";
import { useCancelGame } from "../../hooks/useCancelGame";
import { useGame } from "../../hooks/useGame";
import { useGameChangesListener } from "../../hooks/useGameSubscription";
import { useIsAdminWallet } from "../../hooks/useIsAdminWallet";
import { useWalletMatchesPubkey } from "../../hooks/useWalletMatchesPubkey";
import { useSecondPlayerMove } from "../../hooks/useSecondPlayerMove";
import { getSalt, SaltResult } from "../../lib/crypto/crypto";
import { getValueFromEnumVariant } from "../../lib/solana/getValueFromEnumVariant";
import { getChoiceKey, getSaltKey } from "../../lib/storage";
import { capitalize, splitLowerCaseItemIntoWords } from "../../lib/string";
import { CanBeLoading } from "../../types/CanBeLoading";
import { Choice } from "../../types/Choice";
import { useReadLocalStorage } from "usehooks-ts";
import { GameAccount } from "../../types/GameAccount";
import { useReveal } from "../../hooks/useReveal";
import {
  useWalletIsGameLoserButHasntClaimed,
  useWalletIsGameWinner,
  useWalletIsGameWinnerButHasntClaimed,
} from "../../hooks/useIsGameWinner";
import { useClaimGame } from "../../hooks/useClaimGame";
import { SuccessModal } from "../../components/SuccessModal";

type ClaimCardProps = {
  game: GameAccount;
  gamePubkey: string;
};

const ClaimCard = ({ game, gamePubkey }: ClaimCardProps) => {
  const isWinnerButGameHasntClaimed =
    useWalletIsGameWinnerButHasntClaimed(game);
  const isLoserButGameHasntBeenClaimed =
    useWalletIsGameLoserButHasntClaimed(game);
  const wallet = useWallet();
  const anchorWallet = useAnchorWallet();
  const { connection } = useConnection();
  const [showModal, setShowModal] = useState(false);
  const claimGame = useClaimGame({
    onSuccess: (txId) => {
      toast.success(() => {
        const url = `https://explorer.solana.com/tx/${txId}`;
        return (
          <div className="flex items-center space-x-2">
            <div>Claimed!</div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 underline"
            >
              View on Solana Explorer
            </a>
          </div>
        );
      });
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
              {isWinnerButGameHasntClaimed ? (
                <div className="mt-5 space-y-6 md:col-span-1 md:mt-0 text-green-800 text-justify">
                  Looks like you won this game! Claim your prize by clicking the
                  claim button.
                </div>
              ) : null}
              {isLoserButGameHasntBeenClaimed ? (
                <div className="mt-5 space-y-6 md:col-span-1 md:mt-0 text-gray-800 text-justify">
                  Sorry, but it looks like you lost this game!
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

const RevealCard = ({
  game,
  gamePubkey,
}: {
  game: GameAccount;
  gamePubkey: string;
}) => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const isFirstPlayer = useWalletMatchesPubkey(game.firstPlayer.toBase58());
  const isSecondPlayer = useWalletMatchesPubkey(game.secondPlayer?.toBase58()!);
  const choice = useReadLocalStorage<ChoiceLocalStorageResult>(
    getChoiceKey(gamePubkey, wallet?.publicKey?.toBase58()!)
  );
  const salt = useReadLocalStorage<SaltResult>(
    getSaltKey(gamePubkey, wallet?.publicKey?.toBase58()!)
  );
  const reveal = useReveal({
    onSuccess: (txId) => {
      toast.success(() => {
        const url = `https://explorer.solana.com/tx/${txId}`;
        return (
          <div className="flex items-center space-x-2">
            <div>Revealed!</div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 underline"
            >
              View on Solana Explorer
            </a>
          </div>
        );
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleReveal = () => {
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
  };

  const didPlayerAlreadyReveal =
    (isFirstPlayer && game.firstPlayerRevealedAt) ||
    (isSecondPlayer && game.secondPlayerRevealedAt);

  const opponentRevealed =
    (isFirstPlayer && game.secondPlayerRevealedAt) ||
    (isSecondPlayer && game.firstPlayerRevealedAt);

  const canReveal = !didPlayerAlreadyReveal && !!choice && !!salt;

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
              <button
                type="button"
                onClick={handleReveal}
                className="items-center inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <img src="/doggo.png" className="h-6 w-6 mr-2" />
                Reveal
              </button>
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

type JoinCardProps = CanBeLoading & {
  onSuccess?: (salt: SaltResult, choice: Choice) => void;
  onCancel?: () => void;
};

const joinSchema = z.object({
  choice: z
    .string({
      required_error: "You must select a choice",
      invalid_type_error: "You must select a choice",
    })
    .refine(
      (choice) => {
        return ["bonk", "paper", "scissors"].includes(choice);
      },
      {
        message: "Invalid choice",
      }
    ),
});

const JoinCard = ({ onSuccess, onCancel, isLoading }: JoinCardProps) => {
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(joinSchema) });
  useEffect(() => {
    const { bytesBs58, randomBytes } = getSalt();
    setSalt({ bytesBs58, randomBytes });
  }, []);
  // const [saltVisible, setSaltVisible] = useState(false);
  return (
    <form
      className="space-y-6 mt-8"
      onSubmit={handleSubmit(({ choice }) => {
        onSuccess?.(salt!, choice as Choice);
      })}
    >
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Joining a game
            </h3>
            <p className="mt-1 text-sm text-gray-500 text-justify">
              By joining a game you have to provide your choice, which will be
              private until both players reveal. Once revealed, the winner will
              be determined by the bonk, paper, scissors rules.
            </p>
            <p className="mt-1 text-gray-500 text-sm text-justify">
              The winner wins a total of the 90% of the pot (both it's deposit
              and the adversary deposit), while the other 10% is burned 🔥.
            </p>
            <p className="mt-1 text-sm text-red-900 text-justify">
              Once joined, you can't cancel your participation, so make sure you
              are ready to reveal your choice.
            </p>
            <p className="mt-1 text-sm text-red-900 text-justify">
              A player who makes a choice and refuses to reveal is penalized as
              forfeit after 7 days, making the other player the winner, so
              remember to always reveal when prompted.
            </p>
            <p className="mt-1 text-sm text-gray-500 text-justify">
              Don't worry, the game is designed so that you can't lose your
              deposit due to somebody else looking at your choice, that's why we
              use your browser to generate security <b>bytes</b> to hide it
              until both players reveal; this is what we call a salt. Remember
              that you can't win if you never reveal your choice.
            </p>
          </div>

          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <fieldset>
              <legend className="contents text-sm font-medium text-gray-700">
                Your secret choice
              </legend>
              <div className="mt-4 space-y-4 flex">
                <div className="flex items-center relative">
                  <input
                    id="bonk"
                    type="radio"
                    className="hidden peer"
                    value="bonk"
                    {...register("choice")}
                  />
                  <label
                    htmlFor="bonk"
                    className="text-center text-black peer-checked:text-white block cursor-pointer rounded-lg peer-checked:bg-primary-600 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500"
                  >
                    <img src="/bat.png" className="h-48 w-48" />
                    Bonk
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="paper"
                    type="radio"
                    className="hidden peer"
                    value="paper"
                    {...register("choice")}
                  />
                  <label
                    htmlFor="paper"
                    className="text-center text-black peer-checked:text-white block cursor-pointer rounded-lg peer-checked:bg-primary-600 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500"
                  >
                    <img src="/paper.png" className="h-48 w-48" />
                    Paper
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="scissors"
                    type="radio"
                    className="hidden peer"
                    value="scissors"
                    {...register("choice")}
                  />
                  <label
                    htmlFor="scissors"
                    className="text-center text-black peer-checked:text-white block cursor-pointer rounded-lg peer-checked:bg-primary-600 peer-checked:border-transparent peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary-500"
                  >
                    <img src="/scissors.png" className="h-48 w-48" />
                    Scissors
                  </label>
                </div>
              </div>
            </fieldset>
            {errors.choice && (
              <div className="mt-2 text-sm text-red-600">
                {errors.choice?.message as string}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="reset"
          onClick={() => onCancel?.()}
          disabled={isLoading}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isLoading ? <Spinner /> : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isLoading ? <Spinner /> : "Join Game"}
        </button>
      </div>
    </form>
  );
};

type GameContentsProps = {
  gamePubkey: string;
};

const GameContents = ({ gamePubkey }: GameContentsProps) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const { data, error, isLoading, mutate } = useGame(
    new web3.PublicKey(gamePubkey)
  );
  const { publicKey } = useWallet();
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [fireSecondPlayerMove, setFireSecondPlayerMove] = useState(0);
  const adminCloseStaleGame = useAdminCloseStaleGame({
    onSuccess: (txId) => {
      toast.success(() => {
        const url = `https://explorer.solana.com/tx/${txId}`;
        return (
          <div className="flex items-center space-x-2">
            <div>Game closed!</div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 underline"
            >
              View on Solana Explorer
            </a>
          </div>
        );
      });
    },
    onError: (err) => toast.error(err.message),
  });
  const cancelGame = useCancelGame({
    onSuccess: (txId) => {
      toast.success(() => {
        const url = `https://explorer.solana.com/tx/${txId}`;
        return (
          <div className="flex items-center space-x-2">
            <div>Game cancelled!</div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-200 underline"
            >
              View on Solana Explorer
            </a>
          </div>
        );
      });
    },
    onError: (err) => toast.error(err.message),
  });
  const isAdminWallet = useIsAdminWallet();
  const isGameFirstPlayer = useWalletMatchesPubkey(
    data?.firstPlayer.toBase58()
  );
  const isGameSecondPlayer = useWalletMatchesPubkey(
    data?.secondPlayer?.toBase58()
  );

  const secondPlayerMove = useSecondPlayerMove({
    onSuccess: ({ txId, salt, gamePDA, choice, walletPubKey }) => {
      toast.success(
        () => {
          const url = `https://explorer.solana.com/tx/${txId}`;
          return (
            <div className="flex items-center space-x-2">
              <div>Joined game!</div>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-200 underline"
              >
                View on Solana Explorer
              </a>
            </div>
          );
        },
        { autoClose: false }
      );
      localStorage.setItem(
        getChoiceKey(gamePDA.toBase58(), walletPubKey.toBase58()),
        JSON.stringify({ choice: choice! })
      );
      localStorage.setItem(
        getSaltKey(gamePDA.toBase58(), walletPubKey.toBase58()),
        JSON.stringify({
          bytesBs58: salt!.bytesBs58,
          randomBytes: [...salt!.randomBytes],
        })
      );
    },
    onError: (err) => toast.error(err.message, { autoClose: false }),
  });

  useGameChangesListener(new web3.PublicKey(gamePubkey), (acc) => {
    mutate(acc);
    toast("The game was updated!");
  });

  useEffect(() => {
    if (fireSecondPlayerMove === 0) return;
    if (!wallet) return;
    if (!salt) return;
    if (!choice) return;
    (async () => {
      toast(() => {
        return (
          <div className="flex items-center space-x-2">
            <Spinner />
            <div>Joining game...</div>
          </div>
        );
      });
      secondPlayerMove.secondPlayerMove({
        dependencies: { wallet, connection },
        payload: {
          choice,
          salt,
          gamePubKey: new web3.PublicKey(gamePubkey),
        },
      });
    })();
  }, [fireSecondPlayerMove]);

  const resetAll = () => {
    setSalt(null);
    setChoice(null);
  };

  const handleOnJoinCardSuccess = (salt: SaltResult, choice: Choice) => {
    setSalt(salt);
    setChoice(choice);
    setFireSecondPlayerMove((v) => v + 1);
  };

  const handleOnJoinCardCancel = () => {
    resetAll();
  };

  if (isLoading) {
    return <LoadingCard message="Loading game" />;
  }

  if (error || !data) {
    console.log({ error });
    return <NotFoundCard />;
  }

  const gameIsJoinable =
    publicKey && !isGameFirstPlayer && data.gameState.createdAndWaitingForStart;

  const stuffIsLoading = secondPlayerMove.isMutating || isLoading;

  const isAdminClosable =
    isAdminWallet && data.gameState.startedAndWaitingForReveal;

  const isCancellable =
    isGameFirstPlayer && data.gameState.createdAndWaitingForStart;

  const isRevealable =
    data.gameState.startedAndWaitingForReveal &&
    data.firstPlayerHash &&
    data.secondPlayerHash &&
    // !data.firstPlayerChoice &&
    // !data.secondPlayerChoice &&
    (isGameFirstPlayer || isGameSecondPlayer);

  const isClaimable =
    data.firstPlayerChoice &&
    data.secondPlayerChoice &&
    !data.gameState.draw &&
    !data.gameState.firstPlayerWon &&
    !data.gameState.secondPlayerWon;

  return (
    <>
      <GameCard
        className="shadow"
        pubKey={new web3.PublicKey(gamePubkey)}
        winner={data.winner ?? undefined}
        firstPlayerChoice={
          data.firstPlayerChoice
            ? capitalize(
                splitLowerCaseItemIntoWords(
                  getValueFromEnumVariant(data.firstPlayerChoice)
                )
              )
            : undefined
        }
        secondPlayerChoice={
          data.secondPlayerChoice
            ? capitalize(
                splitLowerCaseItemIntoWords(
                  getValueFromEnumVariant(data.secondPlayerChoice)
                )
              )
            : undefined
        }
        gameId={data.gameId}
        createdAt={data.createdAt}
        firstPlayer={data.firstPlayer}
        mint={data.mint}
        amountToMatch={data.amountToMatch}
        secondPlayer={data.secondPlayer ?? undefined}
        status={capitalize(
          splitLowerCaseItemIntoWords(getValueFromEnumVariant(data.gameState))
        )}
      />
      {gameIsJoinable ? (
        <JoinCard
          onSuccess={handleOnJoinCardSuccess}
          onCancel={handleOnJoinCardCancel}
          isLoading={stuffIsLoading}
        />
      ) : null}
      {isAdminClosable ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              adminCloseStaleGame.adminCloseStaleGame({
                dependencies: { wallet: wallet!, connection },
                payload: {
                  gamePubKey: new web3.PublicKey(gamePubkey),
                },
              });
              mutate();
            }}
            className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {adminCloseStaleGame.isMutating ? <Spinner /> : "Close Game"}
          </button>
        </div>
      ) : null}
      {isCancellable ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => {
              cancelGame.cancelGame({
                dependencies: { wallet: wallet!, connection },
                payload: {
                  gamePubKey: new web3.PublicKey(gamePubkey),
                },
              });
              mutate();
            }}
            className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {cancelGame.isMutating ? <Spinner /> : "Cancel Game"}
          </button>
        </div>
      ) : null}
      {isRevealable ? <RevealCard game={data} gamePubkey={gamePubkey} /> : null}
      {isClaimable ? <ClaimCard game={data} gamePubkey={gamePubkey} /> : null}
    </>
  );
};

const Game: NextPage = () => {
  const wallet = useAnchorWallet();
  const { query, isReady } = useRouter();
  const { gamePubkey } = query;
  return (
    <>
      <Head>
        <title>BPS App - Create Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout title="Game">
        <div className="py-4">
          {!wallet ? (
            <ConnectWalletCard />
          ) : isReady && gamePubkey ? (
            <GameContents gamePubkey={gamePubkey as string} />
          ) : (
            <LoadingCard message="Loading game" />
          )}
        </div>
      </Layout>
    </>
  );
};

export default Game;
