import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { useMemo, useState, useEffect } from "react";
import {RPC_ENDPOINT} from "../utils/constants"
//Provider para la App
const WalletConnectionProvider = ({ children }) => {

  //Wallet by phantom
  const wallet = useMemo(() => [new PhantomWalletAdapter()], []);

  // In order to fix SSR error with Next
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ConnectionProvider
      endpoint={RPC_ENDPOINT}
      config={{ commitment: "confirmed" }}
    >
      <WalletProvider wallets={wallet}>
        <WalletModalProvider>{mounted && children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletConnectionProvider;
