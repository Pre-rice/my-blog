/** 歌曲信息 */
export interface Song {
	id: number;
	title: string;
	artist: string;
	cover: string;
	url: string;
	duration: number;
	/** 用于解析真实音频地址的平台歌曲 ID（如 QQ 音乐的 songmid） */
	songmid?: string;
}

/** 循环模式：0 顺序 / 1 列表循环 / 2 单曲循环 */
export type RepeatMode = 0 | 1 | 2;
