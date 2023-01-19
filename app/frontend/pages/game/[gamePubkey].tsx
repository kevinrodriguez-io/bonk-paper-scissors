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
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

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
import { getGameSecret, getSalt, SaltResult } from "../../lib/crypto/crypto";
import { getValueFromEnumVariant } from "../../lib/solana/getValueFromEnumVariant";
import { capitalize, splitLowerCaseItemIntoWords } from "../../lib/string";
import { CanBeLoading } from "../../types/CanBeLoading";
import { Choice } from "../../types/Choice";
import { ClaimCard } from "../../components/game/ClaimCard";
import { EnvelopeIcon, ShieldCheckIcon } from "@heroicons/react/20/solid";
import { useBPSSettings } from "../../hooks/useBPSSettings";
import { gameForfeitCondition } from "../../lib/game";
import { RevealCard } from "../../components/game/RevealCard";
import { JoinCard } from "../../components/game/JoinCard";
import { MessageLinkToast } from "../../components/MessageLinkToast";
import { SpinnerToast } from "../../components/SpinnerToast";

type GameContentsProps = {
  gamePubkey: string;
};

const GameContents = ({ gamePubkey }: GameContentsProps) => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const game = useGame(new web3.PublicKey(gamePubkey));
  const bpsSettings = useBPSSettings();
  const { publicKey } = useWallet();
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [revealCardKey, setRevealCardKey] = useState(0);
  const [fireSecondPlayerMove, setFireSecondPlayerMove] = useState(0);
  const adminCloseStaleGame = useAdminCloseStaleGame({
    onSuccess: (txId) => {
      toast.success(() => (
        <MessageLinkToast
          url={`https://explorer.solana.com/tx/${txId}`}
          title="Game closed!"
          urlText="View on Solana Explorer"
        />
      ));
    },
    onError: (err) => toast.error(err.message),
  });
  const cancelGame = useCancelGame({
    onSuccess: (txId) => {
      toast.success(() => (
        <MessageLinkToast
          url={`https://explorer.solana.com/tx/${txId}`}
          title="Game cancelled!"
          urlText="View on Solana Explorer"
        />
      ));
    },
    onError: (err) => toast.error(err.message),
  });
  const isAdminWallet = useIsAdminWallet();
  const isGameFirstPlayer = useWalletMatchesPubkey(
    game.data?.firstPlayer.toBase58()
  );
  const isGameSecondPlayer = useWalletMatchesPubkey(
    game.data?.secondPlayer?.toBase58()
  );
  const secondPlayerMove = useSecondPlayerMove({
    onSuccess: ({ txId }) => {
      toast.success(
        () => (
          <MessageLinkToast
            url={`https://explorer.solana.com/tx/${txId}`}
            title="Joined Game!"
            urlText="View on Solana Explorer"
          />
        ),
        { autoClose: false }
      );
    },
    onError: (err) => toast.error(err.message, { autoClose: false }),
  });

  useGameChangesListener(new web3.PublicKey(gamePubkey), (acc) => {
    game.mutate(acc);
    toast("The game was updated!");
  });

  useEffect(() => {
    if (fireSecondPlayerMove === 0) return;
    if (!wallet) return;
    if (!salt) return;
    if (!choice) return;
    (async () => {
      toast(() => {
        return <SpinnerToast>Joining game...</SpinnerToast>;
      });
      await secondPlayerMove.secondPlayerMove({
        dependencies: { wallet, connection },
        payload: {
          choice,
          salt,
          gamePubKey: new web3.PublicKey(gamePubkey),
        },
      });
      setRevealCardKey((v) => v + 1);
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

  const handleAdminCloseStaleGame = async () => {
    await adminCloseStaleGame.adminCloseStaleGame({
      dependencies: { wallet: wallet!, connection },
      payload: {
        gamePubKey: new web3.PublicKey(gamePubkey),
      },
    });
    game.mutate();
  };

  const handleCancelGame = async () => {
    await cancelGame.cancelGame({
      dependencies: { wallet: wallet!, connection },
      payload: {
        gamePubKey: new web3.PublicKey(gamePubkey),
      },
    });
    game.mutate();
  };

  const gameIsJoinable =
    publicKey &&
    !isGameFirstPlayer &&
    game.data?.gameState.createdAndWaitingForStart;

  const stuffIsLoading =
    secondPlayerMove.isMutating || bpsSettings.isLoading || game.isLoading;

  const isAdminClosable =
    isAdminWallet && game.data?.gameState.startedAndWaitingForReveal;

  const isCancellable =
    isGameFirstPlayer && game.data?.gameState.createdAndWaitingForStart;

  const isRevealable =
    game.data?.gameState.startedAndWaitingForReveal &&
    game.data?.firstPlayerHash &&
    game.data?.secondPlayerHash &&
    (isGameFirstPlayer || isGameSecondPlayer);

  if (game.isLoading || bpsSettings.isLoading) {
    return <LoadingCard message="Loading game" />;
  }

  if (game.error || !game.data || bpsSettings.error || !bpsSettings.data) {
    console.log(game.error);
    console.log(bpsSettings.error);
    return <NotFoundCard />;
  }

  const { didForfeit } = gameForfeitCondition(game.data, bpsSettings.data);

  const isClaimable =
    didForfeit ||
    (game.data.firstPlayerChoice &&
      game.data.secondPlayerChoice &&
      !game.data.gameState.draw &&
      !game.data.gameState.firstPlayerWon &&
      !game.data.gameState.secondPlayerWon);

  const firstPlayerChoice = game.data.firstPlayerChoice
    ? capitalize(
        splitLowerCaseItemIntoWords(
          getValueFromEnumVariant(game.data.firstPlayerChoice)
        )
      )
    : undefined;
  const secondPlayerChoice = game.data.secondPlayerChoice
    ? capitalize(
        splitLowerCaseItemIntoWords(
          getValueFromEnumVariant(game.data.secondPlayerChoice)
        )
      )
    : undefined;
  const status = capitalize(
    splitLowerCaseItemIntoWords(getValueFromEnumVariant(game.data.gameState))
  );

  return (
    <>
      <GameCard
        className="shadow"
        pubKey={new web3.PublicKey(gamePubkey)}
        winner={game.data.winner ?? undefined}
        firstPlayerChoice={firstPlayerChoice}
        secondPlayerChoice={secondPlayerChoice}
        gameId={game.data.gameId}
        createdAt={game.data.createdAt}
        firstPlayer={game.data.firstPlayer}
        mint={game.data.mint}
        amountToMatch={game.data.amountToMatch}
        secondPlayer={game.data.secondPlayer ?? undefined}
        status={status}
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
            onClick={handleAdminCloseStaleGame}
            disabled={adminCloseStaleGame.isMutating}
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
            onClick={handleCancelGame}
            disabled={cancelGame.isMutating}
            className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {cancelGame.isMutating ? <Spinner /> : "Cancel Game"}
          </button>
        </div>
      ) : null}
      {isRevealable ? (
        <RevealCard
          key={revealCardKey}
          game={game.data}
          gamePubkey={gamePubkey}
        />
      ) : null}
      {isClaimable ? (
        <ClaimCard game={game.data} gamePubkey={gamePubkey} />
      ) : null}
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
