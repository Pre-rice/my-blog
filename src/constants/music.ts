/**
 * 音乐播放器引擎常量
 * 仅存放播放引擎内部使用的常量；用户可配置项请在 src/config.ts 中设置。
 */

/** localStorage 中保存音量数值的键名 */
export const STORAGE_KEY_VOLUME = "music-player-volume";

/** 默认音量（0-1） */
export const DEFAULT_VOLUME = 0.7;

/** Meting API 默认地址（meting 模式） */
export const DEFAULT_METING_API =
	"https://www.bilibili.uno/api?server=:server&type=:type&id=:id&auth=:auth&r=:r";

/** Meting 默认歌单 ID */
export const DEFAULT_METING_ID = "14164869977";

/** Meting 默认音乐源服务器 */
export const DEFAULT_METING_SERVER = "netease";

/** Meting 默认播单类型 */
export const DEFAULT_METING_TYPE = "playlist";

/** 错误提示展示时长（毫秒） */
export const ERROR_DISPLAY_DURATION = 3000;

/** 歌曲加载失败后自动切到下一首的延迟（毫秒） */
export const SKIP_ERROR_DELAY = 1000;
