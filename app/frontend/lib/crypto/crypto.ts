import { encode } from "bs58";
import { Choice } from "../../types/Choice";
import { choiceToNumber } from "../choice";

export type SaltResult = ReturnType<typeof getSalt>;

export const getSalt = () => {
  const randomBytes = window.crypto.getRandomValues(new Uint8Array(32));
  const bytesBs58 = encode(randomBytes);
  return { bytesBs58, randomBytes };
};

export type HashResult = ReturnType<typeof getHash>;

export const getHash = async (salt: SaltResult, choice: Choice) => {
  const choiceNumber = choiceToNumber(choice);
  const totalBytes = [choiceNumber, ...salt.randomBytes];
  if (totalBytes.length !== 33) {
    throw new Error("Invalid total bytes length");
  }
  const bytes = await window.crypto.subtle.digest(
    "SHA-256",
    new Uint8Array(totalBytes)
  );
  const hash = new Uint8Array(bytes);
  const bytesBs58 = encode(hash);
  return { bytesBs58, hash };
};
