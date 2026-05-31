<script lang="ts">
    import Icon from "@iconify/svelte";
    import { onMount } from "svelte";

    interface Props {
        slug: string;
    }

    let { slug }: Props = $props();

    let likes = $state(0);
    let dislikes = $state(0);
    let userVote = $state<"like" | "dislike" | null>(null);

    const storageKey = `post-rating-${slug}`;

    function loadFromStorage() {
        if (typeof window === "undefined") return;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const data = JSON.parse(saved);
            likes = data.likes || 0;
            dislikes = data.dislikes || 0;
            userVote = data.userVote || null;
        }
    }

    function saveToStorage() {
        if (typeof window === "undefined") return;
        localStorage.setItem(storageKey, JSON.stringify({ likes, dislikes, userVote }));
    }

    function vote(type: "like" | "dislike") {
        if (userVote === type) {
            if (type === "like") likes = Math.max(0, likes - 1);
            else dislikes = Math.max(0, dislikes - 1);
            userVote = null;
        } else {
            if (userVote === "like") likes = Math.max(0, likes - 1);
            else if (userVote === "dislike") dislikes = Math.max(0, dislikes - 1);

            if (type === "like") likes++;
            else dislikes++;
            userVote = type;
        }
        saveToStorage();
    }

    onMount(() => {
        loadFromStorage();
    });
</script>

<div class="flex items-center gap-4 py-2">
    <button
        onclick={() => vote("like")}
        class:like-active={userVote === "like"}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition hover:bg-[var(--btn-plain-bg-hover)] active:scale-95"
        aria-label="Like"
    >
        <Icon icon="material-symbols:thumb-up-outline" class="text-base" />
        <span class="font-medium">{likes}</span>
    </button>
    <button
        onclick={() => vote("dislike")}
        class:dislike-active={userVote === "dislike"}
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition hover:bg-[var(--btn-plain-bg-hover)] active:scale-95"
        aria-label="Dislike"
    >
        <Icon icon="material-symbols:thumb-down-outline" class="text-base" />
        <span class="font-medium">{dislikes}</span>
    </button>
</div>

<style>
    .like-active {
        color: var(--primary);
    }
    .dislike-active {
        color: oklch(0.6 0.2 25);
    }
    .dark .dislike-active {
        color: oklch(0.65 0.2 25);
    }
</style>
