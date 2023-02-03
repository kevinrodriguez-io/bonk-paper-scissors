import { web3 } from "@project-serum/anchor";
import { heliusAPI } from "./api";

export type GetNamesResponse = {
  domainNames: string[];
};

export const getNames = async (address: web3.PublicKey) => {
  const result = await heliusAPI.get<GetNamesResponse>(
    `/v0/addresses/${address.toBase58()}/names`
  );
  return result.data.domainNames;
};
