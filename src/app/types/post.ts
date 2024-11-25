import {PublicKey} from "@solana/web3.js";
export class Post {
    readonly pubkey: PublicKey;
    readonly owner_nickname: string;
    readonly owner: PublicKey;
    readonly postId: number;
    readonly content: string;
    readonly timestamp: number;

    constructor(pubkey: PublicKey, owner: PublicKey, owner_nickname: string, post_id: number, content: string, timestamp: number) {
        this.pubkey = pubkey;
        this.owner_nickname = owner_nickname;
        this.owner = owner;
        this.postId = post_id;
        this.content = content;
        this.timestamp = timestamp * 1000;
    }
}