"use client"; // Директива, що вказує, що цей файл є клієнтським (виконується на стороні клієнта)

// Імпорт ReactNode для роботи з дітьми компонентів
import { ReactNode } from "react";

// Імпорт кнопки гаманця з провайдера Solana Wallet
import { WalletButton } from "@/components/providers/solana-wallet-provider";

// Імпорт хука для отримання поточного шляху
import { usePathname } from "next/navigation";

// Імпорт компонента Link для навігації між сторінками
import Link from "next/link";

// Імпорт контексту провайдера Anchor
import { useAnchorProviderContext } from "@/components/providers/anchor-context-wrapper";

// Імпорт типу Pz2Onchain для роботи з програмою Anchor
import { Pz2Onchain } from "@/pz_2_onchain";

// Імпорт хука для отримання соціального акаунта
import { useSocialAccount } from "@/utils/query-hooks";

// Імпорт стилів для компонента
import styles from "./ui-layout.module.css";

// Компонент UiLayout для побудови інтерфейсу
export const UiLayout = ({ children }: { children: ReactNode }) => {
    // Визначаємо посилання для навігації
    const links = {
        dashboard: { label: "Dashboard", path: "/" }, // Головна сторінка
        registration: { label: "Registration", path: "/registration" }, // Сторінка реєстрації
    };

    // Отримуємо провайдера та програму з контексту Anchor
    const { provider, program } = useAnchorProviderContext<Pz2Onchain>();

    // Отримуємо поточний шлях
    const pathname = usePathname();

    // Використовуємо хук для отримання соціального акаунта
    const { data: socialAccountPublicKey, isLoading, error } = useSocialAccount(program, provider);

    // Функція для відображення посилань навігації
    const renderNavigationLinks = () => {
        // Якщо немає провайдера, користувач знаходиться на сторінці реєстрації, або дані ще завантажуються — не показувати нічого
        if (!provider || pathname === links.registration.path || isLoading || error) return <></>;

        // Якщо немає публічного ключа соціального акаунта — показати посилання на реєстрацію
        if (!socialAccountPublicKey) {
            return (
                <li className={styles.uiLayoutHeaderLi}>
                    <Link href={links.registration.path}>{links.registration.label}</Link>
                </li>
            );
        }

        // Інакше не показувати додаткових посилань
        return <></>;
    };

    return (
        <div className={styles.uiLayout}> {/* Основний контейнер компонента */}
            <header className={styles.uiLayoutHeader}> {/* Заголовок сторінки */}
                <div className={styles.walletButton}> {/* Кнопка для роботи з гаманцем */}
                    <WalletButton/>
                </div>
                <nav className={styles.uiLayoutNav}> {/* Панель навігації */}
                    <ul>
                        {/* Посилання на головну сторінку */}
                        <li className={styles.uiLayoutHeaderLi}>
                            <Link href={links.dashboard.path}>{links.dashboard.label}</Link>
                        </li>
                        {/* Відображення додаткових посилань */}
                        {renderNavigationLinks()}
                    </ul>
                </nav>
            </header>
            <main className={styles.uiLayoutContent}> {/* Основний контент сторінки */}
                {provider || pathname === links.dashboard.path ? (
                    children // Відображаємо контент, якщо є провайдер або користувач на головній сторінці
                ) : (
                    <p>Please connect your wallet to access this content.</p> // Повідомлення, якщо гаманець не підключено
                )}
            </main>
        </div>
    );
};
