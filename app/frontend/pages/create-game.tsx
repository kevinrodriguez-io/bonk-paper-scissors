import type { NextPage } from "next";
import Head from "next/head";
import { encode } from "bs58";
import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useMutation from "swr/mutation";
import { Layout } from "../components/Layout";

const schema = z.object({
  gameId: z
    .string()
    .min(3, "Game id must be at least 3 characters")
    .max(24, "Game id must be at most 24 characters"),
  amount: z.number().min(1000, "Amount must be at least 1000"),
});

type CreateGameNeededParams = {
    gameId: string;
    amount: number;
    choice: "rock" | "paper" | "scissors";
    salt: string;
    mint: string;
    walletKey: string;
}

const createGame = () => {
    // TODO: Add logic to create game
}

const CreateGame: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });
  const createGame = useMutation("game", async () => {

  }, {});
  const [choice, setChoice] = useState<"rock" | "paper" | "scissors" | null>(
    null
  );
  const [salt, setSalt] = useState<string | null>(null);
  useEffect(() => {
    const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
    const bytesBs58 = encode(randomBytes);
    setSalt(bytesBs58);
  }, []);
  const [saltVisible, setSaltVisible] = useState(false);
  return (
    <>
      <Head>
        <title>BPS App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout title="Create game">
        <div className="py-4">
          <form
            className="space-y-6"
            onSubmit={handleSubmit((d) => console.log(d))}
          >
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
              <div className="md:grid md:grid-cols-3 md:gap-6">
                <div className="md:col-span-1">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Notes
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    By creating a game you have to provide your choice, which
                    will be private until both players reveal. Once revealed,
                    the winner will be determined by the bonk, paper, scissors
                    rules.
                  </p>
                  <p className="mt-1 text-sm text-green-800">
                    The winner wins a total of the 90% of the pot (both it's
                    deposit and the adversary deposit), while the other 10% is
                    burned 🔥.
                  </p>
                  <p className="mt-1 text-sm text-red-800">
                    <b>
                      A player who makes a choice and refuses to reveal is
                      penalized as forfeit after 7 days, making the other player
                      the winner, so remember to always reveal when prompted.
                    </b>
                  </p>
                </div>

                <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <span className="block text-sm font-medium text-gray-700">
                        Mint
                      </span>
                      <div className="mt-1 font-mono">
                        DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-3 sm:col-span-2">
                      <span className="block text-sm font-medium text-gray-700">
                        Salt (readonly) <b>DO NOT SHARE</b>
                      </span>
                      <div className="mt-1 flex font-mono items-center">
                        {saltVisible ? salt : "*".repeat(salt?.length ?? 0)}
                        <button
                          type="button"
                          className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                          onClick={() => setSaltVisible(!saltVisible)}
                        >
                          {saltVisible ? "Hide" : "Show"}
                        </button>
                      </div>
                    </div>
                  </div>

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
                      <p>{errors.gameId?.message as string}</p>
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
                      {...register("amount")}
                    />
                    {errors.amount?.message && (
                      <p>{errors.amount?.message as string}</p>
                    )}
                  </div>

                  <fieldset>
                    <legend className="contents text-sm font-medium text-gray-700">
                      Your secret choice
                    </legend>
                    <div className="mt-4 space-y-4">
                      <div className="flex items-center">
                        <input
                          id="bonk"
                          name="choice"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
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
                          id="paper"
                          name="choice"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
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
                          id="scissors"
                          name="choice"
                          type="radio"
                          className="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500"
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
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="reset"
                className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Start Game
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </>
  );
};

export default CreateGame;
