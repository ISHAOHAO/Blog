import { getSortedPosts } from "@utils/content-utils";
import { OGImageRoute } from "astro-og-canvas";
import { profileConfig, siteConfig } from "@/config";

interface OGPageMeta {
	title: string;
	description?: string;
}

const posts = await getSortedPosts();

const pages: Record<string, OGPageMeta> = {
	home: {
		title: `${siteConfig.title} - ${siteConfig.subtitle}`,
		description: profileConfig.bio,
	},
};

for (const post of posts) {
	if (post.data.draft) continue;
	pages[`posts/${post.id}`] = {
		title: post.data.title,
		description: post.data.description || profileConfig.bio,
	};
}

export const { getStaticPaths, GET } = await OGImageRoute<OGPageMeta>({
	pages,
	getImageOptions: (_path, page) => ({
		title: page.title,
		description: page.description,
		font: {
			title: {
				size: 64,
				color: [255, 255, 255],
				lineHeight: 1.3,
				families: ["Noto Sans CJK SC"],
			},
			description: {
				size: 32,
				color: [172, 180, 210],
				lineHeight: 1.4,
				families: ["Noto Sans CJK SC"],
			},
		},
		// 与站点主题色 (hue 250 蓝紫) 呼应的深色渐变底
		bgGradient: [
			[27, 29, 46],
			[52, 56, 92],
		],
		border: { color: [134, 154, 255], width: 12, side: "block-start" },
		padding: 72,
		fonts: [
			// 中文字体需在构建时加载,CanvasKit 依赖该 OTF 渲染 CJK 字形
			"https://cdn.jsdelivr.net/gh/notofonts/noto-cjk@main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf",
		],
	}),
});
