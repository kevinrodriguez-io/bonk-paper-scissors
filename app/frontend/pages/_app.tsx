import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";

import type { AppProps } from "next/app";
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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* <WalletMultiButton />
          <WalletDisconnectButton /> */}
          <Component {...pageProps} />;
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default BPSApp;
