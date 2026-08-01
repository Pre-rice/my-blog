<script lang="ts">
import Icon from "@iconify/svelte";

import type { Song } from "../../../../types/music";

interface Props {
	currentSong: Song;
	volume: number;
	isMuted: boolean;
	onToggleMute: () => void;
	onSetVolume: (volume: number) => void;
}

const { currentSong, volume, isMuted, onToggleMute, onSetVolume }: Props =
	$props();

const volumePercent = $derived(
	isMuted ? 0 : Math.max(0, Math.min(100, volume * 100)),
);

// ---- 标题溢出时自动滚动（跑马灯）----
let titleContainer: HTMLElement | undefined;
let titleTrack: HTMLElement | undefined;
let isTitleMarquee = $state(false);
// 标题文本（派生值）：只追踪字符串本身，避免父组件每次广播状态
// （timeupdate 等高频）传入新的 currentSong 对象导致 $effect 频繁重跑、清掉滚动定时器
const titleText = $derived(currentSong.title);

$effect(() => {
	// 依赖标题文本（派生值），切歌时重新计算是否溢出
	void titleText;
	if (!titleContainer || !titleTrack) {
		return;
	}
	const dist = titleTrack.scrollWidth - titleContainer.clientWidth;
	if (dist > 0) {
		// 切歌后先停在最左边让用户看清新标题，稍后再启动滚动
		isTitleMarquee = false;
		const timer = setTimeout(() => {
			if (!titleContainer || !titleTrack) return;
			const d = titleTrack.scrollWidth - titleContainer.clientWidth;
			if (d > 0) {
				titleTrack.style.setProperty("--marquee-dist", `${d}px`);
				// 来回各 d/28 秒，两端各停顿 1.25 秒
				titleTrack.style.setProperty(
					"--marquee-dur",
					`${Math.max(4, d / 14 + 2.5)}s`,
				);
				isTitleMarquee = true;
			}
		}, 1200);
		// effect 重跑（切歌）或组件销毁时清理定时器
		return () => clearTimeout(timer);
	}
	isTitleMarquee = false;
});

// ---- 音量 ----
let isVolumeDragging = false;

function handleVolumePointer(event: PointerEvent) {
	const el = event.currentTarget as HTMLElement | null;
	if (!el) {
		return;
	}
	isVolumeDragging = true;
	const rect = el.getBoundingClientRect();
	const percent = (event.clientX - rect.left) / rect.width;
	const nextVolume = Math.max(0, Math.min(1, percent));
	onSetVolume(nextVolume);
	el.setPointerCapture(event.pointerId);
}

function handleVolumeMove(event: PointerEvent) {
	if (!isVolumeDragging) {
		return;
	}
	handleVolumePointer(event);
}

function handleVolumeEnd() {
	isVolumeDragging = false;
}

function handleVolumeKeyDown(event: KeyboardEvent) {
	if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
		event.preventDefault();
		onSetVolume(Math.max(0, volume - 0.05));
	} else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
		event.preventDefault();
		onSetVolume(Math.min(1, volume + 0.05));
	} else if (event.key === "Enter") {
		event.preventDefault();
		onToggleMute();
	}
}
</script>

<div class="flex flex-col min-w-0 flex-1 overflow-hidden">
	<div class="title-row">
		<div class="marquee-container" bind:this={titleContainer}>
			{#key currentSong.title}
				<!-- 切歌时重建节点，让 marquee 动画从头（最左）开始，而不是接着上一首的滚动位置 -->
				<span
					class="marquee-track"
					class:marquee={isTitleMarquee}
					bind:this={titleTrack}
				>{currentSong.title}</span
				>
			{/key}
		</div>
	</div>
	<div class="artist-row">
		<span class="artist-text truncate">{currentSong.artist}</span>
	</div>
	<div class="meta-row">
		<div class="volume-wrap">
			<button
				type="button"
				class="volume-btn"
				onclick={onToggleMute}
				aria-label="Toggle volume"
			>
				<Icon
					icon={isMuted || volume === 0
						? "material-symbols:volume-off-rounded"
						: "material-symbols:volume-up-rounded"}
					class="text-base"
				/>
			</button>

			<div
				class="volume-slider"
				onpointerdown={handleVolumePointer}
				onpointermove={handleVolumeMove}
				onpointerup={handleVolumeEnd}
				onpointercancel={handleVolumeEnd}
				onkeydown={handleVolumeKeyDown}
				role="slider"
				tabindex="0"
				aria-label="Volume"
				aria-valuemin="0"
				aria-valuemax="100"
				aria-valuenow={volumePercent}
			>
				<div
					class="volume-fill"
					style={`width: ${volumePercent}%`}
				></div>
			</div>
		</div>
	</div>
</div>

<style>
	.title-row {
		margin-bottom: 0.40rem; /* 歌手与曲名的垂直间距，可按需微调 */
		min-width: 0;
	}

	.marquee-container {
		overflow: hidden;
		min-width: 0;
	}

	.marquee-track {
		display: inline-block;
		white-space: nowrap;
		font-weight: 600;
		color: var(--content-main);
		line-height: 1.1;
		will-change: transform;
	}

	.marquee-track.marquee {
		animation: title-marquee var(--marquee-dur, 8s) linear infinite;
	}

	@keyframes title-marquee {
		/* 左侧停 → 35% 往左滚到右端 → 右端停 → 85% 往右滚回左端 → 左端停（往返同速） */
		0% {
			transform: translateX(0);
		}
		35% {
			transform: translateX(calc(var(--marquee-dist, 0px) * -1));
		}
		50% {
			transform: translateX(calc(var(--marquee-dist, 0px) * -1));
		}
		85% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(0);
		}
	}

	:global(.dark) .marquee-track {
		color: rgb(245 245 245);
	}

	.artist-text {
		font-size: 0.75rem;
		color: var(--content-meta);
		display: block;
	}

	.artist-row {
		margin-bottom: 0.36rem;
	}

	.meta-row {
		display: flex;
		align-items: center;
		min-width: 0;
		justify-content: flex-start;
	}

	.volume-wrap {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 0;
		justify-content: flex-start;
	}

	.volume-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.3rem;
		border-radius: 0.375rem;
		color: var(--content-meta);
		transition: color 150ms ease;
		margin-left: -0.31rem; /* 音量按钮向左偏移，可按需微调 */
	}

	.volume-btn:hover {
		color: var(--primary);
	}

	.volume-slider {
		position: relative;
		width: 4rem;
		height: 0.25rem;
		border-radius: 9999px;
		background: color-mix(
			in srgb,
			var(--btn-regular-bg) 80%,
			var(--content-meta) 20%
		);
		overflow: hidden;
		cursor: pointer;
		flex-shrink: 0;
		transition: height 150ms ease;
	}

	.volume-slider:hover,
	.volume-slider:focus-visible {
		height: 0.375rem;
	}

	.volume-fill {
		height: 100%;
		background: var(--primary);
		border-radius: inherit;
		transition: width 100ms linear;
	}

	.volume-slider:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: 2px;
	}

	@media (width < 520px) {
		.artist-row {
			margin-bottom: 0.28rem;
		}

		.volume-wrap {
			gap: 0.25rem;
		}

		.volume-btn {
			width: 1.25rem;
			height: 1.25rem;
		}

		.volume-slider {
			width: 3.2rem;
		}
	}
</style>
