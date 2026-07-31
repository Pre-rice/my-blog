/** 歌曲信息 */
export interface Song {
	id: number;
	title: string;
	artist: string;
	cover: string;
	url: string;
	duration: number;
}

/** 循环模式：0 顺序 / 1 列表循环 / 2 单曲循环 */
export type RepeatMode = 0 | 1 | 2;
