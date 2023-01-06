export type TokenAmount = {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
};

export type DelegatedAmount = {
  amount: string;
  decimals: number;
  uiAmount: number;
  uiAmountString: string;
};

export type Info = {
  tokenAmount: TokenAmount;
  delegate: string;
  delegatedAmount: DelegatedAmount;
  state: string;
  isNative: boolean;
  mint: string;
  owner: string;
};

export type TokenAccounts = {
  accountType: string;
  info: Info;
  type: string;
};
