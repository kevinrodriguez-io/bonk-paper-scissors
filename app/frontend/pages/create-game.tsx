import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import BN from "bn.js";

import { Layout } from "../components/Layout";
import { MINT } from "../constants/constants";
import { SaltResult } from "../lib/crypto/crypto";
import { Choice } from "../types/Choice";
import { useFirstPlayerMove } from "../hooks/useFirstPlayerMove";
import { ConnectWalletCard } from "../components/ConnectWalletCard";
import { useMintDetails } from "../hooks/useMint";
import { useTokenAccountForMint } from "../hooks/useTokenAccountForMint";
import { LoadingCard } from "../components/LoadingCard";
import { FirstCard } from "../components/createGame/FirstCard";
import { SecondCard } from "../components/createGame/SecondCard";
import { MessageLinkToast } from "../components/MessageLinkToast";
import { SpinnerToast } from "../components/SpinnerToast";

const CreateGame: NextPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const [step, setStep] = useState<"first" | "second">("first");
  const [gameId, setGameId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [fireFirstPlayerMove, setFireFirstPlayerMove] = useState(0);
  const mintDetails = useMintDetails(MINT);
  const tokenAccoutForMint = useTokenAccountForMint(MINT);

  const firstPlayerMove = useFirstPlayerMove({
    onSuccess: ({ txId }) => {
      toast.success(
        <MessageLinkToast
          title="Game created!"
          url={`https://explorer.solana.com/tx/${txId}`}
          urlText="View on Solana Explorer"
        />,
        { autoClose: false }
      );
    },
    onError: (err) => toast.error(err.message, { autoClose: false }),
  });
  useEffect(() => {
    if (fireFirstPlayerMove === 0) return;
    if (step !== "second") return;
    if (!wallet) return;
    if (!gameId) return;
    if (!amount) return;
    if (!salt) return;
    if (!choice) return;
    (async () => {
      toast(() => <SpinnerToast>Creating game...</SpinnerToast>);
      const n = amount * 10 ** mintDetails.data!.decimals;
      const theBN = new BN(
        n.toLocaleString("fullwide", { useGrouping: false })
      );
      firstPlayerMove.firstPlayerMove({
        dependencies: { wallet, connection },
        payload: {
          gameId,
          choice,
          salt,
          amount: theBN,
        },
      });
    })();
  }, [fireFirstPlayerMove]);

  const resetAll = () => {
    setGameId(null);
    setAmount(null);
    setSalt(null);
    setChoice(null);
    setStep("first");
  };

  const handleOnFirstCardSuccess = (name: string, amount: number) => {
    setGameId(name);
    setAmount(amount);
    setStep("second");
  };

  const handleOnFirstCardCancel = () => {
    resetAll();
  };

  const handleOnSecondCardSuccess = (salt: SaltResult, choice: Choice) => {
    setSalt(salt);
    setChoice(choice);
    setFireFirstPlayerMove((v) => v + 1);
  };

  const handleOnSecondCardCancel = () => {
    resetAll();
  };

  const isLoading = mintDetails.isLoading || tokenAccoutForMint.isLoading;

  if (isLoading) {
    return (
      <>
        <Head>
          <title>BPS App - Create Game</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Layout title="Create game">
          <div className="py-4">
            <LoadingCard message="Loading" />
          </div>
        </Layout>
      </>
    );
  }

  const isLoadingButCanCascade = firstPlayerMove.isMutating;

  return (
    <>
      <Head>
        <title>BPS App - Create Game</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout title="Create game">
        <div className="py-4">
          {!wallet ? (
            <ConnectWalletCard />
          ) : (
            <>
              <FirstCard
                availableUIAmount={
                  tokenAccoutForMint.data?.info.tokenAmount.uiAmount ?? 0
                }
                onSuccess={handleOnFirstCardSuccess}
                onCancel={handleOnFirstCardCancel}
                isLoading={isLoadingButCanCascade}
              />
              {step === "second" ? (
                <SecondCard
                  onSuccess={handleOnSecondCardSuccess}
                  onCancel={handleOnSecondCardCancel}
                  isLoading={isLoadingButCanCascade}
                />
              ) : null}
            </>
          )}
        </div>
      </Layout>
    </>
  );
};

export default CreateGame;
