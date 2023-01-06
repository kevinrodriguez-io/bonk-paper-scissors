import { web3 } from "@project-serum/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";

export type AnchorHookDependencies = {
  connection: web3.Connection;
  wallet: AnchorWallet;
};
