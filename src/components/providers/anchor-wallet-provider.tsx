"use client"

import React, {ReactNode} from "react";
import {AnchorContextWrapper} from "@/components/providers/anchor-context-wrapper";
import {useAnchorWallet} from "@solana/wallet-adapter-react";
import '@solana/wallet-adapter-react-ui/styles.css';
import {Idl} from "@coral-xyz/anchor";

export const AnchorWalletProvider = ({endpoint, idl, children,}: {endpoint: string, idl: Idl; children: ReactNode; }) => {
    const wallet = useAnchorWallet();
    return (
        <AnchorContextWrapper wallet={wallet} endpoint={endpoint} idl={idl}>
            {children}
        </AnchorContextWrapper>
    );
};