import type { NextPage } from "next";
import Head from "next/head";

import { GameCard } from "../components/GameCard";
import { Layout } from "../components/Layout";
import { LoadingCard } from "../components/LoadingCard";
import { NoGamesCard } from "../components/NoGamesCard";
import { useGamesByStatus } from "../hooks/useGamesByStatus";
import { getValueFromEnumVariant } from "../lib/solana/getValueFromEnumVariant";
import { capitalize, splitLowerCaseItemIntoWords } from "../lib/string";

const Home: NextPage = () => {
  const { data, error, isLoading } = useGamesByStatus(
    "CreatedAndWaitingForStart"
  );
  return (
    <>
      <Head>
        <title>BPS App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout title="Game Lobby">
        <div className="py-4">
          {isLoading ? <LoadingCard /> : null}
          {error ? (
            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6 space-y-6 flex flex-row items-center">
              <span className="text-red-500">Error: {error}</span>
            </div>
          ) : null}
          {data?.length ? (
            <div className="grid grid-flow-row-dense">
              {data.map((game) => (
                <GameCard
                  key={game.publicKey.toBase58()}
                  showGoToGame
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
              ))}
            </div>
          ) : <NoGamesCard />}
        </div>
      </Layout>
    </>
  );
};

export default Home;
