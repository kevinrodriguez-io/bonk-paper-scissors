export const getChoiceKey = (gamePubkey: string, playerPubKey: string) =>
  `CHOICE:${gamePubkey}|${playerPubKey}`;

export const getSaltKey = (gamePubkey: string, playerPubKey: string) =>
  `SALT:${gamePubkey}|${playerPubKey}`;
