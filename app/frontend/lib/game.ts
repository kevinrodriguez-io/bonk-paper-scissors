import { BN } from "@project-serum/anchor";
import { BPSSettingsAccount } from "../types/BPSSettingsAccount";
import { GameAccount } from "../types/GameAccount";

type GameForfeitConditionResult = {
  didForfeit: boolean;
  winnerPlayerFromForfeit: "first" | "second" | null;
};

export const gameForfeitCondition = (
  game: GameAccount,
  bpsSettingsAccount: BPSSettingsAccount
): GameForfeitConditionResult => {
  const timeForPenalization = bpsSettingsAccount.timeForPenalization;
  const now = new BN(Math.floor(Date.now() / 1000));
  if (!game.gameState.startedAndWaitingForReveal)
    return {
      didForfeit: false,
      winnerPlayerFromForfeit: null,
    };
  if (game.firstPlayerRevealedAt && !game.secondPlayerRevealedAt) {
    const revealedAtPlusPenalizationTime =
      game.firstPlayerRevealedAt.add(timeForPenalization);
    console.log({
      revealedAt: game.firstPlayerRevealedAt.toString(),
      revealedAtPlusPenalizationTime: revealedAtPlusPenalizationTime.toString(),
      now: now.toString(),
      penalty: timeForPenalization.toString(),
    });
    const didForfeit = revealedAtPlusPenalizationTime.lt(now);
    return {
      didForfeit: didForfeit,
      winnerPlayerFromForfeit: didForfeit ? "first" : null,
    };
  } else if (!game.firstPlayerRevealedAt && game.secondPlayerRevealedAt) {
    const revealedAtPlusPenalizationTime =
      game.secondPlayerRevealedAt.add(timeForPenalization);
    console.log({
      revealedAt: game.secondPlayerRevealedAt.toString(),
      revealedAtPlusPenalizationTime: revealedAtPlusPenalizationTime.toString(),
      now: now.toString(),
      penalty: timeForPenalization.toString(),
    });
    const didForfeit = revealedAtPlusPenalizationTime.lt(now);
    return {
      didForfeit: didForfeit,
      winnerPlayerFromForfeit: didForfeit ? "second" : null,
    };
  }
  return {
    didForfeit: false,
    winnerPlayerFromForfeit: null,
  };
};
