// 配置文件

import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

/**
 * 站点全局配置
 * 包括网站标题、副标题、语言、主题颜色、横幅图片、层级目录以及网站图标等基础信息。
 */
export const siteConfig: SiteConfig = {
	// 基础设置
	title: "Pre-rice 的个人博客",
	subtitle: "主页",
	lang: "zh_CN",
	// 主题颜色
	themeColor: {
		hue: 250, // 主题颜色的默认色相（0-360）
		fixed: true, // 是否对访客隐藏主题颜色选择器
	},
	// 网站顶部的横幅图片
	banner: {
		enable: false,
		src: "assets/images/bg.png", // 相对于 /src 目录。如果以 '/' 开头，则相对于 /public 目录
		position: "center", // 控制选取图片的哪个区域，仅支持 'top'、'center'、'bottom'
		credit: {
			enable: false, // 是否显示
			text: "", // 署名文本
			url: "", // （可选）指向原始艺术作品或作者页面的 URL 链接
		},
	},
	// 层级目录（Table of Contents）
	toc: {
		enable: true, // 是否在文章右侧显示层级目录
		depth: 2, // 目录中显示的最大标题层级（1-3）
	},
	// 网站图标
	favicon: [
		// 留空此数组以使用默认 favicon
		// {
		//   src: '/favicon/icon.png',    // favicon 路径，相对于 /public 目录
		//   theme: 'light',              // （可选）'light' 或 'dark'，仅在浅色和深色模式使用不同 favicon 时设置
		//   sizes: '32x32',              // （可选）favicon 尺寸，仅在有不同尺寸 favicon 时设置
		// }
		{
			src: '/favicon/favicon.svg',
		},
		{
			src: '/favicon/favicon-96.png',
			sizes: '96x96',
		},
		{
			src: '/favicon/favicon-180.png',
			sizes: '180x180',
		},
		{
			src: '/favicon/favicon-192.png',
			sizes: '192x192',
		},
		{
			src: '/favicon/favicon-512.png',
			sizes: '512x512',
		},
		{
			src: '/favicon/favicon.ico',
		},
	],
};

/**
 * 导航栏配置
 * 定义页面顶部导航栏中显示的链接，支持内置预设（首页、归档、关于）以及自定义外部链接。
 */
export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
    	LinkPreset.Links,
	],
};

/**
 * 个人资料配置
 * 设置博客侧边栏或作者卡片中展示的头像、姓名、简介以及社交链接列表。
 */
export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png",
	name: "Pre-rice",
	bio: "热爱探索与分享，期待思想的碰撞",
	links: [
		{
			name: "QQ",
			icon: "fa6-brands:qq", // 访问 https://icones.js.org/ 获取图标代码。如果尚未包含对应的图标集，则需要安装`pnpm add @iconify-json/<图标集名称>`
			url: "https://qm.qq.com/q/mAFwuP4Qrm",
		},
		{
			name: "Email",
			icon: "material-symbols:mail",
			url: "mailto:prerice@qq.com",
		},
		{
			name: "Bilibili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/524853098",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Pre-rice",
		},
	],
};

/**
 * 许可证配置
 * 用于文章页脚的版权声明，可启用并指定许可证名称和对应的 URL。
 */
export const licenseConfig: LicenseConfig = {
	enable: false,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

/**
 * 代码高亮主题配置
 * 设置博客中代码块的高亮主题。
 */
export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// 注意：部分样式（如背景颜色）被覆盖，请参见 astro.config.mjs 文件
	theme: "github-dark",
};
