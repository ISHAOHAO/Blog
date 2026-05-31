import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = new Date(a.data.published);
		const dateB = new Date(b.data.published);
		return dateA > dateB ? -1 : 1;
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			const ucKey = i18n(I18nKey.uncategorized);
			count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}

export type RelatedPost = {
	slug: string;
	title: string;
	published: Date;
	tags: string[];
	category: string | null;
	score: number;
};

export async function getRelatedPosts(
	currentSlug: string,
	maxCount = 3,
): Promise<RelatedPost[]> {
	const allPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const currentPost = allPosts.find((p) => p.slug === currentSlug);
	if (!currentPost) return [];

	const currentTags = new Set(currentPost.data.tags || []);
	const currentCategory = currentPost.data.category?.trim() || null;

	const scored = allPosts
		.filter((p) => p.slug !== currentSlug)
		.map((p) => {
			let score = 0;
			const pTags = p.data.tags || [];
			const pCategory = p.data.category?.trim() || null;

			for (const tag of pTags) {
				if (currentTags.has(tag)) {
					score += 2;
				}
			}

			if (currentCategory && pCategory && currentCategory === pCategory) {
				score += 1;
			}

			return {
				slug: p.slug,
				title: p.data.title,
				published: p.data.published,
				tags: pTags,
				category: pCategory,
				score,
			};
		})
		.filter((p) => p.score > 0)
		.sort((a, b) => b.score - a.score || b.published.getTime() - a.published.getTime())
		.slice(0, maxCount);

	return scored;
}

export type SeriesInfo = {
	name: string;
	posts: { slug: string; title: string; order?: number }[];
};

export async function getSeriesPosts(currentSeries: string): Promise<SeriesInfo | null> {
	if (!currentSeries) return null;

	const allPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const seriesPosts = allPosts
		.filter((p) => p.data.series === currentSeries)
		.map((p) => ({
			slug: p.slug,
			title: p.data.title,
			order: p.data.seriesOrder,
		}));

	if (seriesPosts.length <= 1) return null;

	seriesPosts.sort((a, b) => {
		if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
		if (a.order !== undefined) return -1;
		if (b.order !== undefined) return 1;
		return 0;
	});

	return {
		name: currentSeries,
		posts: seriesPosts,
	};
}
