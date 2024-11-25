// Імпортуємо тип Metadata для метаданих та функцію localFont для підключення локальних шрифтів з бібліотеки "next"
import type { Metadata } from "next";
import localFont from "next/font/local";

// Імпортуємо глобальні стилі
import "./globals.css";

// Імпортуємо React та тип ReactNode для роботи з дітьми компонентів
import React, {ReactNode} from "react";

// Імпортуємо провайдери гаманців Solana та Anchor
import {SolanaWalletProvider} from "@/components/providers/solana-wallet-provider";
import {AnchorWalletProvider} from "@/components/providers/anchor-wallet-provider";

// Імпортуємо компонент UiLayout для розміщення інтерфейсу
import {UiLayout} from "@/app/ui-layout";

// Імпортуємо IDL файл для Anchor і тип Idl
import idl from "../../pz_2_onchain.json";
import {Idl} from "@coral-xyz/anchor";

// Імпортуємо ReactQueryProvider для керування станом запитів
import {ReactQueryProvider} from "@/components/providers/react-query-provider";

// Підключаємо локальний шрифт GeistSans
const geistSans = localFont({
    src: "./fonts/GeistVF.woff", // Шлях до файлу шрифту
    variable: "--font-geist-sans", // CSS-змінна для шрифту
    weight: "100 900", // Діапазон ваги шрифту
});

// Підключаємо локальний шрифт GeistMono
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff", // Шлях до файлу шрифту
    variable: "--font-geist-mono", // CSS-змінна для шрифту
    weight: "100 900", // Діапазон ваги шрифту
});

// Визначаємо метадані сторінки
export const metadata: Metadata = {
    title: "Solana Social Network", // Заголовок сторінки
    description: "Solana Social Network", // Опис сторінки
};

// Основний компонент макета сторінки
export default function RootLayout ({children}: Readonly<{ children: ReactNode; }>) {
    const endpoint = "https://api.devnet.solana.com";
    //const endpoint = "http://localhost:8899";
    return (
        <html lang="en"> {/* Встановлюємо мову документа */}
            <body className={`${geistSans.variable} ${geistMono.variable}`}> {/* Додаємо CSS-змінні шрифтів до тіла сторінки */}
            {/* Провайдер для React Query */}
            <ReactQueryProvider>
                {/* Провайдер для роботи з гаманцями Solana */}
                <SolanaWalletProvider endpoint={endpoint}>
                    {/* Провайдер Anchor Wallet */}
                    <AnchorWalletProvider endpoint={endpoint} idl={idl as Idl}>
                        {/* Компонент макета для дітей */}
                        <UiLayout>{children}</UiLayout>
                    </AnchorWalletProvider>
                </SolanaWalletProvider>
            </ReactQueryProvider>
            </body>
        </html>
    );
}
