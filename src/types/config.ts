import type { DARK_MODE, LIGHT_MODE } from "@constants/constants";
import type { Song } from "./music";

export type SiteConfig = {
	title: string;
	subtitle: string;

	lang: string;

	// 站点开始日期（用于站点信息统计运行天数）
	siteStartDate?: string;

	themeColor: {
		hue: number;
		fixed: boolean;
	};
	banner: {
		enable: boolean;
		src: string;
		position?: "top" | "center" | "bottom";
		credit: {
			enable: boolean;
			text: string;
			url?: string;
		};
	};
	toc: {
		enable: boolean;
		depth: 1 | 2 | 3;
	};

	favicon: Favicon[];
};

export type Favicon = {
	src: string;
	theme?: "light" | "dark";
	sizes?: string;
};

export enum LinkPreset {
	Home = 0,
	Archive = 1,
	About = 2,
    Links = 3,
}

export type NavBarLink = {
	name: string;
	url: string;
	external?: boolean;
};

export type NavBarConfig = {
	links: (NavBarLink | LinkPreset)[];
};

export type ProfileConfig = {
	avatar?: string;
	name: string;
	bio?: string;
	links: {
		name: string;
		url: string;
		icon: string;
	}[];
};

export type LicenseConfig = {
	enable: boolean;
	name: string;
	url: string;
};

export type LIGHT_DARK_MODE = typeof LIGHT_MODE | typeof DARK_MODE;

export type BlogPostData = {
	body: string;
	title: string;
	published: Date;
	description: string;
	tags: string[];
	draft?: boolean;
	image?: string;
	category?: string;
	prevTitle?: string;
	prevSlug?: string;
	nextTitle?: string;
	nextSlug?: string;
};

export type ExpressiveCodeConfig = {
	theme: string;
};

/* ─── Mizuki 风格三栏布局与音乐播放器 ─────────────────────────── */

export type WidgetComponentType =
	| "profile"
	| "tags"
	| "toc"
	| "site-stats"
	| "categories"
	| "music-sidebar";

export type SidebarLayoutConfig = {
	/** 左右侧栏各自包含的组件列表（按显示顺序排列） */
	components: {
		left: WidgetComponentType[];
		right: WidgetComponentType[];
	};
};

export type MusicPlayerMode = "local" | "meting";

/** 本地播放列表条目：id 与 url 必填，其余字段留空或省略则构建时自动识别 */
export type LocalPlaylistEntry = {
	/** 歌曲 id（需唯一） */
	id: number;
	/** 音频文件路径（相对 /public，如 music/url/xxx.mp3）；也可填在线地址 */
	url: string;
	/** 歌曲标题；留空或省略则构建时从音频元数据自动识别 */
	title?: string;
	/** 歌手；留空或省略则自动识别 */
	artist?: string;
	/** 封面路径（相对 /public，如 music/cover/xxx.jpg）；留空或省略则自动提取音频内嵌封面 */
	cover?: string;
	/** 时长（秒）；0 或省略则自动读取 */
	duration?: number;
};


export type MusicPlayerConfig = {
	/** 是否启用音乐播放器 */
	enable: boolean;
	/** 播放器模式：local 本地文件 / meting API 在线歌单 */
	mode: MusicPlayerMode;
	/** 歌单 ID（仅 meting 模式） */
	id?: string;
	/** Meting 音乐源服务器（仅 meting 模式）：netease 网易云 / tencent QQ音乐 / kugou 酷狗 / xiami 虾米 / baidu 百度；留空默认 netease */
	server?: string;
	/** Meting 内容类型（仅 meting 模式）：playlist 歌单 / song 单曲 / album 专辑 / artist 歌手 / search 搜索；留空默认 playlist */
	type?: string;
	/** Meting API 地址（仅 meting 模式）：留空使用默认第三方实例；支持 :server :type :id :auth :r 占位符 */
	api?: string;
	/** 本地播放列表（local 模式）：留空时构建时自动扫描 /public/music/url/ 目录并识别元数据；条目仅作为覆盖项 */
	localPlaylist?: LocalPlaylistEntry[];
	/** 默认占位歌曲（播放前显示） */
	defaultSong?: Song;
};
