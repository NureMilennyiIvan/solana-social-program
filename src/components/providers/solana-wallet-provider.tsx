"use client"

import dynamic from "next/dynamic";
import React, {ReactNode, useMemo} from "react";
import {WalletAdapterNetwork} from "@solana/wallet-adapter-base";
import {clusterApiUrl, Connection} from "@solana/web3.js";
import {PhantomWalletAdapter} from "@solana/wallet-adapter-phantom";
import {ConnectionProvider, WalletProvider} from "@solana/wallet-adapter-react";
import {WalletModalProvider} from "@solana/wallet-adapter-react-ui";

export const WalletButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, {
    ssr: false,
})
export const SolanaWalletProvider = ({endpoint, children }: {endpoint: string, children: ReactNode}) => {
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [endpoint]
    );
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};