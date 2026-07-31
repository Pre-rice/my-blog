import { musicPlayerConfig } from "../../../config";
import {
	DEFAULT_METING_API,
	DEFAULT_METING_ID,
	DEFAULT_METING_SERVER,
	DEFAULT_METING_TYPE,
	ERROR_DISPLAY_DURATION,
	SKIP_ERROR_DELAY,
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

class MusicPlayerStore {
	private audio: HTMLAudioElement | null = null;
	private state: MusicPlayerState;
	private isInitialized = false;
	private unregisterInteraction: (() => void) | undefined;
	private listeners = new Set<(state: MusicPlayerState) => void>();

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

		this.audio.addEventListener("timeupdate", () => {
			if (this.audio) {
				this.state.currentTime = this.audio.currentTime;
				this.broadcastState();
			}
		});

		this.audio.addEventListener("loadedmetadata", () => {
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
		this.showError(`歌曲「${song.title}」加载失败，即将播放下一首`);

		// 延迟后自动切到下一首
		setTimeout(() => {
			if (!this.state.currentSong.url) return;
			if (this.state.playlist.length > 1) {
				this.next();
			} else {
				this.state.isPlaying = false;
				this.broadcastState();
			}
		}, SKIP_ERROR_DELAY);
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
			const api = DEFAULT_METING_API;
			const url = api
				.replace(":server", DEFAULT_METING_SERVER)
				.replace(":type", DEFAULT_METING_TYPE)
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
						title: String(item.title || "未知歌曲"),
						artist: String(item.artist || "未知歌手"),
						cover: String(item.pic || item.cover || ""),
						url: String(item.url || ""),
						duration: Number(item.duration) || 0,
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

	private loadSong(song: Song, autoplay = true): void {
		if (!this.audio || !song.url) return;

		this.state.currentSong = { ...song };
		this.state.isLoading = true;
		this.state.currentTime = 0;
		this.state.duration = 0;
		this.state.autoplayFailed = false;
		this.state.errorMessage = "";
		this.state.showError = false;
		this.broadcastState();

		this.audio.src = song.url;
		this.audio.load();

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

	playIndex(index: number): void {
		if (
			!this.state.playlist.length ||
			index < 0 ||
			index >= this.state.playlist.length
		) {
			return;
		}
		this.state.currentIndex = index;
		this.loadSong(this.state.playlist[index], true);
	}

	toggle(): void {
		if (!this.state.playlist.length) return;

		if (!this.state.currentSong.url && this.state.playlist.length > 0) {
			// 还没有加载任何歌曲，直接播放第一首
			this.playIndex(0);
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
			// 随机播放
			const randomIndex = Math.floor(
				Math.random() * this.state.playlist.length,
			);
			if (randomIndex === this.state.currentIndex) {
				if (this.state.playlist.length > 1) {
					this.playIndex((randomIndex + 1) % this.state.playlist.length);
				}
			} else {
				this.playIndex(randomIndex);
			}
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
