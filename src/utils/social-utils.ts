// Імпортуємо необхідні модулі та типи з бібліотек
import { AnchorProvider, Program, web3 } from "@coral-xyz/anchor"; // Anchor SDK для роботи з програмами Solana
import { PublicKey } from "@solana/web3.js"; // Тип для роботи з публічними ключами Solana
import { Post } from "@/app/types/post"; // Тип поста
import { Pz2Onchain } from "@/pz_2_onchain"; // Тип програми Anchor
import BN from "bn.js"; // Бібліотека для роботи з великими числами

// Функція для отримання соціального акаунта
export const fetchSocialAccount = async (program: Program<Pz2Onchain>, publicKey: PublicKey) => {
    // Генеруємо PDA (Program Derived Address) соціального акаунта
    const socialAccountPdaPublicKey = PublicKey.findProgramAddressSync([publicKey.toBuffer()], program.programId)[0];
    // Отримуємо дані соціального акаунта
    const socialAccountPda = await program.account.socialAccount.fetchNullable(socialAccountPdaPublicKey);
    return { socialAccountPda, socialAccountPdaPublicKey }; // Повертаємо акаунт та його PDA
};

// Функція для перевірки наявності дійсного соціального акаунта
export const fetchValidSocialAccountPubkey = async (program: Program<Pz2Onchain>, provider: AnchorProvider | undefined) => {
    if (!provider) {
        return null; // Якщо провайдер не визначено, повертаємо null
    }
    const { socialAccountPda, socialAccountPdaPublicKey } = await fetchSocialAccount(program, provider.publicKey);
    return socialAccountPda ? socialAccountPdaPublicKey : null; // Повертаємо PDA акаунта або null
};

// Функція для отримання всіх постів
export const socialUtils = async (program: Program<Pz2Onchain>) => {
    // Паралельно отримуємо всі соціальні акаунти та пости
    const [socialAccountResults, postAccountResults] = await Promise.all([
        program.account.socialAccount.all(),
        program.account.postAccount.all(),
    ]);

    // Зберігаємо соціальні акаунти у вигляді мапи для швидкого доступу
    const socialAccounts = new Map<string, { owner: PublicKey; nickname: string }>();
    socialAccountResults.forEach(({ publicKey, account }) => {
        socialAccounts.set(publicKey.toBase58(), {
            owner: account.owner,
            nickname: account.nickname,
        });
    });

    const posts: Post[] = [];
    // Формуємо масив постів
    postAccountResults.forEach(({ publicKey, account }) => {
        const socialAccount = socialAccounts.get(account.author.toBase58()); // Знаходимо автора поста
        if (socialAccount) {
            // Створюємо об'єкт поста
            const post = new Post(
                publicKey,
                socialAccount.owner,
                socialAccount.nickname,
                account.postId.toNumber(),
                account.content,
                account.timestamp.toNumber()
            );
            posts.push(post); // Додаємо пост до списку
        } else {
            throw new Error("PostAccount's author missing!"); // Помилка, якщо автора не знайдено
        }
    });

    // Сортуємо пости за датою (новіші першими)
    posts.sort((a, b) => b.timestamp - a.timestamp);
    return posts;
};

// Функція для отримання постів конкретного користувача
export const fetchUsersPostAccounts = async (program: Program<Pz2Onchain>, provider: AnchorProvider) => {
    const { socialAccountPda, socialAccountPdaPublicKey } = await fetchSocialAccount(program, provider.publicKey);
    if (!socialAccountPda) {
        throw new Error("PostAccount's author missing!"); // Помилка, якщо соціального акаунта немає
    }

    const postCountNumber = socialAccountPda.postCount.toNumber(); // Отримуємо кількість постів
    if (postCountNumber > Number.MAX_SAFE_INTEGER) {
        throw new Error("postCount exceeds JavaScript's safe integer limit"); // Помилка, якщо кількість постів перевищує межу
    }

    // Генеруємо PDA для кожного поста користувача
    const postAccountsPdaPublicKeys = Array.from({ length: postCountNumber })
        .map((_, index) => postCountNumber - 1 - index) // Реверс порядку
        .map((reversedIndex) => {
            return PublicKey.findProgramAddressSync(
                [socialAccountPdaPublicKey.toBuffer(), Buffer.from(new BN(reversedIndex).toArray("le", 8))],
                program.programId
            )[0];
        });

    // Отримуємо дані для кожного поста
    return (await program.account.postAccount.fetchMultiple(postAccountsPdaPublicKeys))
        .flatMap((result, index) => {
            return !!result ? [{ account: result, publicKey: postAccountsPdaPublicKeys[index] }] : [];
        })
        .map(({ account, publicKey }) => {
            // Створюємо об'єкт поста
            return new Post(
                publicKey,
                socialAccountPda.owner,
                socialAccountPda.nickname,
                account.postId.toNumber(),
                account.content,
                account.timestamp.toNumber()
            );
        });
};

// Функція для ініціалізації соціального акаунта
export const initializeSocialAccount = async (nickname: string, program: Program<Pz2Onchain>, provider: AnchorProvider) => {
    const providerPublicKey = provider.publicKey; // Публічний ключ користувача
    const socialAccountPdaPublicKey = PublicKey.findProgramAddressSync([providerPublicKey.toBuffer()], program.programId)[0];
    const accounts = {
        signer: providerPublicKey,
        socialAccount: socialAccountPdaPublicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
    };

    // Викликаємо метод ініціалізації
    const transactionSignature = await program.methods.initializeSocialAccount(nickname).accounts(accounts).signers([]).rpc();
    console.log(transactionSignature);
    return socialAccountPdaPublicKey; // Повертаємо PDA акаунта
};

// Функція для створення поста
export const createPostAccount = async (content: string, program: Program<Pz2Onchain>, provider: AnchorProvider) => {
    const { socialAccountPda, socialAccountPdaPublicKey } = await fetchSocialAccount(program, provider.publicKey);
    if (!socialAccountPda) {
        throw new Error("SocialAccount isn't initialized!"); // Помилка, якщо акаунт не ініціалізовано
    }

    // Генеруємо PDA для поста
    const postAccountPdaPublicKey = PublicKey.findProgramAddressSync(
        [Buffer.from(socialAccountPda.postCount.toArray("le", 8)), socialAccountPdaPublicKey.toBuffer()],
        program.programId
    )[0];

    const accounts = {
        signer: provider.publicKey,
        socialAccount: socialAccountPdaPublicKey,
        postAccount: postAccountPdaPublicKey,
        rent: web3.SYSVAR_RENT_PUBKEY,
        systemProgram: web3.SystemProgram.programId,
    };

    // Викликаємо метод створення поста
    const transactionSignature = await program.methods.createPostAccount(content).accounts(accounts).signers([]).rpc();
    console.log(transactionSignature);
    return postAccountPdaPublicKey;
};

// Функція для оновлення поста
export const updatePostAccount = async (new_content: string, postAccountPdaPublicKey: PublicKey, program: Program<Pz2Onchain>, provider: AnchorProvider) => {
    const providerPublicKey = provider.publicKey; // Публічний ключ користувача
    const socialAccountPdaPublicKey = PublicKey.findProgramAddressSync([providerPublicKey.toBuffer()], program.programId)[0];
    const accounts = {
        signer: providerPublicKey,
        socialAccount: socialAccountPdaPublicKey,
        postAccount: postAccountPdaPublicKey,
    };

    // Викликаємо метод оновлення поста
    const transactionSignature = await program.methods.updatePostAccount(new_content).accounts(accounts).signers([]).rpc();
    console.log(transactionSignature);
};

// Функція для видалення поста
export const deletePostAccount = async (postAccountPdaPublicKey: PublicKey, program: Program<Pz2Onchain>, provider: AnchorProvider) => {
    const providerPublicKey = provider.publicKey; // Публічний ключ користувача
    const socialAccountPdaPublicKey = PublicKey.findProgramAddressSync([providerPublicKey.toBuffer()], program.programId)[0];
    const accounts = {
        signer: providerPublicKey,
        socialAccount: socialAccountPdaPublicKey,
        postAccount: postAccountPdaPublicKey,
        systemProgram: web3.SystemProgram.programId,
    };

    // Викликаємо метод видалення поста
    const transactionSignature = await program.methods.deletePostAccount().accounts(accounts).signers([]).rpc();
    console.log(transactionSignature);
};