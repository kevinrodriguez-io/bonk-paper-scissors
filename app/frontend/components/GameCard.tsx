import { BN, web3 } from "@project-serum/anchor";
import Link from "next/link";
import { formatNumber, hideMiddle } from "../lib/string";

type GameCardProps = {
  gameId: string;
  pubKey: web3.PublicKey;
  firstPlayer: web3.PublicKey;
  secondPlayer?: web3.PublicKey;
  status: string;
  mint: web3.PublicKey;
  amountToMatch: BN;
  showGoToGame?: boolean;
};

export const GameCard = ({
  gameId,
  pubKey,
  firstPlayer,
  secondPlayer,
  status,
  mint,
  amountToMatch,
  showGoToGame,
}: GameCardProps) => {
  // Create a link to the solana explorer with the pubkey of the game
  const explorerLink = `https://explorer.solana.com/address/${pubKey.toBase58()}`;
  const firstPlayerLink = `https://explorer.solana.com/address/${firstPlayer.toBase58()}`;
  const secondPlayerLink = secondPlayer
    ? `https://explorer.solana.com/address/${secondPlayer.toBase58()}`
    : null;
  const mintLink = `https://explorer.solana.com/address/${mint.toBase58()}`;

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Id: {gameId}
        </h3>
        <a
          href={explorerLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 max-w-2xl text-sm text-gray-500 hover:underline"
        >
          Game pubkey: {hideMiddle(pubKey.toBase58())}
        </a>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created by</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <a
                href={firstPlayerLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {hideMiddle(firstPlayer.toBase58())}
              </a>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {status}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Mint</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              <a
                href={mintLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                {hideMiddle(mint.toBase58())}
              </a>
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Amount to match
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatNumber(
                amountToMatch.div(new BN(10).pow(new BN(9))).toString()
              )}
            </dd>
          </div>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Pot</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatNumber(
                amountToMatch
                  .div(new BN(10).pow(new BN(9)))
                  .muln(2)
                  .muln(0.9)
                  .toString()
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">To burn</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatNumber(
                amountToMatch
                  .div(new BN(10).pow(new BN(9)))
                  .muln(2)
                  .muln(0.1)
                  .toString()
              )}
            </dd>
          </div>

          {secondPlayer ? (
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Opponent</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <a
                  href={secondPlayerLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {hideMiddle(secondPlayer.toBase58())}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
        {showGoToGame ? (
          <div className="flex flex-row justify-end">
            <Link
              href={`/game/${pubKey.toBase58()}`}
              className="m-4 inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Go to game
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
};
