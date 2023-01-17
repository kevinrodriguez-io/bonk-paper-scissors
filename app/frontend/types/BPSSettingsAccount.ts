import type { Program } from "@project-serum/anchor";
import type { BonkPaperScissors } from "../resources/idl/bonk_paper_scissors";

export type BPSSettingsAccount = Awaited<
  ReturnType<Program<BonkPaperScissors>["account"]["bpsSettingsV2"]["fetch"]>
>;
