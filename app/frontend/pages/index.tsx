import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { useDebounce } from "usehooks-ts";

import { GameCard } from "../components/GameCard";
import { Layout } from "../components/Layout";
import { LoadingCard } from "../components/LoadingCard";
import { NoGamesCard } from "../components/NoGamesCard";
import { useGamesByStatuses } from "../hooks/useGamesByStatuses";
import { getValueFromEnumVariant } from "../lib/solana/getValueFromEnumVariant";
import { capitalize, splitLowerCaseItemIntoWords } from "../lib/string";

const Home: NextPage = () => {
  const [searchCriteria, setSearchCriteria] = useState("");
  const debouncedSearchCriteria = useDebounce(searchCriteria, 500);
  const { data, error, isLoading } = useGamesByStatuses([
    "CreatedAndWaitingForStart",
    "StartedAndWaitingForReveal",
  ]);
  const filteredData = data?.filter((game) => {
    return game.account.gameId.includes(debouncedSearchCriteria);
  });
  return (
    <>
      <Head>
        <title>BPS App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout title="Game Lobby">
        {/* Create a search box */}
        <div>
          <div className="relative mt-1 rounded-md shadow-sm max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </div>
            <input
              type="text"
              name="gameId"
              id="gameId"
              onChange={(e) => setSearchCriteria(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="Game id"
            />
          </div>
        </div>
        <div className="mt-2">
          {isLoading ? <LoadingCard /> : null}
          {error ? (
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 space-y-6 flex flex-row items-center">
              <span className="text-red-500">Error: {error}</span>
            </div>
          ) : null}
          {filteredData?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
              {filteredData.map((game) => (
                <>
                  <GameCard
                    className="bg-gray-100 shadow-xl shadow-primary-500"
                    key={game.publicKey.toBase58()}
                    showGoToGame
                    winner={game.account.winner ?? undefined}
                    firstPlayerChoice={
                      game.account.firstPlayerChoice
                        ? capitalize(
                            splitLowerCaseItemIntoWords(
                              getValueFromEnumVariant(
                                game.account.firstPlayerChoice
                              )
                            )
                          )
                        : undefined
                    }
                    secondPlayerChoice={
                      game.account.secondPlayerChoice
                        ? capitalize(
                            splitLowerCaseItemIntoWords(
                              getValueFromEnumVariant(
                                game.account.secondPlayerChoice
                              )
                            )
                          )
                        : undefined
                    }
                    pubKey={game.publicKey}
                    gameId={game.account.gameId}
                    createdAt={game.account.createdAt}
                    firstPlayer={game.account.firstPlayer}
                    mint={game.account.mint}
                    amountToMatch={game.account.amountToMatch}
                    secondPlayer={game.account.secondPlayer ?? undefined}
                    status={capitalize(
                      splitLowerCaseItemIntoWords(
                        getValueFromEnumVariant(game.account.gameState)
                      )
                    )}
                  />
                </>
              ))}
            </div>
          ) : (
            <NoGamesCard />
          )}
        </div>
      </Layout>
    </>
  );
};

export default Home;
