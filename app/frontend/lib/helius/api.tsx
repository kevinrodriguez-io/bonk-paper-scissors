import axios from "axios";
import { HELIUS_API_KEY } from "../../constants/constants";

export const heliusAPI = axios.create({
  baseURL: "https://api.helius.xyz/",
  params: {
    "api-key": HELIUS_API_KEY,
  },
});
