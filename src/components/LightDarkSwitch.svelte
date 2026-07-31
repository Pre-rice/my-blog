<!-- 主题切换组件：深浅色模式切换始终只通过点击，不弹出选择窗口 -->
<script lang="ts">
import { AUTO_MODE, DARK_MODE, LIGHT_MODE } from "@constants/constants.ts";
import Icon from "@iconify/svelte";
import {
	applyThemeToDocument,
	getStoredTheme,
	setTheme,
} from "@utils/setting-utils.ts";
import { onMount } from "svelte";
import type { LIGHT_DARK_MODE } from "@/types/config.ts";

// 本组件刻意使用 Svelte 传统响应式语法（而非 runes），
// 规避 @astrojs/svelte 对 client:only runes 组件的类型退化问题（ts(2322)）。
const seq: LIGHT_DARK_MODE[] = [LIGHT_MODE, DARK_MODE, AUTO_MODE];
let mode: LIGHT_DARK_MODE = AUTO_MODE;

onMount(() => {
	mode = getStoredTheme();
	const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
	const changeThemeWhenSchemeChanged: Parameters<
		typeof darkModePreference.addEventListener<"change">
	>[1] = (_e) => {
		applyThemeToDocument(mode);
	};
	darkModePreference.addEventListener("change", changeThemeWhenSchemeChanged);
	return () => {
		darkModePreference.removeEventListener(
			"change",
			changeThemeWhenSchemeChanged,
		);
	};
});

function switchScheme(newMode: LIGHT_DARK_MODE) {
	mode = newMode;
	setTheme(newMode);
}

function toggleScheme() {
	let i = 0;
	for (; i < seq.length; i++) {
		if (seq[i] === mode) {
			break;
		}
	}
	switchScheme(seq[(i + 1) % seq.length]);
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
	<div class="absolute" class:opacity-0={mode !== AUTO_MODE}>
		<Icon icon="material-symbols:radio-button-partial-outline" class="text-[1.25rem]"></Icon>
	</div>
</button>
