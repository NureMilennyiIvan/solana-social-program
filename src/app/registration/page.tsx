"use client"; // Директива для вказівки, що код виконується на стороні клієнта

// Імпортуємо необхідні бібліотеки та компоненти
import React, { useEffect, useState } from "react"; // React та хуки для управління станом і ефектами
import { useProgramWithProvider } from "@/components/providers/anchor-context-wrapper"; // Хук для отримання провайдера та програми Anchor
import { Pz2Onchain } from "@/pz_2_onchain"; // Тип програми Anchor
import { useRouter } from "next/navigation"; // Навігаційний хук
import { initializeSocialAccount } from "@/utils/social-utils"; // Функція для ініціалізації соціального акаунта
import { useQueryClient } from "@tanstack/react-query"; // React Query для управління станом запитів
import styles from "./page.module.css"; // Стили сторінки
import { useSocialAccount } from "@/utils/query-hooks"; // Хук для отримання соціального акаунта

// Компонент Registration
export default function Registration() {
    // Отримання провайдера та програми Anchor
    const { provider, program } = useProgramWithProvider<Pz2Onchain>();

    // Отримання соціального акаунта користувача
    const { data: socialAccountPublicKey } = useSocialAccount(program, provider);

    // Ініціалізація роутера для навігації
    const router = useRouter();

    // Клієнт запитів React Query
    const queryClient = useQueryClient();

    // Локальні стани
    const [nickname, setNickname] = useState(""); // Для введення нікнейму
    const [isSubmitting, setIsSubmitting] = useState(false); // Для стану кнопки під час відправки
    const [error, setError] = useState<string | null>(null); // Для відображення помилок

    // Перенаправлення на головну сторінку, якщо соціальний акаунт уже існує
    useEffect(() => {
        if (socialAccountPublicKey) {
            router.push("/"); // Перехід на головну сторінку
        }
    }, [socialAccountPublicKey]);

    // Обробка відправки форми
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // Запобігаємо стандартній поведінці форми
        setIsSubmitting(true); // Вмикаємо стан завантаження
        setError(null); // Скидаємо попередні помилки

        try {
            // Ініціалізуємо соціальний акаунт
            const socialAccountPublicKey = await initializeSocialAccount(nickname, program, provider);
            console.log("Social account created:", socialAccountPublicKey.toBase58());

            // Оновлюємо кеш запитів
            await queryClient.invalidateQueries({
                queryKey: ["socialAccount", provider.connection.rpcEndpoint, provider.publicKey.toBase58()],
            });

            // Переходимо на головну сторінку
            router.push("/");
        } catch (err) {
            console.error("Failed to initialize social account:", err); // Логування помилки
            setError("Failed to create social account. Please try again."); // Встановлюємо текст помилки
        } finally {
            setIsSubmitting(false); // Вимикаємо стан завантаження
        }
    };

    return (
        <div className={styles.registrationContainer}> {/* Контейнер сторінки */}
            <h1>Register Your Social Account</h1> {/* Заголовок */}
            <form onSubmit={handleSubmit} className={styles.registrationForm}> {/* Форма реєстрації */}
                <div>
                    <label htmlFor="nickname">Nickname</label> {/* Поле для введення нікнейму */}
                    <input
                        id="nickname" // ID поля
                        type="text" // Тип поля
                        value={nickname} // Значення з локального стану
                        onChange={(e) => setNickname(e.target.value)} // Оновлення стану при введенні
                        required // Поле є обов'язковим
                        placeholder="Enter your nickname" // Підказка
                        className={styles.registrationInput} // Стиль поля
                    />
                </div>
                <button
                    type="submit" // Тип кнопки
                    disabled={isSubmitting} // Блокування кнопки під час відправки
                    className={styles.registrationButton} // Стиль кнопки
                >
                    {isSubmitting ? "Registering..." : "Register"} {/* Змінюємо текст кнопки */}
                </button>
            </form>
            {error && <p className={styles.errorMessage}>{error}</p>} {/* Відображення помилки, якщо вона є */}
        </div>
    );
}
