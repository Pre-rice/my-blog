import fetchJsonp from "fetch-jsonp";
import { musicPlayerConfig } from "../../../config";
import {
	DEFAULT_METING_API,
	DEFAULT_METING_ID,
	DEFAULT_METING_SERVER,
	DEFAULT_METING_TYPE,
	ERROR_DISPLAY_DURATION,
	LOAD_TIMEOUT_MS,
	STORAGE_KEY_VOLUME,
} from "../../../constants/music";
import type { RepeatMode, Song } from "../../../types/music";
import { musicPlaylist as generatedPlaylist } from "./music-playlist.generated";

export interface MusicPlayerState {
	currentSong: Song;
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	isLoading: boolean;
	currentTime: number;
	duration: number;
	volume: number;
	isMuted: boolean;
	isShuffled: boolean;
	isRepeating: RepeatMode;
	showPlaylist: boolean;
	errorMessage: string;
	showError: boolean;
	isExpanded: boolean;
	isHidden: boolean;
	autoplayFailed: boolean;
	willAutoPlay: boolean;
}

function getAssetPath(path: string): string {
	if (!path) {
		return "";
	}
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}

/** 兜底占位歌曲（当配置中未提供 defaultSong 时使用） */
const FALLBACK_SONG: Song = {
	title: "尚未播放",
	artist: "",
	cover: "/favicon/favicon.svg",
	url: "",
	duration: 0,
	id: 0,
};

/**
 * 通过 QQ 音乐 vkey 接口（jsonp）解析真实音频地址。
 * Meting API 部署在海外时 QQ 音乐返回的 url 是 "@..." 占位或空串，需用 songmid 重新请求该接口获取。
 */
async function resolveTencentUrl(songmid: string): Promise<string> {
	const data = {
		req_0: {
			module: "vkey.GetVkeyServer",
			method: "CgiGetVkey",
			param: {
				guid: String(Math.floor(1e7 * Math.random())),
				songmid: [songmid],
				songtype: [0],
				uin: "",
				loginflag: 1,
				platform: "20",
			},
		},
		comm: { uin: "", format: "json", ct: 19, cv: 0, authst: "" },
	};
	const params = new URLSearchParams({
		"-": "getplaysongvkey",
		g_tk: "5381",
		loginUin: "",
		hostUin: "0",
		format: "json",
		inCharset: "utf8",
		outCharset: "utf-8¬ice=0",
		platform: "yqq.json",
		needNewCode: "0",
		data: JSON.stringify(data),
	});
	const url = `https://u.y.qq.com/cgi-bin/musicu.fcg?${params.toString()}`;
	const response = await fetchJsonp(url);
	const result = await response.json();
	const info = result?.req_0?.data;
	const purl = info?.midurlinfo?.[0]?.purl || "";
	const domain =
		info?.sip?.find((i: string) => !i.startsWith("http://ws")) ||
		info?.sip?.[0] ||
		"";
	if (!purl || !domain) throw new Error("无法解析音频地址");
	return `${domain}${purl}`.replace("http://", "https://");
}

class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private isInitialized = false;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();
	/** 歌曲加载超时定时器（坏链接可能不触发 error 而无限缓冲） */
	private loadTimer: ReturnType<typeof setTimeout> | null = null;
	/** 最近播放过的歌曲 url 窗口（容量=歌单长度的一半）：随机选歌时跳过窗口内的歌，避免很快重复 */
	private recentPlayed: string[] = [];

	constructor() {
		this.state = this.createInitialState();
	}

	private createInitialState(): MusicPlayerState {
		return {
			currentSong: { ...(musicPlayerConfig.defaultSong ?? FALLBACK_SONG) },
			playlist: [],
			currentIndex: 0,
			isPlaying: false,
			isLoading: false,
			currentTime: 0,
			duration: 0,
			volume: 0.7,
			isMuted: false,
			isShuffled: true,
			isRepeating: 0,
			showPlaylist: false,
			errorMessage: "",
			showError: false,
			isExpanded: false,
			isHidden: false,
			autoplayFailed: false,
			willAutoPlay: false,
		};
	}

	private createSnapshot(): MusicPlayerState {
		return {
			...this.state,
			currentSong: { ...this.state.currentSong },
			playlist: this.state.playlist.map((song) => ({ ...song })),
		};
	}

	getState(): MusicPlayerState {
		return this.createSnapshot();
	}

	getAudio(): HTMLAudioElement | null {
		return this.audio;
	}

	subscribe(listener: (state: MusicPlayerState) => void): () => void {
		this.listeners.add(listener);
		listener(this.createSnapshot());
		return () => {
			this.listeners.delete(listener);
		};
	}

	async initialize(): Promise<void> {
		if (typeof window === "undefined" || this.isInitialized) {
			return;
		}
		this.isInitialized = true;

		if (!musicPlayerConfig.enable) {
			return;
		}

		this.audio = new Audio();
		this.setupAudioListeners();
		this.loadVolumeFromStorage();
		this.registerInteractionHandler();
		await this.loadPlaylist();
	}

	private setupAudioListeners(): void {
		if (!this.audio) {
			return;
		}

		this.audio.volume = this.state.volume;
		this.audio.muted = this.state.isMuted;

		this.audio.addEventListener("play", () => {
			this.state.isPlaying = true;
			this.broadcastState();
		});

		this.audio.addEventListener("pause", () => {
			this.state.isPlaying = false;
			this.broadcastState();
		});

		// 加载就绪或开始播放即视为成功，取消超时兜底
		this.audio.addEventListener("canplay", () => this.clearLoadTimer());
		this.audio.addEventListener("playing", () => this.clearLoadTimer());

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.broadcastState();
			}
		});

		this.audio.addEventListener("loadedmetadata", () => {
			this.clearLoadTimer();
			if (this.audio?.duration) {
				this.state.duration = this.audio.duration;
			}
			this.broadcastState();
		});

		this.audio.addEventListener("durationchange", () => {
			if (this.audio?.duration) {
				this.state.duration = this.audio.duration;
			}
			this.broadcastState();
		});

		this.audio.addEventListener("ended", () => {
			this.handleSongEnded();
		});

		this.audio.addEventListener("error", () => {
			this.clearLoadTimer();
			this.handleAudioError();
		});
	}

	private handleSongEnded(): void {
		if (this.state.isRepeating === 2) {
			// 单曲循环
			this.audio?.play().catch(() => this.handleAudioError());
			return;
		}

		if (this.state.playlist.length === 0) {
			this.state.isPlaying = false;
			this.broadcastState();
			return;
		}

		if (this.state.isRepeating === 1) {
			// 列表循环：最后一首播完后回到第一首
			if (this.state.currentIndex >= this.state.playlist.length - 1) {
				this.playIndex(0);
			} else {
				this.next();
			}
			return;
		}

		if (this.state.isShuffled) {
			// 随机模式：播完自动继续随机播放下一首
			this.next();
			return;
		}

		// 顺序播放：播完最后一首即停止
		if (this.state.currentIndex >= this.state.playlist.length - 1) {
			this.state.isPlaying = false;
			this.state.currentTime = 0;
			this.audio?.pause();
			this.broadcastState();
			return;
		}

		this.next();
	}

	private handleAudioError(): void {
		this.state.isLoading = false;
		this.state.autoplayFailed = true;

		const song = this.state.currentSong;
		// 从播放列表中剔除无法播放的歌曲（按 url 匹配）
		const failedIndex = this.state.playlist.findIndex(
			(s) => s.url === song.url,
		);
		if (failedIndex !== -1) {
			this.state.playlist.splice(failedIndex, 1);
			// 被剔除的位置在当前播放位置之前时，当前下标前移一位保持指向同一首
			if (failedIndex < this.state.currentIndex) {
				this.state.currentIndex -= 1;
			}
			// 窗口方案无固定队列，无需重洗；清掉窗口内已失效的歌
			this.recentPlayed = this.recentPlayed.filter((u) =>
				this.state.playlist.some((s) => s.url === u),
			);
			// 歌单变短后窗口容量（歌单一半）同步收缩
			const cap = Math.max(1, Math.floor(this.state.playlist.length / 2));
			if (this.recentPlayed.length > cap) {
				this.recentPlayed.splice(0, this.recentPlayed.length - cap);
			}
		}

		this.showError(`歌曲「${song.title}」无法播放，已从列表移除`);

		// 立即切到下一首：随机模式继续从窗口外随机选，顺序模式接列表的下一首
		if (this.state.playlist.length > 0) {
			if (this.state.isShuffled) {
				this.playIndex(this.nextShuffledIndex());
			} else {
				this.playIndex(
					Math.min(this.state.currentIndex, this.state.playlist.length - 1),
				);
			}
		} else {
			this.state.isPlaying = false;
			this.state.currentTime = 0;
			this.audio?.pause();
			this.broadcastState();
		}
	}

	/** 清除加载超时定时器 */
	private clearLoadTimer(): void {
		if (this.loadTimer !== null) {
			clearTimeout(this.loadTimer);
			this.loadTimer = null;
		}
	}

	/** 记录一首歌为"最近播放"：窗口满后淘汰最旧的（容量=歌单长度的一半） */
	private rememberPlayed(song: Song): void {
		const url = song.url;
		if (!url) return;
		// 若该歌已在窗口内则刷新其"最近"位置，避免重复占用窗口
		this.recentPlayed = this.recentPlayed.filter((u) => u !== url);
		this.recentPlayed.push(url);
		const cap = Math.max(1, Math.floor(this.state.playlist.length / 2));
		if (this.recentPlayed.length > cap) {
			this.recentPlayed.shift();
		}
	}

	/** 取随机播放的下一首下标：从"最近播放窗口"之外随机选，保证同一首歌不会很快再次播放 */
	private nextShuffledIndex(): number {
		const n = this.state.playlist.length;
		if (n <= 1) {
			return 0;
		}
		// 候选 = 不在最近播放窗口内、且不是当前正在播的歌
		const candidates = this.state.playlist
			.map((song, i) => ({ song, i }))
			.filter(
				({ song, i }) =>
					i !== this.state.currentIndex &&
					!this.recentPlayed.includes(song.url),
			)
			.map(({ i }) => i);
		// 退化情况（窗口覆盖全部歌曲）回退到全列表随机
		const pool =
			candidates.length > 0
				? candidates
				: this.state.playlist
						.map((_, i) => i)
						.filter((i) => i !== this.state.currentIndex);
		return pool[Math.floor(Math.random() * pool.length)];
	}

	private registerInteractionHandler(): void {
		const handleInteraction = () => {
			if (this.state.willAutoPlay && !this.state.autoplayFailed) {
				this.state.willAutoPlay = false;
				this.play();
			}
			if (this.unregisterInteraction) {
				this.unregisterInteraction();
			}
		};

		const events: (keyof WindowEventMap)[] = [
			"pointerdown",
			"keydown",
			"touchstart",
			"scroll",
		];

		for (const event of events) {
			window.addEventListener(event, handleInteraction, { once: true });
		}

		this.unregisterInteraction = () => {
			for (const event of events) {
				window.removeEventListener(event, handleInteraction);
			}
		};
	}

	private loadVolumeFromStorage(): void {
		if (typeof localStorage === "undefined") return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY_VOLUME);
			if (saved !== null) {
				const volume = Number.parseFloat(saved);
				if (!Number.isNaN(volume) && volume >= 0 && volume <= 1) {
					this.state.volume = volume;
					this.state.isMuted = volume === 0;
					if (this.audio) {
						this.audio.volume = volume;
						this.audio.muted = this.state.isMuted;
					}
				}
			}
		} catch {
			// 忽略 localStorage 不可用的情况
		}
	}

	private async loadPlaylist(): Promise<void> {
		if (musicPlayerConfig.mode === "meting") {
			await this.loadMetingPlaylist();
		} else {
			const source =
				generatedPlaylist.length > 0
					? generatedPlaylist
					: (musicPlayerConfig.localPlaylist ?? []);
			this.state.playlist = source.map((song) => ({
				id: song.id,
				title: song.title || "未知歌曲",
				artist: song.artist || "",
				cover: getAssetPath(song.cover || ""),
				url: getAssetPath(song.url),
				duration: song.duration || 0,
			}));
			this.broadcastState();
		}
	}

	private async loadMetingPlaylist(): Promise<void> {
		try {
			const api = musicPlayerConfig.api || DEFAULT_METING_API;
			const url = api
				.replace(":server", musicPlayerConfig.server || DEFAULT_METING_SERVER)
				.replace(":type", musicPlayerConfig.type || DEFAULT_METING_TYPE)
				.replace(":id", musicPlayerConfig.id || DEFAULT_METING_ID)
				.replace(":auth", "123")
				.replace(":r", String(Date.now()));

			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP ${response.status}`);
			}
			const data = await response.json();

			const songs: Song[] = Array.isArray(data)
				? data.map((item: Record<string, unknown>, index: number) => ({
						id: Number(item.id) || index + 1,
						title: String(item.title || item.name || "未知歌曲"),
						// Meting API 的歌手字段为 author（如 api.i-meto.com），兼容两种写法
						artist: String(item.artist || item.author || "未知歌手"),
						cover: String(item.pic || item.cover || ""),
						url: String(item.url || ""),
						duration: Number(item.duration) || 0,
						// 海外部署时 QQ 音乐返回的 url 是 jsonp 占位，播放前需用 songmid 解析真实地址
						songmid: String(item.songmid || ""),
					}))
				: [];

			if (songs.length === 0) {
				throw new Error("歌单为空");
			}

			this.state.playlist = songs;
			this.broadcastState();
		} catch (error) {
			console.error("加载 Meting 歌单失败:", error);
			this.state.playlist = [];
			this.showError("在线歌单加载失败，请检查配置或网络");
			this.broadcastState();
		}
	}

	private async loadSong(
		song: Song,
		autoplay = true,
		fromList = false,
	): Promise<void> {
		if (!this.audio) return;

		let target = song;

		// 预解析阶段：meting 在线歌单在切画面之前先解析真实音频地址。
		// 无法解析（VIP/版权受限）的歌曲直接剔除并顺延到下一首可播歌曲，
		// 期间不更新播放画面，避免切歌瞬间闪现坏歌导致画面闪动。
		while (target.songmid && !target.url.startsWith("http")) {
			try {
				target = { ...target, url: await resolveTencentUrl(target.songmid) };
				// 解析结果缓存回歌单，下次切到同一首时无需再请求
				const i = this.state.playlist.findIndex((s) => s.id === target.id);
				if (i !== -1) this.state.playlist[i] = target;
				break;
			} catch {
				// 解析失败：从歌单剔除该歌（按 id 匹配）
				const failedIndex = this.state.playlist.findIndex(
					(s) => s.id === target.id,
				);
				if (failedIndex !== -1) {
					this.state.playlist.splice(failedIndex, 1);
					// 被剔除的歌在当前播放位置之前时，当前下标前移一位保持指向同一首
					if (failedIndex < this.state.currentIndex) {
						this.state.currentIndex -= 1;
					}
					// 窗口方案无固定队列，无需重洗；清掉窗口内已失效的歌
					this.recentPlayed = this.recentPlayed.filter((u) =>
						this.state.playlist.some((s) => s.url === u),
					);
					// 歌单变短后窗口容量（歌单一半）同步收缩
					const cap = Math.max(1, Math.floor(this.state.playlist.length / 2));
					if (this.recentPlayed.length > cap) {
						this.recentPlayed.splice(0, this.recentPlayed.length - cap);
					}
				}

				// 手动点击列表中的坏歌：只从歌单删除，不切换播放，保持当前歌曲继续
				if (fromList) {
					// 恢复当前下标指回正在播放的那首歌（按 id 找回）
					const currentId = this.state.currentSong.id;
					const restoredIndex = this.state.playlist.findIndex(
						(s) => s.id === currentId,
					);
					if (restoredIndex !== -1) {
						this.state.currentIndex = restoredIndex;
					} else {
						// 未播放状态（占位歌不在歌单）：下标保持在有效范围内即可
						this.state.currentIndex = Math.min(
							this.state.currentIndex,
							this.state.playlist.length - 1,
						);
					}
					this.broadcastState();
					return;
				}

				// 歌单已空：无可播放歌曲，停止并提示
				if (this.state.playlist.length === 0) {
					this.state.isPlaying = false;
					this.state.currentTime = 0;
					this.audio?.pause();
					this.showError("歌单中无可播放的歌曲");
					this.broadcastState();
					return;
				}

				// 选下一首候选：随机模式从窗口外随机选，顺序模式接当前下标的下一首
				const nextIndex = this.state.isShuffled
					? this.nextShuffledIndex()
					: Math.min(this.state.currentIndex, this.state.playlist.length - 1);
				this.state.currentIndex = nextIndex;
				target = this.state.playlist[nextIndex];
			}
		}

		this.state.currentSong = { ...target };
		this.state.isLoading = true;
		this.state.currentTime = 0;
		this.state.duration = 0;
		this.state.autoplayFailed = false;
		this.state.errorMessage = "";
		this.state.showError = false;
		// 记入最近播放窗口（自动切歌、手动点歌都算）
		this.rememberPlayed(target);
		this.broadcastState();

		// 兜底：仍拿不到 url（本地模式等）时剔除该歌并自动切下一首
		if (!target.url) {
			const failedIndex = this.state.playlist.findIndex(
				(s) => s.id === target.id,
			);
			if (failedIndex !== -1) this.state.playlist.splice(failedIndex, 1);
			this.showError(`歌曲「${target.title}」无法播放，已从列表移除`);
			if (this.state.playlist.length > 0) {
				if (this.state.isShuffled) {
					this.playIndex(this.nextShuffledIndex());
				} else {
					this.playIndex(
						Math.min(this.state.currentIndex, this.state.playlist.length - 1),
					);
				}
			} else {
				this.state.isPlaying = false;
				this.state.currentTime = 0;
				this.broadcastState();
			}
			return;
		}

		this.audio.src = target.url;
		this.audio.load();

		// 加载超时兜底：部分坏链接不触发 error 而是无限缓冲，超时后按失败剔除
		this.clearLoadTimer();
		this.loadTimer = setTimeout(() => {
			if (this.state.isLoading && this.state.currentSong.url) {
				this.handleAudioError();
			}
		}, LOAD_TIMEOUT_MS);

		if (autoplay) {
			const playPromise = this.audio.play();
			if (playPromise !== undefined) {
				playPromise
					.then(() => {
						this.state.willAutoPlay = false;
						this.state.autoplayFailed = false;
						this.state.isLoading = false;
						this.broadcastState();
					})
					.catch(() => {
						// 浏览器阻止了自动播放，等待用户交互
						this.state.willAutoPlay = true;
						this.state.isLoading = false;
						this.broadcastState();
					});
			}
		}
	}

	playIndex(index: number, fromList = false): void {
		if (
			!this.state.playlist.length ||
			index < 0 ||
			index >= this.state.playlist.length
		) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true, fromList);
	}

	toggle(): void {
		if (!this.state.playlist.length) return;

		if (!this.state.currentSong.url && this.state.playlist.length > 0) {
			// 还没有加载任何歌曲：随机模式随机选一首，否则播放第一首
			this.playIndex(this.state.isShuffled ? this.nextShuffledIndex() : 0);
			return;
		}

		if (!this.audio) return;

		if (this.state.isPlaying) {
			this.audio.pause();
		} else {
			this.play();
		}
	}

	private play(): void {
		if (!this.audio || !this.state.currentSong.url) return;
		this.state.isLoading = true;
		this.broadcastState();

		const playPromise = this.audio.play();
		if (playPromise !== undefined) {
			playPromise
				.then(() => {
					this.state.willAutoPlay = false;
					this.state.autoplayFailed = false;
					this.state.isLoading = false;
					this.broadcastState();
				})
				.catch(() => {
					// 浏览器阻止了自动播放，等待用户交互
					this.state.willAutoPlay = true;
					this.state.isLoading = false;
					this.broadcastState();
				});
		}
	}

	prev(): void {
		if (!this.state.playlist.length) return;

		if (this.state.currentTime > 3) {
			// 播放超过 3 秒则重新开始当前歌曲
			this.seek(0);
			return;
		}

		const newIndex =
			this.state.currentIndex - 1 < 0
				? this.state.playlist.length - 1
				: this.state.currentIndex - 1;
		this.playIndex(newIndex);
	}

	next(): void {
		if (!this.state.playlist.length) return;

		if (this.state.isShuffled) {
			// 随机播放：从"最近播放窗口"之外随机选一首
			this.playIndex(this.nextShuffledIndex());
			return;
		}

		const newIndex = (this.state.currentIndex + 1) % this.state.playlist.length;
		this.playIndex(newIndex);
	}

	seek(time: number): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		if (time >= 0 && time <= this.state.duration) {
			this.audio.currentTime = time;
			this.state.currentTime = time;
			this.broadcastState();
		}
	}

	setProgress(percent: number): void {
		if (!this.audio || !this.state.currentSong.url) {
			return;
		}
		const newTime = percent * this.state.duration;
		this.audio.currentTime = newTime;
		this.state.currentTime = newTime;
		this.broadcastState();
	}

	setVolume(volume: number): void {
		const clampedVolume = Math.max(0, Math.min(1, volume));
		this.state.volume = clampedVolume;
		this.state.isMuted = clampedVolume === 0;
		if (this.audio) {
			this.audio.volume = clampedVolume;
			this.audio.muted = this.state.isMuted;
		}
		if (typeof localStorage !== "undefined") {
			try {
				localStorage.setItem(STORAGE_KEY_VOLUME, String(clampedVolume));
			} catch {
				// 忽略
			}
		}
		this.broadcastState();
	}

	toggleMute(): void {
		this.state.isMuted = !this.state.isMuted;
		if (this.audio) {
			this.audio.muted = this.state.isMuted;
		}
		this.broadcastState();
	}

	toggleShuffle(): void {
		this.state.isShuffled = !this.state.isShuffled;
		if (this.state.isShuffled) {
			this.state.isRepeating = 0;
		}
		this.broadcastState();
	}

	toggleRepeat(): void {
		this.state.isRepeating = ((this.state.isRepeating + 1) % 3) as RepeatMode;
		if (this.state.isRepeating !== 0) {
			this.state.isShuffled = false;
		}
		this.broadcastState();
	}

	/**
	 * 播放模式三态循环：列表循环(1) → 单曲循环(2) → 随机 → 列表循环(1) → …
	 * isRepeating 语义：0=顺序 / 1=列表循环 / 2=单曲循环；isShuffled=true 表示随机。
	 */
	toggleMode(): void {
		if (this.state.isShuffled) {
			// 随机 → 列表循环
			this.state.isShuffled = false;
			this.state.isRepeating = 1;
		} else if (this.state.isRepeating === 2) {
			// 单曲循环 → 随机
			this.state.isShuffled = true;
			this.state.isRepeating = 0;
		} else {
			// 列表循环（或顺序）→ 单曲循环
			this.state.isRepeating = 2;
		}
		this.broadcastState();
	}

	togglePlaylist(): void {
		this.state.showPlaylist = !this.state.showPlaylist;
		this.broadcastState();
	}

	canSkip(): boolean {
		return this.state.playlist.length > 1;
	}

	showError(message: string): void {
		this.state.errorMessage = message;
		this.state.showError = true;
		this.broadcastState();

		setTimeout(() => {
			this.hideError();
		}, ERROR_DISPLAY_DURATION);
	}

	hideError(): void {
		this.state.showError = false;
		this.state.errorMessage = "";
		this.broadcastState();
	}

	private broadcastState(): void {
		const snapshot = this.createSnapshot();

		for (const listener of this.listeners) {
			listener(snapshot);
		}

		if (typeof window === "undefined") {
			return;
		}
		window.dispatchEvent(
			new CustomEvent("music-sidebar:state", {
				detail: snapshot,
			}),
		);
	}

	destroy(): void {
		this.clearLoadTimer();
		if (this.unregisterInteraction) {
			this.unregisterInteraction();
		}
		if (this.audio) {
			this.audio.pause();
			this.audio.src = "";
			this.audio = null;
		}
		this.isInitialized = false;
	}
}

export const musicPlayerStore = new MusicPlayerStore();
