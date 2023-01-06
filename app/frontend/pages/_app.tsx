import "@solana/wallet-adapter-react-ui/styles.css";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
import { ToastContainer } from "react-toastify";
import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SalmonWalletAdapter,
  GlowWalletAdapter,
  CoinbaseWalletAdapter,
  HuobiWalletAdapter,
} from "@solana/wallet-adapter-wallets";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

const BPSApp = ({ Component, pageProps }: AppProps) => {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC_URL!, []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new SalmonWalletAdapter({ network }),
      new GlowWalletAdapter({ network }),
      new CoinbaseWalletAdapter(),
      new HuobiWalletAdapter(),
    ],
    []
  );

  return (
    <>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <Component {...pageProps} />;
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
      <ToastContainer
        hideProgressBar
        position={"bottom-right"}
        className="bottom-4 w-full max-w-full font-sans text-sm text-white sm:right-4 sm:left-auto sm:w-96 sm:translate-x-0 "
        toastClassName="bg-gray-900 bg-opacity-80 text-white rounded-lg items-center"
        closeButton={
          <button className="text-white font-bold text-xl mr-2 backdrop-blur-sm">
            <span className="sr-only">Close</span>
            <span aria-hidden="true">&times;</span>
          </button>
        }
      />
    </>
  );
};

export default BPSApp;
