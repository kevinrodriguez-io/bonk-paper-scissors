import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Layout } from "../components/Layout";
import { MINT } from "../constants/constants";
import { getSalt, SaltResult } from "../lib/crypto/crypto";
import { Choice } from "../types/Choice";
import { CanBeLoading } from "../types/CanBeLoading";
import { Spinner } from "../components/Spinner";
import { useFirstPlayerMove } from "../hooks/useFirstPlayerMove";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import { ConnectWalletCard } from "../components/ConnectWalletCard";
import { useMintDetails } from "../hooks/useMint";

const firstCardSchema = z.object({
  gameId: z
    .string()
    .min(3, "Game identifier must be at least 3 characters")
    .max(24, "Game identifier must be at most 24 characters"),
  amount: z.number().min(1000, "Amount must be at least 1000"),
});

type FirstCardProps = CanBeLoading & {
  onCancel?: () => void;
  onSuccess?: (gameId: string, amount: number) => void;
};

const FirstCard = ({ onSuccess, onCancel, isLoading }: FirstCardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(firstCardSchema) });
  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(({ gameId, amount }) => {
        onSuccess?.(gameId, amount);
      })}
    >
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Notes
            </h3>
            <p className="mt-1 text-sm text-gray-500 text-justify">
              By creating a game you have to provide your choice, which will be
              private until both players reveal. Once revealed, the winner will
              be determined by the bonk, paper, scissors rules.
            </p>
            <p className="mt-1 text-gray-500 text-sm text-justify">
              The winner wins a total of the 90% of the pot (both it's deposit
              and the adversary deposit), while the other 10% is burned 🔥.
            </p>
            <p className="mt-1 text-sm text-red-900 text-justify">
              A player who makes a choice and refuses to reveal is penalized as
              forfeit after 7 days, making the other player the winner, so
              remember to always reveal when prompted.
            </p>
          </div>

          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <div className="col-span-6 sm:col-span-4">
              <label
                htmlFor="game-id"
                className="block text-sm font-medium text-gray-700"
              >
                Game identifier
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Ex. Kevin's Game"
                {...register("gameId")}
              />
              {errors.gameId?.message && (
                <p className="text-xs text-red-800">
                  {errors.gameId?.message as string}
                </p>
              )}
            </div>

            <div className="col-span-6 sm:col-span-4">
              <label className="block text-sm font-medium text-gray-700">
                Amount to deposit on the pot
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Ex. 1000000"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount?.message && (
                <p className="text-xs text-red-800">
                  {errors.amount?.message as string}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="reset"
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          disabled={isLoading}
          onClick={() => onCancel?.()}
        >
          {isLoading ? <Spinner /> : "Cancel"}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {isLoading ? <Spinner /> : "Next"}
        </button>
      </div>
    </form>
  );
};

type SecondCardProps = CanBeLoading & {
  onSuccess?: (salt: SaltResult, choice: Choice) => void;
  onCancel?: () => void;
};

const SecondCard = ({ onSuccess, onCancel, isLoading }: SecondCardProps) => {
  const [salt, setSalt] = useState<SaltResult | null>(null);
  // TODO: Move this to zod as in {joinSchema}
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const { bytesBs58, randomBytes } = getSalt();
    setSalt({ bytesBs58, randomBytes });
  }, []);
  // const [saltVisible, setSaltVisible] = useState(false);
  return (
    <form
      className="space-y-6 mt-8"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.target as HTMLFormElement);
        const choice = data.get("choice") as Choice;
        if (!choice) {
          setError("You must choose a valid option");
          return;
        }
        onSuccess?.(salt!, choice);
      }}
    >
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Secrets
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Don't worry, the game is designed so that you can't lose your
              deposit due to somebody else looking at your choice, that's why we
              use your browser to generate security <b>bytes</b> to hide it
              until both players reveal; this is what we call a salt. Remember
              that you can't win if you never reveal your choice.
            </p>
          </div>

          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <span className="block text-sm font-medium text-gray-700">
                  Mint
                </span>
                <div className="mt-1 font-mono text-[8px] sm:text-xs">
                  {MINT}
                </div>
              </div>
            </div>

            {/* <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-2">
                <span className="block text-sm font-medium text-gray-700">
                  Salt (readonly) <b>DO NOT SHARE</b>
                </span>
                <div className="mt-1 flex font-mono items-center text-[8px] sm:text-xs">
                  {saltVisible
                    ? salt?.bytesBs58
                    : "*".repeat(salt?.bytesBs58.length ?? 0)}
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => setSaltVisible(!saltVisible)}
                  >
                    {saltVisible ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div> */}

            <fieldset>
              <legend className="contents text-sm font-medium text-gray-700">
                Your secret choice
              </legend>
              <div className="mt-4 space-y-4">
                <div className="flex items-center">
                  <input
                    onChange={() => setError(null)}
                    id="bonk"
                    name="choice"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    value="bonk"
                  />
                  <label
                    htmlFor="bonk"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Bonk 🪨🐶
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    onChange={() => setError(null)}
                    id="paper"
                    name="choice"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    value="paper"
                  />
                  <label
                    htmlFor="paper"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Paper 📄
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    onChange={() => setError(null)}
                    id="scissors"
                    name="choice"
                    type="radio"
                    className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
                    value="scissors"
                  />
                  <label
                    htmlFor="scissors"
                    className="ml-3 block text-sm font-medium text-gray-700"
                  >
                    Scissors ✂️
                  </label>
                </div>
              </div>
            </fieldset>
            {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
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
          {isLoading ? <Spinner /> : "Create Game"}
        </button>
      </div>
    </form>
  );
};

const CreateGame: NextPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  const mintDetails = useMintDetails(MINT);
  const firstPlayerMove = useFirstPlayerMove({
    onSuccess: (txId) =>
      toast.success(
        () => {
          const url = `https://explorer.solana.com/tx/${txId}`;
          return (
            <div className="flex items-center space-x-2">
              <div>Game created!</div>
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
      ),
    onError: (err) => toast.error(err.message, { autoClose: false }),
  });
  const [step, setStep] = useState<"first" | "second">("first");
  const [gameId, setGameId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [fireFirstPlayerMove, setFireFirstPlayerMove] = useState(0);

  useEffect(() => {
    if (fireFirstPlayerMove === 0) return;
    if (step !== "second") return;
    if (!wallet) return;
    if (!gameId) return;
    if (!amount) return;
    if (!salt) return;
    if (!choice) return;
    (async () => {
      toast(() => {
        return (
          <div className="flex items-center space-x-2">
            <Spinner />
            <div>Creating game...</div>
          </div>
        );
      });
      firstPlayerMove.firstPlayerMove({
        dependencies: { wallet, connection },
        payload: {
          gameId,
          choice,
          salt,
          amount: amount * 10 ** mintDetails.data!.decimals,
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

  const isLoading = firstPlayerMove.isMutating || mintDetails.isLoading;

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
                onSuccess={handleOnFirstCardSuccess}
                onCancel={handleOnFirstCardCancel}
                isLoading={isLoading}
              />
              {step === "second" ? (
                <SecondCard
                  onSuccess={handleOnSecondCardSuccess}
                  onCancel={handleOnSecondCardCancel}
                  isLoading={isLoading}
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
