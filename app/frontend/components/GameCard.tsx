import { BN, web3 } from "@project-serum/anchor";
import Link from "next/link";
import { DateTime } from "luxon";
import cx from "classnames";
import { formatNumber, hideMiddle } from "../lib/string";
import { useMintDetails } from "../hooks/useMint";

type GameCardProps = {
  gameId: string;
  pubKey: web3.PublicKey;
  firstPlayer: web3.PublicKey;
  secondPlayer?: web3.PublicKey;
  winner?: web3.PublicKey;
  status: string;
  mint: web3.PublicKey;
  amountToMatch: BN;
  createdAt: BN;
  firstPlayerChoice?: string;
  secondPlayerChoice?: string;
  showGoToGame?: boolean;
  className?: string;
};

export const GameCard = ({
  gameId,
  pubKey,
  createdAt,
  firstPlayer,
  secondPlayer,
  winner,
  status,
  mint,
  amountToMatch,
  showGoToGame,
  className,
  firstPlayerChoice,
  secondPlayerChoice,
}: GameCardProps) => {
  const { data } = useMintDetails(mint.toBase58());
  // Create a link to the solana explorer with the pubkey of the game
  const explorerLink = `https://explorer.solana.com/address/${pubKey.toBase58()}`;
  const firstPlayerLink = `https://explorer.solana.com/address/${firstPlayer.toBase58()}`;
  const secondPlayerLink = secondPlayer
    ? `https://explorer.solana.com/address/${secondPlayer.toBase58()}`
    : null;
  const winnerLink = winner
    ? `https://explorer.solana.com/address/${winner.toBase58()}`
    : null;
  const mintLink = `https://explorer.solana.com/address/${mint.toBase58()}`;

  return (
    <div className={cx("overflow-hidden bg-white rounded-lg", className)}>
      <div className="px-4 py-5 sm:px-6">
        <h3 className="font-mono text-lg font-medium leading-6 text-gray-900">
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
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">P1</dt>
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
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">P2</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {secondPlayer ? (
                <a
                  href={secondPlayerLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {hideMiddle(secondPlayer.toBase58())}
                </a>
              ) : (
                "None"
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Winner</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {winner ? (
                <a
                  href={winnerLink!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {hideMiddle(winner.toBase58())}
                </a>
              ) : (
                "To be defined"
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">P1 choice</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {firstPlayerChoice ?? "None"}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">P2 choice</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {secondPlayerChoice ?? "None"}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Status</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {status}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
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
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatNumber(
                amountToMatch
                  .div(new BN(10).pow(new BN(data?.decimals ?? 9)))
                  .toString()
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Pot</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatNumber(
                amountToMatch
                  .div(new BN(10).pow(new BN(data?.decimals ?? 9)))
                  .muln(2)
                  .muln(0.9)
                  .toString()
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">To burn</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {formatNumber(
                amountToMatch
                  .div(new BN(10).pow(new BN(data?.decimals ?? 9)))
                  .muln(2)
                  .muln(0.1)
                  .toString()
              )}
            </dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Created at</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
              {DateTime.fromSeconds(createdAt.toNumber()).toFormat(
                "yyyy-MM-dd HH:mm:ss"
              )}
            </dd>
          </div>
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
