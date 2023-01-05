import * as SPL from "@solana/spl-token";
import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { TextEncoder } from "util";
import { randomBytes, createHash } from "crypto";

import { BonkPaperScissors } from "../target/types/bonk_paper_scissors";

const encode = (str: string) => new TextEncoder().encode(str);
const b = (input: TemplateStringsArray) => encode(input.join(""));

const GAME_ID = "testgame";
const SECOND_GAME_ID = "secondgame";

const generateSalt = () => {
  const result = Uint8Array.from(randomBytes(32));
  // console.log("SALT:", [...result], `length: ${result.length}`);
  return result;
};

const generateHash = (salt: number[], move: 1 | 2 | 3) => {
  const hash = createHash("sha256");
  hash.update(Uint8Array.from([move]));
  hash.update(Uint8Array.from(salt));
  const result = Uint8Array.from(hash.digest());
  // console.log("HASH", [...result], `length: ${result.length}`);
  return result;
};

const getGamePDA = (
  firstPlayer: anchor.web3.PublicKey,
  programId: anchor.web3.PublicKey,
  gameId: string
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [b`game`, firstPlayer.toBytes(), encode(gameId)],
    programId
  );
};

const getEscrowPDA = (
  player: "first" | "second",
  gamePDA: anchor.web3.PublicKey,
  programId: anchor.web3.PublicKey
) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [
      gamePDA.toBytes(),
      b`escrow`,
      player === "first" ? b`first_player` : b`second_player`,
    ],
    programId
  );
};

const getReceiptPDA = (gamePDA: anchor.web3.PublicKey) => {
  return anchor.web3.PublicKey.findProgramAddressSync(
    [gamePDA.toBytes(), b`receipt`],
    gamePDA
  );
};

const createAndFundAccounts = async (program: Program<BonkPaperScissors>) => {
  const tokenCreator = anchor.web3.Keypair.generate();
  const playerOne = anchor.web3.Keypair.generate();
  const playerTwo = anchor.web3.Keypair.generate();
  const [tx1, tx2, tx3] = await Promise.all([
    program.provider.connection.requestAirdrop(
      tokenCreator.publicKey,
      1_000_000_000
    ),
    program.provider.connection.requestAirdrop(
      playerOne.publicKey,
      1_000_000_000
    ),
    program.provider.connection.requestAirdrop(
      playerTwo.publicKey,
      1_000_000_000
    ),
  ]);
  await program.provider.connection.confirmTransaction(tx1);
  await program.provider.connection.confirmTransaction(tx2);
  await program.provider.connection.confirmTransaction(tx3);
  return {
    tokenCreator,
    playerOne,
    playerTwo,
  };
};

const initializeMint = async (
  program: Program<BonkPaperScissors>,
  tokenCreator: anchor.web3.Keypair
) => {
  const mint = await SPL.createMint(
    program.provider.connection,
    tokenCreator,
    tokenCreator.publicKey,
    null,
    0
  );
  return mint;
};

const mintTo = async (
  program: Program<BonkPaperScissors>,
  tokenCreator: anchor.web3.Keypair,
  target: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  amount: number
) => {
  const { address } = await SPL.getOrCreateAssociatedTokenAccount(
    program.provider.connection,
    tokenCreator,
    mint,
    target
  );
  const result = await SPL.mintTo(
    program.provider.connection,
    tokenCreator,
    mint,
    address,
    tokenCreator,
    amount
  );
  return {
    ata: address,
    result,
  };
};

describe("bonk-paper-scissors: happy-path", async () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .BonkPaperScissors as Program<BonkPaperScissors>;

  let tokenCreator: anchor.web3.Keypair;
  let playerOne: anchor.web3.Keypair;
  let playerTwo: anchor.web3.Keypair;
  let mint: anchor.web3.PublicKey;
  let ataOne: anchor.web3.PublicKey;
  let escrowOne: anchor.web3.PublicKey;
  let ataTwo: anchor.web3.PublicKey;
  let escrowTwo: anchor.web3.PublicKey;
  let gamePDA: anchor.web3.PublicKey;
  let playerOneSalt: number[];
  let playerOneHash: number[];
  let playerTwoSalt: number[];
  let playerTwoHash: number[];

  it("first_player_move", async () => {
    // #region ----- SETUP -----
    const results = await createAndFundAccounts(program);
    tokenCreator = results.tokenCreator;
    playerOne = results.playerOne;
    playerTwo = results.playerTwo;

    const initializeMintResult = await initializeMint(program, tokenCreator);
    mint = initializeMintResult;

    const mintToPlayerOne = await mintTo(
      program,
      tokenCreator,
      playerOne.publicKey,
      mint,
      10_000
    );
    ataOne = mintToPlayerOne.ata;
    const mintToPlayerTwo = await mintTo(
      program,
      tokenCreator,
      playerTwo.publicKey,
      mint,
      10_000
    );
    ataTwo = mintToPlayerTwo.ata;
    // #endregion ----- SETUP ----- END

    const getGamePDAResult = getGamePDA(
      playerOne.publicKey,
      program.programId,
      GAME_ID
    );
    gamePDA = getGamePDAResult[0];
    const getEscrowPDAResult = getEscrowPDA(
      "first",
      gamePDA,
      program.programId
    );
    escrowOne = getEscrowPDAResult[0];

    const salt = generateSalt();
    playerOneSalt = [...salt];
    const hash = generateHash([...salt], 1);
    playerOneHash = [...hash];

    const tx = await program.methods
      .firstPlayerMove(GAME_ID, new anchor.BN(1_000), playerOneHash)
      .accountsStrict({
        game: gamePDA,
        firstPlayer: playerOne.publicKey,
        firstPlayerEscrow: escrowOne,
        firstPlayerTokenAccount: ataOne,
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: SPL.TOKEN_PROGRAM_ID,
      })
      .signers([playerOne])
      .rpc();

    const result = await program.account.game.fetchNullable(gamePDA);
    if (result === null) {
      throw new Error("Game account not found");
    }
    console.log("txid: ", tx);
  });

  it("second_player_move", async () => {
    const getEscrowPDAResult = getEscrowPDA(
      "second",
      gamePDA,
      program.programId
    );
    escrowTwo = getEscrowPDAResult[0];
    const salt = generateSalt();
    playerTwoSalt = [...salt];
    const hash = generateHash([...salt], 3);
    playerTwoHash = [...hash];
    const txId = await program.methods
      .secondPlayerMove(GAME_ID, playerTwoHash)
      .accountsStrict({
        game: gamePDA,
        secondPlayer: playerTwo.publicKey,
        secondPlayerEscrow: escrowTwo,
        secondPlayerTokenAccount: ataTwo,
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: SPL.TOKEN_PROGRAM_ID,
      })
      .signers([playerTwo])
      .rpc();
    console.log("txid: ", txId);
  });

  it("reveal (both)", async () => {
    const txId = await program.methods
      .reveal(GAME_ID, { bonk: {} }, playerOneSalt)
      .accountsStrict({
        game: gamePDA,
        player: playerOne.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerOne])
      .rpc();
    const txId2 = await program.methods
      .reveal(GAME_ID, { scissors: {} }, playerTwoSalt)
      .accountsStrict({
        game: gamePDA,
        player: playerTwo.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([playerTwo])
      .rpc();
    console.log("txid: ", txId);
    console.log("txid: ", txId2);
    const result = await program.account.game.fetchNullable(gamePDA);
    if (result === null) {
      throw new Error("Game account not found");
    }
    // console.log("result: ", result);
  });

  it("claim", async () => {
    const [receiptPDA] = getReceiptPDA(gamePDA);
    const tx = await program.methods
      .claim(GAME_ID)
      .accountsStrict({
        firstPlayer: playerOne.publicKey,
        firstPlayerEscrow: escrowOne,
        firstPlayerTokenAccount: ataOne,

        secondPlayer: playerTwo.publicKey,
        secondPlayerEscrow: escrowTwo,
        secondPlayerTokenAccount: ataTwo,

        game: gamePDA,
        mint: mint,
        payer: tokenCreator.publicKey,

        associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: SPL.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .transaction();

    const txId = await program.provider.sendAndConfirm!(tx, [tokenCreator], {
      skipPreflight: true,
    });

    console.log("txid: ", txId);
    // Fetch the account to see the new state.
    const result = await program.account.game.fetchNullable(gamePDA);
    if (result === null) {
      throw new Error("Game account not found");
    }
    console.log("result: ", JSON.stringify(result, null, 2));
  });
});

describe("bonk-paper-scissors: cancelled", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .BonkPaperScissors as Program<BonkPaperScissors>;

  let tokenCreator: anchor.web3.Keypair;
  let playerOne: anchor.web3.Keypair;
  let mint: anchor.web3.PublicKey;
  let ataOne: anchor.web3.PublicKey;
  let escrowOne: anchor.web3.PublicKey;
  let gamePDA: anchor.web3.PublicKey;
  let playerOneSalt: number[];
  let playerOneHash: number[];

  it("stage: first_player_move", async () => {
    // #region ----- SETUP -----
    const results = await createAndFundAccounts(program);
    tokenCreator = results.tokenCreator;
    playerOne = results.playerOne;

    const initializeMintResult = await initializeMint(program, tokenCreator);
    mint = initializeMintResult;

    const mintToPlayerOne = await mintTo(
      program,
      tokenCreator,
      playerOne.publicKey,
      mint,
      10_000
    );
    ataOne = mintToPlayerOne.ata;
    // #endregion ----- SETUP ----- END

    const getGamePDAResult = getGamePDA(
      playerOne.publicKey,
      program.programId,
      SECOND_GAME_ID
    );
    gamePDA = getGamePDAResult[0];
    const getEscrowPDAResult = getEscrowPDA(
      "first",
      gamePDA,
      program.programId
    );
    escrowOne = getEscrowPDAResult[0];

    const salt = generateSalt();
    playerOneSalt = [...salt];
    const hash = generateHash([...salt], 1);
    playerOneHash = [...hash];

    const txId = await program.methods
      .firstPlayerMove(SECOND_GAME_ID, new anchor.BN(1_000), playerOneHash)
      .accountsStrict({
        game: gamePDA,
        firstPlayer: playerOne.publicKey,
        firstPlayerEscrow: escrowOne,
        firstPlayerTokenAccount: ataOne,
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: SPL.TOKEN_PROGRAM_ID,
      })
      .signers([playerOne])
      .rpc();
    const result = await program.account.game.fetchNullable(gamePDA);
    if (result === null) {
      throw new Error("Game account not found");
    }
    console.log("txid: ", txId);
  });

  it("cancel", async () => {
    const tx = await program.methods
      .cancelGame(SECOND_GAME_ID)
      .accountsStrict({
        game: gamePDA,
        firstPlayer: playerOne.publicKey,
        firstPlayerEscrow: escrowOne,
        firstPlayerTokenAccount: ataOne,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: SPL.TOKEN_PROGRAM_ID,
      })
      .signers([playerOne])
      .rpc();
    const result = await program.account.game.fetchNullable(gamePDA);
    if (result) {
      throw new Error("Game account should not exist");
    }
    console.log("txid: ", tx);
  });
});

describe("bonk-paper-scissors: safety", () => {
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace
    .BonkPaperScissors as Program<BonkPaperScissors>;

  let tokenCreator: anchor.web3.Keypair;
  let playerOne: anchor.web3.Keypair;
  let mint: anchor.web3.PublicKey;
  let ataOne: anchor.web3.PublicKey;
  let escrowOne: anchor.web3.PublicKey;
  let gamePDA: anchor.web3.PublicKey;
  let playerOneSalt: number[];
  let playerOneHash: number[];

  it("stage: first_player_move", async () => {
    // #region ----- SETUP -----
    const results = await createAndFundAccounts(program);
    tokenCreator = results.tokenCreator;
    playerOne = results.playerOne;

    const initializeMintResult = await initializeMint(program, tokenCreator);
    mint = initializeMintResult;

    const mintToPlayerOne = await mintTo(
      program,
      tokenCreator,
      playerOne.publicKey,
      mint,
      10_000
    );
    ataOne = mintToPlayerOne.ata;
    // #endregion ----- SETUP ----- END

    const getGamePDAResult = getGamePDA(
      playerOne.publicKey,
      program.programId,
      SECOND_GAME_ID
    );
    gamePDA = getGamePDAResult[0];
    const getEscrowPDAResult = getEscrowPDA(
      "first",
      gamePDA,
      program.programId
    );
    escrowOne = getEscrowPDAResult[0];

    const salt = generateSalt();
    playerOneSalt = [...salt];
    const hash = generateHash([...salt], 1);
    playerOneHash = [...hash];

    const txId = await program.methods
      .firstPlayerMove(SECOND_GAME_ID, new anchor.BN(1_000), playerOneHash)
      .accountsStrict({
        game: gamePDA,
        firstPlayer: playerOne.publicKey,
        firstPlayerEscrow: escrowOne,
        firstPlayerTokenAccount: ataOne,
        mint: mint,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: SPL.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: SPL.TOKEN_PROGRAM_ID,
      })
      .signers([playerOne])
      .rpc();
    const result = await program.account.game.fetchNullable(gamePDA);
    if (result === null) {
      throw new Error("Game account not found");
    }
    console.log("txid: ", txId);
  });

  it("won't allow for external withdrawals from escrow", async () => {
    try {
      await SPL.transfer(
        program.provider.connection,
        playerOne,
        escrowOne,
        ataOne,
        gamePDA,
        1_000
      );
      throw new Error("Should not be able to withdraw from escrow");
    } catch (error) {
      if (error.message === "Should not be able to withdraw from escrow") {
        throw error;
      } else if (error.message === "Signature verification failed") {
        console.log("All good, this should fail");
      }
    }
  });
});
