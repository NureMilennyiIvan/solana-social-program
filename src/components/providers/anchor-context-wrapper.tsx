"use client";

import React, {createContext, useContext, useMemo} from "react";
import {AnchorProvider, Idl, Program} from "@coral-xyz/anchor";
import { AnchorWallet } from "@solana/wallet-adapter-react";
import {Connection} from "@solana/web3.js";

type AnchorProviderContext<T extends Idl = Idl> = {
    provider: AnchorProvider | undefined;
    program: Program<T> ;
};

const AnchorContext = createContext<AnchorProviderContext | undefined>(undefined);

export const AnchorContextWrapper = ({wallet, endpoint, idl, children,}: {
    wallet: AnchorWallet | undefined;
    endpoint: string,
    idl: Idl;
    children: React.ReactNode;
}) => {
    const connection = useMemo(() => new Connection(endpoint, "processed"), [endpoint]);
    const getProvider = (wallet: AnchorWallet | undefined) => {
        if (!wallet) return undefined;
        return new AnchorProvider(connection, wallet, { preflightCommitment: "processed" });
    };

    const getProgram = (idl: Idl, provider: AnchorProvider | undefined) => {
        if (!provider){
            return new Program(idl, {connection})
        }
        return new Program(idl, provider);
    };

    const provider = useMemo(() => getProvider(wallet), [wallet]);
    const program = useMemo(() => getProgram(idl, provider), [provider, idl]);

    return (
        <AnchorContext.Provider value={{provider, program}}>
            {children}
        </AnchorContext.Provider>
    );
};

export const useProgram = <T extends Idl = Idl>() => {
    const context = useContext(AnchorContext);
    if (!context) {
        throw new Error("AnchorContext is not initialized.");
    }
    return context.program as unknown as Program<T>;
};
export const useProvider = () => {
    const context = useContext(AnchorContext);
    if (!context) {
        throw new Error("AnchorContext is not initialized.");
    }
    return context.provider;
};
export const useAnchorProviderContext = <T extends Idl = Idl>() => {

    const context = useContext(AnchorContext);
    if (!context) {
        throw new Error("AnchorProviderContext is not initialized.");
    }
    return context as unknown as AnchorProviderContext<T>;
};

export const useHasProvider = () => {
    const context = useContext(AnchorContext);
    return !!context?.provider;
};

export const useProgramWithProvider = <T extends Idl = Idl>() => {

    const context = useContext(AnchorContext);
    if (!context) {
        throw new Error("AnchorContext is not initialized!");
    }
    if (!context.provider) {
        throw new Error("AnchorProvider is not initialized!");
    }
    return {
        program: context.program as unknown as Program<T>,
        provider: context.provider,
    };
};