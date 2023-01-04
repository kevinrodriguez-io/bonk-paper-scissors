import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { BonkPaperScissors } from "../target/types/bonk_paper_scissors";

describe("bonk-paper-scissors", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.BonkPaperScissors as Program<BonkPaperScissors>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
