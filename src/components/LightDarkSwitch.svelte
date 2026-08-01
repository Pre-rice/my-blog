<!-- 主题切换组件：在亮色与暗色之间切换（无跟随系统） -->
<script lang="ts">
import { DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import Icon from "@iconify/svelte";
import { getStoredTheme, setTheme } from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

// 本组件刻意使用 Svelte 传统响应式语法（而非 runes），
// 规避 @astrojs/svelte 对 client:only runes 组件的类型退化问题（ts(2322)）。
const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE];
let mode: LIGHT_DARK_MODE = DARK_MODE;

onMount(() => {
	mode = getStoredTheme();
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
}

function toggleScheme() {
	switchScheme(mode === LIGHT_MODE ? DARK_MODE : LIGHT_MODE);
}
</script>

<button
	aria-label="浅色/深色模式切换"
	class="relative btn-plain scale-animation rounded-lg h-11 w-11 active:scale-90"
	id="scheme-switch"
	on:click={toggleScheme}
>
	<div class="absolute" class:opacity-0={mode !== LIGHT_MODE}>
		<Icon icon="material-symbols:wb-sunny-outline-rounded" class="text-[1.25rem]"></Icon>
	</div>
	<div class="absolute" class:opacity-0={mode !== DARK_MODE}>
		<Icon icon="material-symbols:dark-mode-outline-rounded" class="text-[1.25rem]"></Icon>
	</div>
</button>
