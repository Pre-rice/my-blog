// 配置文件

import type {
	ExpressiveCodeConfig,
	LicenseConfig,
	MusicPlayerConfig,
	NavBarConfig,
	ProfileConfig,
	SidebarLayoutConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

/**
 * 站点全局配置
 * 包括网站标题、副标题、语言、主题颜色、横幅图片、层级目录以及网站图标等基础信息。
 */
export const siteConfig: SiteConfig = {
	// 基础设置
	title: "Pre-rice 的博客",
	subtitle: "",
	lang: "zh_CN",
	siteStartDate: "2026-07-30",
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
			src: "/favicon/favicon.svg",
		},
		{
			src: "/favicon/favicon-96.png",
			sizes: "96x96",
		},
		{
			src: "/favicon/favicon-180.png",
			sizes: "180x180",
		},
		{
			src: "/favicon/favicon-192.png",
			sizes: "192x192",
		},
		{
			src: "/favicon/favicon-512.png",
			sizes: "512x512",
		},
		{
			src: "/favicon/favicon.ico",
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

/**
 * 侧栏布局配置（Mizuki 风格三栏布局）
 * 只需配置左右侧栏包含的组件及其顺序；位置（top/sticky）与动画行为由代码自动处理。
 */
export const sidebarLayoutConfig: SidebarLayoutConfig = {
	components: {
		left: ["profile", "tags", "toc"],
		right: ["site-stats", "categories", "music-sidebar"],
	},
};

/**
 * 音乐播放器配置
 *
 * mode:
 *  - "local": 播放本地音频文件（自动扫描 /public/music/url/，localPlaylist 可选覆盖）
 *  - "meting": 通过 Meting API 拉取在线歌单（需配置 id）
 */
export const musicPlayerConfig: MusicPlayerConfig = {
	// 是否启用音乐播放器功能
	enable: true,
	// 播放器模式：local 本地文件 / meting 在线歌单
	mode: "meting",
	// 以下为 meting 模式配置（将 mode 改为 "meting" 后生效）
	// 歌单 ID：取歌单页面 URL 中的标识，不同平台格式不同（见 server 注释）
	id: "5715312555",
	// 音乐源服务器：netease 网易云 / tencent QQ音乐 / kugou 酷狗 / xiami 虾米 / baidu 百度
	// 留空则默认 netease。网易云歌单 ID 见 play?list 链接；QQ音乐歌单 ID 为链接末尾一串字母数字
	server: "tencent",
	// 内容类型：playlist 歌单 / song 单曲 / album 专辑 / artist 歌手 / search 搜索
	// 留空则默认 playlist（歌单）
	type: "playlist",
	// Meting API 地址：留空使用默认实例 https://api.i-meto.com/meting/api
	// 支持占位符 :server :type :id :auth :r（分别替换为服务器/类型/ID/授权/时间戳）
	api: "https://api.i-meto.com/meting/api?server=:server&type=:type&id=:id&auth=:auth&r=:r",
	// 本地播放列表（local 模式）：
	// 留空（[]）= 构建时自动扫描 /public/music/url/ 目录，并自动识别每首歌的标题/歌手/封面/时长。
	// 如需覆盖某首歌的显示信息，或加入目录外的歌（如在线地址），可按 url 添加条目：
	// 同 url 的条目中已填写的字段优先，未填写的字段仍会从音频元数据自动识别。
	// 示例：{ id: 1, url: "music/url/xxx.mp3", title: "自定义标题", artist: "自定义歌手" }
	localPlaylist: [],
	// 默认占位歌曲（播放前显示）
	defaultSong: {
		title: "尚未播放",
		artist: "从侧栏播放器开始",
		cover: "/favicon/favicon.svg",
		url: "",
		duration: 0,
		id: 0,
	},
};
