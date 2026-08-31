<script lang="ts">
import { onDestroy } from "svelte";
import type { Song } from "../../../../types/music";
import AccordionDrawer from "./AccordionDrawer.svelte";
import TrackListItem from "./TrackListItem.svelte";

// 滚轮灵敏度：实际滚动距离 = 原生滚轮增量 × SCROLL_FACTOR
// 小于 1 减速（更慢，便于逐条选歌），大于 1 加速
const SCROLL_FACTOR = 0.6;

// 平滑滚轮滚动：把滚轮增量累积到目标位置，由 rAF 逐帧逼近。
// 不能用 `scroll-behavior: smooth` + 直接改 scrollTop——快速滚轮事件密集时，
// 每次赋值都会打断并重启平滑动画，导致净滚动量极小（快速滚反而滚得特别慢）。
let scrollRaf: number | null = null;
let targetTop: number | null = null;

function cancelSmoothScroll() {
	if (scrollRaf != null) {
		cancelAnimationFrame(scrollRaf);
		scrollRaf = null;
	}
	targetTop = null;
}

function handleWheel(e: WheelEvent) {
	// 保留 Ctrl+滚轮的页面缩放手势
	if (e.ctrlKey) return;
	const el = e.currentTarget as HTMLElement;
	const canScrollUp = el.scrollTop > 0;
	const canScrollDown = el.scrollTop + el.clientHeight < el.scrollHeight;
	// 只拦截本列表还能继续滚动的方向，滚动到头/尾时放行给页面
	if ((e.deltaY < 0 && canScrollUp) || (e.deltaY > 0 && canScrollDown)) {
		e.preventDefault();
		const maxTop = el.scrollHeight - el.clientHeight;
		// 增量累积到目标位置：事件密集时直接累加，动画不被中断，净速度正常
		targetTop = Math.min(
			maxTop,
			Math.max(0, (targetTop ?? el.scrollTop) + e.deltaY * SCROLL_FACTOR),
		);
		if (scrollRaf != null) return; // 已有动画在跑，仅更新目标
		const tick = () => {
			const cur = el.scrollTop;
			const diff = targetTop! - cur;
			if (Math.abs(diff) < 0.5) {
				el.scrollTop = targetTop!;
				scrollRaf = null;
				targetTop = null;
				return;
			}
			el.scrollTop = cur + diff * 0.1;
			scrollRaf = requestAnimationFrame(tick);
		};
		scrollRaf = requestAnimationFrame(tick);
	}
}

onDestroy(() => {
	cancelSmoothScroll();
});

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
