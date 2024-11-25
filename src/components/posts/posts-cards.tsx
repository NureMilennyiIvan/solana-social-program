"use client"; // Директива для вказівки, що код виконується на стороні клієнта

// Імпортуємо необхідні бібліотеки та компоненти
import { Post } from "@/app/types/post"; // Тип поста
import React, { useEffect, useRef, useState } from "react"; // React і хуки
import { PostCard } from "./post-card"; // Компонент для відображення окремого поста
import { useQueryClient } from "@tanstack/react-query"; // React Query для керування станом запитів
import { useDeletePostAccount, useUpdatePostAccount } from "@/utils/query-hooks"; // Хуки для мутацій
import { useAnchorProviderContext } from "@/components/providers/anchor-context-wrapper"; // Хук для отримання провайдера та програми Anchor
import { Pz2Onchain } from "@/pz_2_onchain"; // Тип програми Anchor
import styles from "./posts-cards.module.css"; // Стили компоненту

// Компонент PostsCards
export const PostsCards = ({ posts }: { posts: Post[] }) => {
    const queryClient = useQueryClient(); // Ініціалізація клієнта запитів
    const { provider, program } = useAnchorProviderContext<Pz2Onchain>(); // Отримання провайдера та програми Anchor
    const [displayedPosts, setDisplayedPosts] = useState<Post[]>([]); // Стан для відображуваних постів
    const [isLoading, setIsLoading] = useState(false); // Стан завантаження постів
    const scrollContainerRef = useRef<HTMLDivElement>(null); // Референція на контейнер для скролу
    const chunkSize = 10; // Кількість постів, що завантажуються за раз

    // Ефект для ініціалізації початкового списку постів
    useEffect(() => {
        setDisplayedPosts(posts.slice(0, chunkSize));
    }, [posts]);

    // Обробник скролу для завантаження додаткових постів
    const handleScroll = () => {
        if (
            scrollContainerRef.current &&
            scrollContainerRef.current.scrollTop + scrollContainerRef.current.clientHeight >=
            scrollContainerRef.current.scrollHeight
        ) {
            loadMorePosts(); // Викликаємо функцію для завантаження більше постів
        }
    };

    // Завантаження більше постів
    const loadMorePosts = () => {
        if (!isLoading && displayedPosts.length < posts.length) {
            setIsLoading(true); // Встановлюємо стан завантаження
            setTimeout(() => {
                const nextPosts = posts.slice(
                    displayedPosts.length,
                    displayedPosts.length + chunkSize
                );
                setDisplayedPosts((prev) => [...prev, ...nextPosts]); // Додаємо нові пости
                setIsLoading(false); // Завершуємо завантаження
            }, 500); // Імітуємо затримку
        }
    };

    // Мутації для оновлення та видалення постів
    const updateMutation = useUpdatePostAccount(program, provider, () =>
        queryClient.invalidateQueries({ queryKey: ["posts", program.programId.toBase58()] })
    );
    const deleteMutation = useDeletePostAccount(program, provider, () =>
        queryClient.invalidateQueries({ queryKey: ["posts", program.programId.toBase58()] })
    );

    // Обробник оновлення поста
    const handleUpdate = (post: Post) => {
        const newContent = prompt("Enter new content:", post.content); // Відкриваємо вікно для введення нового контенту
        if (newContent) {
            updateMutation.mutate({ content: newContent, post }); // Викликаємо мутацію оновлення
        }
    };

    // Обробник видалення поста
    const handleDelete = (post: Post) => {
        if (confirm("Are you sure you want to delete this post?")) { // Підтвердження видалення
            deleteMutation.mutate(post); // Викликаємо мутацію видалення
        }
    };

    return (
        <div
            ref={scrollContainerRef} // Встановлюємо референцію для контейнера скролу
            className={styles.scrollContainer} // Додаємо стилі
            onScroll={handleScroll} // Додаємо обробник скролу
        >
            <ul>
                {displayedPosts.map((post) => (
                    <li key={post.postId} className={styles.postItem}> {/* Рендеримо кожен пост */}
                        <PostCard post={post} /> {/* Компонент для відображення поста */}
                        {provider?.publicKey?.equals(post.owner) && ( // Перевірка, чи пост належить поточному користувачу
                            <div className={styles.actions}>
                                <button
                                    onClick={() => handleUpdate(post)} // Кнопка оновлення поста
                                    disabled={updateMutation.isPending} // Блокування кнопки під час оновлення
                                >
                                    {updateMutation.isPending ? "Updating..." : "Edit"} {/* Динамічний текст кнопки */}
                                </button>
                                <button
                                    onClick={() => handleDelete(post)} // Кнопка видалення поста
                                    disabled={deleteMutation.isPending} // Блокування кнопки під час видалення
                                >
                                    {deleteMutation.isPending ? "Deleting..." : "Delete"} {/* Динамічний текст кнопки */}
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
