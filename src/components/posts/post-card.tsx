"use client";

import { Post } from "@/app/types/post";
import React from "react";
import styles from "./post-card.module.css";

export const PostCard = ({ post }: { post: Post }) => {
    return (
        <div className={styles.postItem}>
            <h3 className={styles.author}>{post.owner_nickname}</h3>
            <p className={styles.content}>{post.content}</p>
            <small className={styles.timestamp}>
                Timestamp: {new Date(post.timestamp).toLocaleString()}
            </small>
        </div>
    );
};