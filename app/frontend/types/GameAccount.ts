import type { Program } from "@project-serum/anchor";
import type { BonkPaperScissors } from "../resources/idl/bonk_paper_scissors";

export type GameAccount = Awaited<
  ReturnType<Program<BonkPaperScissors>["account"]["game"]["fetch"]>
>;
