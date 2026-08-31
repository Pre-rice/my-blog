<script lang="ts">
// 注意：本根组件刻意使用 Svelte 传统响应式语法（而非 runes）。
// 本项目 @astrojs/svelte 7.2.3 对 runes 模式组件经 client:only 挂载时，
// 类型会退化为 Record<string, never>，导致 astro check 报 ts(2322)（与 Navbar 的 LightDarkSwitch 同源问题）。
// 传统语法下函数内对 let 变量的赋值仍会触发更新，行为等价。
import { onDestroy, onMount } from "svelte";
import SidebarControls from "./components/SidebarControls.svelte";
import SidebarCover from "./components/SidebarCover.svelte";
import SidebarPlaylist from "./components/SidebarPlaylist.svelte";
import SidebarProgress from "./components/SidebarProgress.svelte";
import SidebarTrackInfo from "./components/SidebarTrackInfo.svelte";
import { registerMusicPlayerIcons } from "./icon-data";
import type { MusicPlayerState } from "./musicPlayerStore";
import { musicPlayerStore } from "./musicPlayerStore";

// 离线注册播放器图标，避免首次切换随机/循环/单曲等图标时从 Iconify API 网络加载而卡顿
registerMusicPlayerIcons();

let playerState: MusicPlayerState = musicPlayerStore.getState();
let showPlaylist = false;

function handleStateUpdate(event: Event) {
	const custom = event as CustomEvent<MusicPlayerState>;
	if (custom.detail) {
		playerState = custom.detail;
	}
}

onMount(() => {
	window.addEventListener("music-sidebar:state", handleStateUpdate);
	// 无悬浮窗版本，由侧栏组件负责初始化播放器引擎（幂等，内部有 isInitialized 守卫）
	musicPlayerStore.initialize();
});

onDestroy(() => {
	if (typeof window !== "undefined") {
		window.removeEventListener("music-sidebar:state", handleStateUpdate);
	}
});

function togglePlay() {
	musicPlayerStore.toggle();
}

function prev() {
	musicPlayerStore.prev();
}

function next() {
	musicPlayerStore.next();
}

function toggleMode() {
	musicPlayerStore.toggleMode();
}

function togglePlaylistView() {
	showPlaylist = !showPlaylist;
}

function playIndex(index: number) {
	// 用户手动点击列表切歌：若点中的是 VIP/无法播放的歌，只将其从列表删除，不打断当前播放
	musicPlayerStore.playIndex(index, true);
}

function seek(time: number) {
	musicPlayerStore.seek(time);
}

function toggleMute() {
	musicPlayerStore.toggleMute();
}

function setVolume(volume: number) {
	musicPlayerStore.setVolume(volume);
}
</script>

<div class="music-sidebar-widget">
	<div class="flex items-center gap-3 mb-2.5">
		<SidebarCover
			currentSong={playerState.currentSong}
			isPlaying={playerState.isPlaying}
			isLoading={playerState.isLoading}
		/>
		<SidebarTrackInfo
			currentSong={playerState.currentSong}
			volume={playerState.volume}
			isMuted={playerState.isMuted}
			onToggleMute={toggleMute}
			onSetVolume={setVolume}
		/>
	</div>

	<SidebarProgress
		currentTime={playerState.currentTime}
		duration={playerState.duration}
		onSeek={seek}
	/>

	<SidebarControls
		isPlaying={playerState.isPlaying}
		isShuffled={playerState.isShuffled}
		repeatMode={playerState.isRepeating}
		onToggleMode={toggleMode}
		onPrev={prev}
		onNext={next}
		onTogglePlay={togglePlay}
		onTogglePlaylist={togglePlaylistView}
	/>

	<SidebarPlaylist
		playlist={playerState.playlist}
		currentIndex={playerState.currentIndex}
		isPlaying={playerState.isPlaying}
		show={showPlaylist}
		onClose={togglePlaylistView}
		onPlaySong={playIndex}
	/>
</div>

<style>
	@media (width < 520px) {
		.music-sidebar-widget {
			min-width: 0;
		}

		.music-sidebar-widget > :global(div:first-child) {
			gap: 0.75rem;
			margin-bottom: 0.5rem;
		}
	}
</style>
