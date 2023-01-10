import { web3 } from "@project-serum/anchor";

export const MINT = process.env.NEXT_PUBLIC_MINT!;
export const BONK_PAPER_SCISSORS_PROGRAM_ID =
  process.env.NEXT_PUBLIC_BPS_PROGRAM_ID!;

export const GAME_ACCOUNT_OFFSET_FOR_GAME_STATE =
  8 + // Discriminator
  1 + // bump
  (4 + 32) + // game_id
  32 + // mint
  8 + // amount_to_match
  32 + // first_player
  32 + // first_player_hash
  32 + // first_player_escrow_address
  (1 + 1 + 1) + // first_player_choice
  (1 + 8) + // first_player_revealed_at
  (1 + 32) + // second_player
  (1 + 32) + // second_player_hash
  (1 + 32) + // second_player_escrow_address
  (1 + 1 + 1) + // second_player_choice
  (1 + 8) + // second_player_revealed_at
  (1 + 32) + // winner
  (1 + 32) + // loser
  (1 + 8) + // amount_won
  (1 + 8) + // amount_burned
  (1 + 8) + // drawn_at
  (1 + 0); // game_state

export const GAME_ACCOUNT_SIZE =
  8 + // Discriminator
  1 + // bump
  (4 + 32) + // game_id
  32 + // mint
  8 + // amount_to_match
  32 + // first_player
  32 + // first_player_hash
  32 + // first_player_escrow_address
  (1 + 1 + 1) + // first_player_choice
  (1 + 8) + // first_player_revealed_at
  (1 + 32) + // second_player
  (1 + 32) + // second_player_hash
  (1 + 32) + // second_player_escrow_address
  (1 + 1 + 1) + // second_player_choice
  (1 + 8) + // second_player_revealed_at
  (1 + 32) + // winner
  (1 + 32) + // loser
  (1 + 8) + // amount_won
  (1 + 8) + // amount_burned
  (1 + 8) + // drawn_at
  (1 + 1) + // game_state
  8 + // created_at
  253; // padding

export const getBPSProgramId = () =>
  new web3.PublicKey(BONK_PAPER_SCISSORS_PROGRAM_ID);

export const getMintPubKey = () => new web3.PublicKey(MINT);
