<script lang="ts">
import type { Song } from "../../../../types/music";

interface Props {
	currentSong: Song;
	isPlaying: boolean;
	isLoading: boolean;
}

const { currentSong, isPlaying, isLoading }: Props = $props();

function getAssetPath(path: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	if (path.startsWith("/")) {
		return path;
	}
	return `/${path}`;
}
</script>

<div class="cover-container relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
	<img
		src={getAssetPath(currentSong.cover)}
		alt={currentSong.title}
		loading="eager"
		fetchpriority="high"
		class="w-full h-full object-cover transition-transform duration-300"
		class:spinning={isPlaying && !isLoading}
		class:animate-pulse={isLoading}
	/>
</div>

<style>
	.cover-container img {
		animation: spin-continuous 8s linear infinite;
		animation-play-state: paused;
		transform-origin: center;
	}

	.cover-container img.spinning {
		animation-play-state: running;
	}

	@keyframes spin-continuous {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
