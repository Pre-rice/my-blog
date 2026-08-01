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
// 标题文本（派生值）：只追踪字符串本身，避免父组件每次广播状态
// （timeupdate 等高频）传入新的 currentSong 对象导致 $effect 频繁重跑、清掉滚动定时器
const titleText = $derived(currentSong.title);
// 标题是否溢出（需滚动）：溢出时轨道才渲染第二份副本用于无缝循环
let shouldMarquee = $state(false);

// ---- 可微调参数 ----
/** 切歌后先停顿的时长（毫秒）：让用户看清新标题再开始循环滚动 */
const LEFT_HOLD_MS = 2500;
/** 滚动速度：标题每移动 1px 所需的毫秒数 */
const MS_PER_PX = 35;
/** 循环滚动时两份标题副本之间的间距（像素） */
const GAP_PX = 25;

/** 生成循环滚动 keyframes（轨道含两份标题副本，平移一个副本宽度即无缝循环），返回单圈时长（毫秒） */
function setupMarqueeKeyframes(step: number): number {
	const cycleMs = step * MS_PER_PX;
	let styleEl = document.getElementById(
		"title-marquee-kf",
	) as HTMLStyleElement | null;
	if (!styleEl) {
		styleEl = document.createElement("style");
		styleEl.id = "title-marquee-kf";
		document.head.appendChild(styleEl);
	}
	styleEl.textContent =
		"@keyframes title-marquee{" +
		"0%{transform:translateX(0)}" +
		"100%{transform:translateX(calc(var(--marquee-step,0px) * -1))}}";
	return cycleMs;
}

$effect(() => {
	// 依赖标题文本（派生值），切歌时重新计算是否溢出
	void titleText;
	if (!titleContainer || !titleTrack) {
		return;
	}
	const seg = titleTrack.firstElementChild as HTMLElement | null;
	const segW = seg?.offsetWidth ?? 0;
	const needScroll = segW > titleContainer.clientWidth;
	// 溢出时才渲染第二份副本（不溢出只显示一份，避免出现两个名字）
	shouldMarquee = needScroll;
	if (needScroll) {
		// 切歌后先停在最左侧（停 LEFT_HOLD_MS）让用户看清新标题，再启动循环滚动
		const timer = setTimeout(() => {
			if (!titleContainer || !titleTrack) return;
			const segment = titleTrack.firstElementChild as HTMLElement | null;
			const w = segment?.offsetWidth ?? 0;
			// 步长 = 一个副本宽 + 副本间距，保证循环无缝
			const step = w + GAP_PX;
			if (step <= 0) return;
			titleTrack.style.setProperty("--marquee-step", `${step}px`);
			const cycleMs = setupMarqueeKeyframes(step);
			titleTrack.style.animation = `title-marquee ${cycleMs}ms linear infinite`;
		}, LEFT_HOLD_MS);
		// effect 重跑（切歌）或组件销毁时清理定时器
		return () => clearTimeout(timer);
	}
	// 标题未溢出时停止滚动
	titleTrack.style.animation = "";
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
				<!-- 切歌时重建节点，让 marquee 动画从头（最左）开始；轨道含两份相同标题实现无缝循环 -->
				<span
					class="marquee-track"
					bind:this={titleTrack}
					style={`gap: ${GAP_PX}px`}
				>
					<span class="marquee-segment">{currentSong.title}</span>
					{#if shouldMarquee}
						<span class="marquee-segment" aria-hidden="true"
							>{currentSong.title}</span
						>
					{/if}
				</span>
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
		display: flex;
		width: max-content;
		white-space: nowrap;
		font-weight: 600;
		color: var(--content-main);
		line-height: 1.1;
		will-change: transform;
	}

	.marquee-segment {
		display: inline-block;
		white-space: nowrap;
		flex-shrink: 0;
	}

	/* 注：title-marquee 的 @keyframes 由 JS 动态注入（见 setupMarqueeKeyframes） */

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
