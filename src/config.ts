import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "HAOHAO's Blog",
	subtitle: "Hello",
	lang: "zh_CN", // 语言设置为简体中文
	themeColor: {
		hue: 250, // 深蓝紫色调对应的 hue 值为 250
		fixed: true, // 是否允许访客手动调整主题色
	},
	banner: {
		enable: false, // 参考站首页关闭了 Banner，显得更简洁
		src: "assets/images/demo-banner.png",
		position: "center",
		credit: {
			enable: false,
			text: "",
			url: "",
		},
	},
	toc: {
		enable: true, // 开启右侧目录
		depth: 2, // 目录深度设置为 2
	},
	favicon: [
		// 如果你有自己的 favicon，请取消下方注释
		// {
		//   src: '/favicon/icon.png',
		//   theme: 'light',
		//   sizes: '32x32',
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		{
			name: "说说",
			url: "/ss/", //  "说说" 页面
		},
		LinkPreset.Archive,
		{
			name: "友链",
			url: "/friends/", //  "友链" 页面
		},
		LinkPreset.About,
		{
			name: "状态",
			url: "https://status.ishaohao.cn/", // 这是一个外部状态监控页
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/demo-avatar.png", // 头像文件
	name: "HAOHAO",
	bio: "心平气和，与世无争", // 个人简介
	links: [
		{
			name: "RSS",
			icon: "fa6-solid:rss", // RSS 图标
			url: "/rss.xml",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github", // GitHub 图标
			url: "https://github.com/ISHAOHAO",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};
