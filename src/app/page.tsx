"use client"; // Директива, яка вказує, що цей файл виконується на стороні клієнта

// Імпорт компонентів та бібліотек
import { PostsCards } from "@/components/posts/posts-cards"; // Компонент для відображення постів
import React, { useState } from "react"; // React та хук useState для управління станом
import { useAnchorProviderContext } from "@/components/providers/anchor-context-wrapper"; // Контекст провайдера Anchor
import { Pz2Onchain } from "@/pz_2_onchain"; // Тип програми Anchor
import { useQueryClient } from "@tanstack/react-query"; // React Query для управління станом запитів
import { useCreatePostAccount, usePostAccounts, useSocialAccount } from "@/utils/query-hooks"; // Хуки для роботи із запитами
import styles from "./page.module.css"; // Стилі компонента

// Основна функція Dashboard
export default function Dashboard() {
    // Отримання провайдера та програми Anchor із контексту
    const { provider, program } = useAnchorProviderContext<Pz2Onchain>();

    // Отримання соціального акаунта користувача
    const { data: socialAccountPublicKey } = useSocialAccount(program, provider);

    // Ініціалізація клієнта запитів React Query
    const queryClient = useQueryClient();

    // Локальний стан для вмісту нового поста
    const [newPostContent, setNewPostContent] = useState<string>("");

    // Отримання постів із програми
    const { data: posts, isLoading: isPostsLoading, error: postsLoadingError } = usePostAccounts(program);

    // Мутація для створення нового поста
    const createPostMutation = useCreatePostAccount(
        program, // Програма Anchor
        provider, // Провайдер
        () => queryClient.invalidateQueries({ queryKey: ["posts", program.programId.toBase58()] }) // Оновлення кешу запитів після створення поста
    );

    // Обробник створення нового поста
    const handleCreatePost = () => {
        setNewPostContent(""); // Скидаємо вміст текстового поля
        createPostMutation.mutate(newPostContent); // Викликаємо мутацію з вмістом поста
    };

    return (
        <div>
            {/* Відображення форми створення поста, якщо є соціальний акаунт */}
            {socialAccountPublicKey && (
                <div className={styles.createPostContainer}>
                    <h3>Create a new post</h3>
                    <textarea
                        value={newPostContent} // Значення текстового поля
                        onChange={(e) => setNewPostContent(e.target.value)} // Оновлення стану при зміні тексту
                        placeholder="Write your post content here..." // Підказка для користувача
                        rows={4} // Кількість рядків у текстовому полі
                        className={styles.textarea} // Стилі текстового поля
                    ></textarea>
                    <button
                        onClick={handleCreatePost} // Обробник кліку
                        disabled={createPostMutation.isPending} // Блокування кнопки під час створення поста
                        className={styles.createPostButton} // Стилі кнопки
                    >
                        {createPostMutation.isPending ? "Creating..." : "Create Post"} {/* Змінюємо текст кнопки */}
                    </button>
                </div>
            )}

            {/* Відображення повідомлень про помилки */}
            <div className={styles.errorMessage}>
                {createPostMutation.error && <p>{createPostMutation.error.message}</p>} {/* Помилка створення поста */}
                {postsLoadingError && <p>{postsLoadingError.message}</p>} {/* Помилка завантаження постів */}
            </div>

            {/* Відображення постів або повідомлення про завантаження */}
            {isPostsLoading ? <p>Loading posts...</p> : <PostsCards posts={posts || []} />}
        </div>
    );
}
