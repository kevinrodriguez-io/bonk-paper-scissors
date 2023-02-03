import { web3 } from "@project-serum/anchor";

export const MINT = process.env.NEXT_PUBLIC_MINT!;
export const BONK_PAPER_SCISSORS_PROGRAM_ID =
  process.env.NEXT_PUBLIC_BPS_PROGRAM_ID!;
export const BPS_TREASURY = process.env.NEXT_PUBLIC_BPS_TREASURY!;
export const HELIUS_API_KEY = process.env.NEXT_PUBLIC_HELIUS_API_KEY!;

export const getBPSProgramId = () =>
  new web3.PublicKey(BONK_PAPER_SCISSORS_PROGRAM_ID);

export const getMintPubKey = () => new web3.PublicKey(MINT);

export const getBPSTreasuryPubKey = () => new web3.PublicKey(BPS_TREASURY);
