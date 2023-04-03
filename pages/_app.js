import "../styles/globals.css";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { RPC_ENDPOINT } from "../utils";

//Wallet Imports
import {
  ConnextionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react"; //Conecction
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui"; //Select wallet
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets"; //Phantom wallet
import "@solana/wallet-adapter-react-ui/styles.css"; //Styles

const WalletConnectionProvider = dynamic(
  () => import("../context/WalletConnectionProvider"),
  {
    ssr: false,
  }
);

function MyApp({ Component, pageProps }) {
  const [mounted, setMounted] = useState(false);

  // // In order to fix SSR error with Next
  // useEffect(() => {
  //   setMounted(true);
  // }, []);

  return (
    <WalletConnectionProvider>
      {<Component {...pageProps} />}
    </WalletConnectionProvider>
  );
}

export default MyApp;
