<script lang="ts">
import type { Song } from "../../../../types/music";
import AccordionDrawer from "./AccordionDrawer.svelte";
import TrackListItem from "./TrackListItem.svelte";

// 滚轮灵敏度：实际滚动距离 = 原生滚轮增量 × SCROLL_FACTOR
// 小于 1 减速（更慢，便于逐条选歌），大于 1 加速
const SCROLL_FACTOR = 0.8;

function handleWheel(e: WheelEvent) {
	// 保留 Ctrl+滚轮的页面缩放手势
	if (e.ctrlKey) return;
	const el = e.currentTarget as HTMLElement;
	const canScrollUp = el.scrollTop > 0;
	const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight;
	// 只拦截本列表还能继续滚动的方向，滚动到头/尾时放行给页面
	if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
		e.preventDefault();
		el.scrollTop += e.deltaY * SCROLL_FACTOR;
	}
}

interface Props {
	playlist: Song[];
	currentIndex: number;
	isPlaying: boolean;
	show: boolean;
	onClose: () => void;
	onPlaySong: (index: number) => void;
}

const { playlist, currentIndex, isPlaying, show, onClose, onPlaySong }: Props =
	$props();
</script>

<AccordionDrawer {show} class="playlist-drawer">
	<div class="playlist-shell">
		<div
			class="playlist-content"
			onwheel={handleWheel}
			role="listbox"
			aria-label="Playlist"
			aria-multiselectable="false"
		>
			{#each playlist as song, index}
				<TrackListItem
					{song}
					isCurrent={index === currentIndex}
					{isPlaying}
					onclick={() => onPlaySong(index)}
				/>
			{/each}
		</div>
	</div>
</AccordionDrawer>

<style>
	:global(.playlist-drawer) {
		margin-top: 0;
	}

	.playlist-shell {
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px solid
			color-mix(in srgb, var(--content-meta) 12%, transparent 88%);
	}

	.playlist-content {
		overflow-y: auto;
		max-height: 10rem;
		padding-right: 0.35rem;
		scroll-behavior: smooth;
		padding-bottom: 0.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		/* 显示细滚动条方便选歌 */
		scrollbar-width: thin;
		scrollbar-color: color-mix(in srgb, var(--content-meta) 30%, transparent)
			transparent;
	}

	.playlist-content::-webkit-scrollbar {
		width: 6px;
	}

	.playlist-content::-webkit-scrollbar-track {
		background: transparent;
	}

	.playlist-content::-webkit-scrollbar-thumb {
		background: color-mix(in srgb, var(--content-meta) 30%, transparent);
		border-radius: 999px;
	}

	.playlist-content::-webkit-scrollbar-thumb:hover {
		background: color-mix(in srgb, var(--content-meta) 55%, transparent);
	}
</style>
