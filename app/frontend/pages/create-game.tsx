import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { toast } from "react-toastify";
import shortUUID from "short-uuid";

import { Layout } from "../components/Layout";
import { MINT } from "../constants/constants";
import { getGameSecret, getSalt, SaltResult } from "../lib/crypto/crypto";
import { Choice } from "../types/Choice";
import { CanBeLoading } from "../types/CanBeLoading";
import { Spinner } from "../components/Spinner";
import { useFirstPlayerMove } from "../hooks/useFirstPlayerMove";
import { ConnectWalletCard } from "../components/ConnectWalletCard";
import { useMintDetails } from "../hooks/useMint";
import { getChoiceKey, getSaltKey } from "../lib/storage";
import { useTokenAccountForMint } from "../hooks/useTokenAccountForMint";
import { LoadingCard } from "../components/LoadingCard";
import BN from "bn.js";
import { EnvelopeIcon, MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

const firstCardSchema = z.object({
  gameId: z
    .string()
    .min(3, "Game identifier must be at least 3 characters")
    .max(24, "Game identifier must be at most 24 characters"),
  amount: z.number().min(1000, "Amount must be at least 1000"),
});

type FirstCardProps = CanBeLoading & {
  availableUIAmount: number;
  onCancel?: () => void;
  onSuccess?: (gameId: string, amount: number) => void;
};

const FirstCard = ({
  availableUIAmount,
  onSuccess,
  onCancel,
  isLoading,
}: FirstCardProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({ resolver: zodResolver(firstCardSchema) });

  useEffect(() => {
    setValue("gameId", shortUUID.generate());
  }, []);

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
              <div className="flex items-center">
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Ex. Kevin's Game"
                  {...register("gameId")}
                />
                <div>
                  <button
                    type="button"
                    className="ml-2 inline-flex items-center px-2.5 py-1.5 mt-1 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={() => {
                      setValue("gameId", shortUUID.generate());
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>
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
              <div className="mt-3 flex gap-1">
                <button
                  type="button"
                  className="flex-1 border-t-teal-500 border-t-4 hover:bg-teal-100 text-sm"
                  onClick={() => {
                    setValue("amount", availableUIAmount * 0.25);
                  }}
                >
                  25%
                </button>
                <button
                  type="button"
                  className="flex-1 border-t-green-500 border-t-4 hover:bg-green-100 text-sm"
                  onClick={() => {
                    setValue("amount", availableUIAmount * 0.5);
                  }}
                >
                  50%
                </button>
                <button
                  type="button"
                  className="flex-1 border-t-yellow-500 border-t-4 hover:bg-yellow-100 text-sm"
                  onClick={() => {
                    setValue("amount", availableUIAmount * 0.75);
                  }}
                >
                  75%
                </button>
                <button
                  type="button"
                  className="flex-1 border-t-orange-500 border-t-4 hover:bg-orange-100 text-sm"
                  onClick={() => {
                    setValue("amount", availableUIAmount * 10);
                  }}
                >
                  100%
                </button>
              </div>
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
  const [choice, setChoice] = useState<Choice | null>(null);
  // TODO: Move this to zod as in {joinSchema}
  const [error, setError] = useState<string | null>(null);
  const secret = useMemo(() => {
    if (!salt || !choice) return null;
    const secret = getGameSecret(salt, choice);
    const link = `mailto:?subject=My%20game%20secret&body=I'm%20mailing%20myself%20my%20game%20secret%20just%20in%20case%20I%20change%20browser%20or%20have%20to%20resume%20my%20game%20from%20another%20device.%0D%0ASecret%3A%20${secret}`;
    return { secret, link };
  }, [choice, salt]);
  useEffect(() => {
    const { bytesBs58, randomBytes } = getSalt();
    setSalt({ bytesBs58, randomBytes });
  }, []);
  return (
    <>
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
                deposit due to somebody else looking at your choice, that's why
                we use your browser to generate security <b>bytes</b> to hide it
                until both players reveal; this is what we call a salt. Remember
                that you can't win if you never reveal your choice.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                <b>It is important to know that</b> your browser will try to
                remember your choice and secret bytes, so be sure to not close
                the tab while the game is being created or clear your browser
                history/cache.
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Save the secret below your choice or email it to yourself so you
                can resume the game later on another device if you need to or in
                case of emergency. The reason BPS doesn't send you the game
                secret is because it's unsafe to make it travel through the
                internet and could introduce mistrust in the protocol.
              </p>
            </div>

            <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
              <div className="mt-4 space-y-4 flex">
                <fieldset>
                  <legend className="contents text-sm font-medium text-gray-700">
                    Your secret choice
                  </legend>
                  <div className="mt-4 space-y-4 flex">
                    <div className="flex items-center relative">
                      <input
                        onChange={() => {
                          setChoice("bonk");
                          setError(null);
                        }}
                        id="bonk"
                        name="choice"
                        type="radio"
                        className="hidden peer"
                        value="bonk"
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
                        onChange={() => {
                          setChoice("paper");
                          setError(null);
                        }}
                        id="paper"
                        name="choice"
                        type="radio"
                        className="hidden peer"
                        value="paper"
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
                        onChange={() => {
                          setChoice("scissors");
                          setError(null);
                        }}
                        id="scissors"
                        name="choice"
                        type="radio"
                        className="hidden peer"
                        value="scissors"
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
                {error && (
                  <div className="mt-2 text-sm text-red-600">{error}</div>
                )}
              </div>
              {choice && salt ? (
                <div>
                  <label
                    htmlFor="gameSecret"
                    className="text-sm font-medium text-gray-700"
                  >
                    Game secret (DO NOT SHARE)
                  </label>
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
                      className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      placeholder="Game secret"
                      value={secret?.secret ?? ""}
                      readOnly
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center">
                      <a
                        className="h-full inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 cursor-pointer"
                        href={secret?.link ?? "#"}
                      >
                        <EnvelopeIcon
                          className="h-5 w-5 mr-1 text-gray-400"
                          aria-hidden="true"
                        />
                        Mail myself
                      </a>
                    </div>
                  </div>
                </div>
              ) : null}
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
    </>
  );
};

const CreateGame: NextPage = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const [step, setStep] = useState<"first" | "second">("first");
  const [gameId, setGameId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [salt, setSalt] = useState<SaltResult | null>(null);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [fireFirstPlayerMove, setFireFirstPlayerMove] = useState(0);

  console.log({
    step,
    gameId,
    amount,
    salt,
    choice,
    fireFirstPlayerMove,
  });

  const mintDetails = useMintDetails(MINT);
  const tokenAccoutForMint = useTokenAccountForMint(MINT);

  const firstPlayerMove = useFirstPlayerMove({
    onSuccess: ({ txId, gamePDA, choice, salt, walletPubKey }) => {
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
      const n = amount * 10 ** mintDetails.data!.decimals;
      console.log({ n });
      const theBN = new BN(
        n.toLocaleString("fullwide", { useGrouping: false })
      );

      console.log({ vn: theBN.toString() });
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

  if (isLoading)
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
