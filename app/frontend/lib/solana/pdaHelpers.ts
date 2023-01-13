import { web3 } from "@project-serum/anchor";

export const encode = (str: string) => new TextEncoder().encode(str);
export const b = (input: TemplateStringsArray) => encode(input.join(""));

export const getGamePDA = (
  firstPlayer: web3.PublicKey,
  gameId: string,
  programId: web3.PublicKey
) => {
  return web3.PublicKey.findProgramAddressSync(
    [b`game`, firstPlayer.toBytes(), encode(gameId)],
    programId
  );
};

export const getEscrowPDA = (
  player: "first" | "second",
  gamePDA: web3.PublicKey,
  programId: web3.PublicKey
) => {
  return web3.PublicKey.findProgramAddressSync(
    [
      gamePDA.toBytes(),
      b`escrow`,
      player === "first" ? b`first_player` : b`second_player`,
    ],
    programId
  );
};

export const getBPSSettingsPDAV2 = (programId: web3.PublicKey) => {
  return web3.PublicKey.findProgramAddressSync(
    [b`bps_settings_v2`],
    programId
  );
};
