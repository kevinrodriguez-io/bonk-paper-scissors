import { web3 } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getMintPubKey } from "../../constants/constants";
import { TokenAccounts } from "../../types/Token";

export const findTokenAccountPKForMintByOwner = async (
  connection: web3.Connection,
  ownerPublicKey: web3.PublicKey,
  mint: web3.PublicKey = getMintPubKey()
) =>
  (
    await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
      programId: TOKEN_PROGRAM_ID,
    })
  ).value.find((i) =>
    new web3.PublicKey(
      (i.account.data.parsed as TokenAccounts).info.mint
    ).equals(mint)
  )?.pubkey;

export const findTokenAccountForMintByOwnerPublicKeyFullData = async (
  connection: web3.Connection,
  ownerPublicKey: web3.PublicKey,
  mint: web3.PublicKey = getMintPubKey()
) =>
  (
    await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
      programId: TOKEN_PROGRAM_ID,
    })
  ).value.find((i) =>
    new web3.PublicKey(
      (i.account.data.parsed as TokenAccounts).info.mint
    ).equals(mint)
  )?.account.data.parsed as TokenAccounts | undefined;
