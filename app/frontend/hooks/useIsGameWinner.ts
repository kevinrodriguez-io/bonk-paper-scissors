import { useWallet } from "@solana/wallet-adapter-react";
import { GameAccount } from "../types/GameAccount";

export const useWalletIsGameWinner = (game: GameAccount) => {
  const { publicKey } = useWallet();
  if (!publicKey) return false;
  return game.winner?.equals(publicKey) ?? false;
};

export const useWalletIsGameLoser = (game: GameAccount) => {
  const { publicKey } = useWallet();
  if (!publicKey) return false;
  return game.loser?.equals(publicKey) ?? false;
};

const calculateWinnerOnFrontend = (game: GameAccount) => {
  const { firstPlayer, secondPlayer } = game;
  if (!firstPlayer || !secondPlayer) return null;
  const firstPlayerMove = game.firstPlayerChoice;
  const secondPlayerMove = game.secondPlayerChoice;
  if (firstPlayerMove === secondPlayerMove) return null;
  if (firstPlayerMove?.bonk) {
    if (secondPlayerMove?.paper) return secondPlayer;
    if (secondPlayerMove?.scissors) return firstPlayer;
  }
  if (firstPlayerMove?.paper) {
    if (secondPlayerMove?.scissors) return secondPlayer;
    if (secondPlayerMove?.bonk) return firstPlayer;
  }
  if (firstPlayerMove?.scissors) {
    if (secondPlayerMove?.bonk) return secondPlayer;
    if (secondPlayerMove?.paper) return firstPlayer;
  }
  return null;
};

export const useWalletIsGameWinnerButHasntClaimed = (game: GameAccount) => {
  const { publicKey } = useWallet();
  if (!publicKey) return false;
  return (
    !game.gameState.firstPlayerWon &&
    !game.gameState.secondPlayerWon &&
    !game.gameState.draw &&
    game.gameState.startedAndWaitingForReveal &&
    calculateWinnerOnFrontend(game)?.equals(publicKey) &&
    (game.firstPlayer?.equals(publicKey) ||
      game.secondPlayer?.equals(publicKey))
  );
};

export const useWalletIsGameLoserButHasntClaimed = (game: GameAccount) => {
  const { publicKey } = useWallet();
  if (!publicKey) return false;
  return (
    !game.gameState.firstPlayerWon &&
    !game.gameState.secondPlayerWon &&
    !game.gameState.draw &&
    game.gameState.startedAndWaitingForReveal &&
    !calculateWinnerOnFrontend(game)?.equals(publicKey) &&
    (game.firstPlayer?.equals(publicKey) ||
      game.secondPlayer?.equals(publicKey))
  );
};
