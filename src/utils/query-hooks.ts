// Імпортуємо необхідні бібліотеки та компоненти
import { AnchorProvider, Program } from "@coral-xyz/anchor"; // Бібліотека Anchor для Solana
import { Pz2Onchain } from "@/pz_2_onchain"; // Тип програми Anchor
import { useMutation, useQuery } from "@tanstack/react-query"; // Бібліотека React Query для управління станом запитів
import {
    createPostAccount,
    deletePostAccount,
    socialUtils,
    fetchValidSocialAccountPubkey,
    updatePostAccount
} from "@/utils/social-utils"; // Функції для взаємодії з акаунтами
import { PublicKey } from "@solana/web3.js"; // PublicKey для роботи з Solana
import { Post } from "@/app/types/post"; // Тип поста

// Хук для отримання соціального акаунта користувача
export const useSocialAccount = (program: Program<Pz2Onchain>, provider: AnchorProvider | undefined) => {
    return useQuery({
        queryKey: ["socialAccount", provider?.connection.rpcEndpoint, provider?.publicKey.toBase58()], // Унікальний ключ для кешування
        queryFn: async (): Promise<PublicKey | null> => await fetchValidSocialAccountPubkey(program, provider), // Запит для отримання соціального акаунта
        enabled: !!provider, // Виконувати запит тільки якщо є провайдер
        staleTime: 120000, // Час, протягом якого дані вважаються свіжими
        refetchOnWindowFocus: false, // Не перезапитувати дані при фокусі вікна
        retry: 1 // Кількість повторних спроб у разі помилки
    });
};

// Хук для отримання всіх постів
export const usePostAccounts = (program: Program<Pz2Onchain>) => {
    return useQuery({
        queryKey: ["posts", program.programId.toBase58()], // Унікальний ключ для кешування
        queryFn: async () => await socialUtils(program), // Запит для отримання постів
        staleTime: 20000, // Час, протягом якого дані вважаються свіжими
        refetchOnWindowFocus: false, // Не перезапитувати дані при фокусі вікна
        retry: 1 // Кількість повторних спроб у разі помилки
    });
};

// Хук для створення нового поста
export const useCreatePostAccount = (
    program: Program<Pz2Onchain>, // Програма Anchor
    provider: AnchorProvider | undefined, // Провайдер Anchor
    onSuccessFn: () => Promise<void> // Функція, яка викликається після успішного створення
) => {
    return useMutation({
        mutationFn: async (content: string) => {
            if (!provider) throw new Error("Provider or program is undefined."); // Перевірка наявності провайдера
            if (!content.trim()) throw new Error("Post content cannot be empty."); // Перевірка на порожній контент
            return await createPostAccount(content, program, provider); // Виклик функції створення поста
        },
        onSuccess: async () => await onSuccessFn(), // Викликається при успішному завершенні
        onError: (err) => {} // Обробка помилки (за потреби)
    });
};

// Хук для оновлення існуючого поста
export const useUpdatePostAccount = (
    program: Program<Pz2Onchain>, // Програма Anchor
    provider: AnchorProvider | undefined, // Провайдер Anchor
    onSuccessFn: () => Promise<void> // Функція, яка викликається після успішного оновлення
) => {
    return useMutation({
        mutationFn: async ({ content, post }: { content: string; post: Post }) => {
            if (!provider) throw new Error("Provider is undefined."); // Перевірка наявності провайдера
            await updatePostAccount(content, post.pubkey, program, provider); // Виклик функції оновлення поста
        },
        onSuccess: async () => await onSuccessFn(), // Викликається при успішному завершенні
        onError: (err) => {} // Обробка помилки (за потреби)
    });
};

// Хук для видалення існуючого поста
export const useDeletePostAccount = (
    program: Program<Pz2Onchain>, // Програма Anchor
    provider: AnchorProvider | undefined, // Провайдер Anchor
    onSuccessFn: () => Promise<void> // Функція, яка викликається після успішного видалення
) => {
    return useMutation({
        mutationFn: async (post: Post) => {
            if (!provider) throw new Error("Provider or program is undefined."); // Перевірка наявності провайдера
            await deletePostAccount(post.pubkey, program, provider); // Виклик функції видалення поста
        },
        onSuccess: async () => await onSuccessFn(), // Викликається при успішному завершенні
        onError: (err) => {} // Обробка помилки (за потреби)
    });
};
