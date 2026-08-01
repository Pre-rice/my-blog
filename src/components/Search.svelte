<!-- 搜索组件 -->
<script lang="ts">
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onDestroy, onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let isDesktopSearchExpanded = false;
let focusTimer: ReturnType<typeof setTimeout>;
let windowJustFocused = false;
// 点击清空按钮后，鼠标移出搜索框也不再收起（直到用户点击外部）
let suppressCollapseOnLeave = false;
// 鼠标按下时是否位于搜索组件外部（配合 pointerup 判断“按下与松开都在外”才收起）
let pointerDownOutside = false;

const fakeResult: SearchResult[] = [
	{
		url: url("/"),
		meta: {
			title: "This Is a Fake Search Result",
		},
		excerpt:
			"Because the search cannot work in the <mark>dev</mark> environment.",
	},
	{
		url: url("/"),
		meta: {
			title: "If You Want to Test the Search",
		},
		excerpt: "Try running <mark>npm build && npm preview</mark> instead.",
	},
];

const togglePanel = () => {
	const panel = document.getElementById("search-panel");
	panel?.classList.toggle("float-panel-closed");
};

const setPanelVisibility = (show: boolean, isDesktop: boolean): void => {
	const panel = document.getElementById("search-panel");
	if (!panel || !isDesktop) return;

	if (show) {
		panel.classList.remove("float-panel-closed");
	} else {
		panel.classList.add("float-panel-closed");
	}
};

const toggleDesktopSearch = () => {
	// 如果窗口刚获得焦点，不自动展开搜索框
	if (windowJustFocused) {
		return;
	}
	isDesktopSearchExpanded = !isDesktopSearchExpanded;
	if (isDesktopSearchExpanded) {
		setTimeout(() => {
			const input = document.getElementById(
				"search-input-desktop",
			) as HTMLInputElement | null;
			input?.focus();
		}, 0);
	}
};

const collapseDesktopSearch = () => {
	// 点击清空按钮后保持展开，直到用户点击搜索框外部
	if (suppressCollapseOnLeave) return;
	if (!keywordDesktop) {
		isDesktopSearchExpanded = false;
	}
};

/**
 * 判断点击目标是否位于搜索组件内部（搜索框 / 结果面板 / 移动端开关按钮）。
 * 点击内部时保持搜索框与结果展开，点击外部才收回。
 */
function isInsideSearchWidget(target: EventTarget | null): boolean {
	if (!(target instanceof Node)) return false;
	const bar = document.getElementById("search-bar");
	const panel = document.getElementById("search-panel");
	const switchBtn = document.getElementById("search-switch");
	return (
		bar?.contains(target) ||
		panel?.contains(target) ||
		switchBtn?.contains(target) ||
		false
	);
}

/**
 * 点击搜索结果子项时保持搜索框与结果列表展开（页面切换后依旧保持）；
 * 只有“按下与松开鼠标都位于搜索组件外部”时才收回搜索框并关闭结果面板。
 * 不用 click 事件判断：在框内长按选中文本、拖到框外松手时，click 的 target
 * 会退化为共同祖先（body），导致误判为外部点击而收起。
 */
function handleDocPointerDown(event: PointerEvent) {
	pointerDownOutside = !isInsideSearchWidget(event.target);
}

function handleDocPointerUp(event: PointerEvent) {
	if (!pointerDownOutside || isInsideSearchWidget(event.target)) {
		return;
	}
	// 恢复"鼠标移出空搜索框即收起"的正常行为
	suppressCollapseOnLeave = false;
	isDesktopSearchExpanded = false;
	setPanelVisibility(false, true);
}

/** 清空搜索关键词与结果，并让输入框重新聚焦 */
function clearSearch() {
	keywordDesktop = "";
	result = [];
	setPanelVisibility(false, true);
	// 点击清空后搜索框保持展开，鼠标移开也不收起（直到点击外部）
	suppressCollapseOnLeave = true;
	isDesktopSearchExpanded = true;
	document.getElementById("search-input-desktop")?.focus();
}

const search = async (keyword: string, isDesktop: boolean): Promise<void> => {
	if (!keyword) {
		setPanelVisibility(false, isDesktop);
		result = [];
		return;
	}

	if (!initialized) {
		return;
	}

	isSearching = true;

	try {
		let searchResults: SearchResult[] = [];

		if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
			const response = await window.pagefind.search(keyword);
			searchResults = await Promise.all(
				response.results.map((item) => item.data()),
			);
		} else if (import.meta.env.DEV) {
			searchResults = fakeResult;
		} else {
			searchResults = [];
			console.error("Pagefind is not available in production environment.");
		}

		result = searchResults;
		setPanelVisibility(result.length > 0, isDesktop);
	} catch (error) {
		console.error("Search error:", error);
		result = [];
		setPanelVisibility(false, isDesktop);
	} finally {
		isSearching = false;
	}
};

onMount(() => {
	const initializeSearch = () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		console.log("Pagefind status on init:", pagefindLoaded);
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
		initializeSearch();
	} else {
		document.addEventListener("pagefindready", () => {
			console.log("Pagefind ready event received.");
			initializeSearch();
		});
		document.addEventListener("pagefindloaderror", () => {
			console.warn(
				"Pagefind load error event received. Search functionality will be limited.",
			);
			initializeSearch(); // Initialize with pagefindLoaded as false
		});

		// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
		setTimeout(() => {
			if (!initialized) {
				console.log("Fallback: Initializing search after timeout.");
				initializeSearch();
			}
		}, 2000); // Adjust timeout as needed
	}

	// 监听窗口焦点事件，防止切换窗口时自动展开搜索框
	const handleFocus = () => {
		windowJustFocused = true;
		clearTimeout(focusTimer);
		focusTimer = setTimeout(() => {
			windowJustFocused = false;
		}, 500); // 500ms 后才允许 mouseenter 触发展开
	};
	window.addEventListener("focus", handleFocus);

	// 点击外部收回搜索框：用 pointerdown/pointerup 而非 click，避免点击结果子项触发收回，
	// 也避免在框内选中文本拖到框外松手时误收起
	document.addEventListener("pointerdown", handleDocPointerDown);
	document.addEventListener("pointerup", handleDocPointerUp);

	return () => {
		window.removeEventListener("focus", handleFocus);
		document.removeEventListener("pointerdown", handleDocPointerDown);
		document.removeEventListener("pointerup", handleDocPointerUp);
	};
});

onDestroy(() => {
	clearTimeout(focusTimer);
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(keywordDesktop, true);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(keywordMobile, false);
	})();
}
</script>

<!-- search bar for desktop view（默认折叠为图标，hover 时展开输入框） -->
<div class="hidden lg:block relative w-11 h-11 shrink-0">
	<div
		id="search-bar"
		class:expanded={isDesktopSearchExpanded}
		class="flex transition-all duration-500 items-center h-11 rounded-lg absolute right-0 top-0 shrink-0 bg-transparent cursor-pointer overflow-hidden
            {isDesktopSearchExpanded
				? "w-48 bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06] dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10"
				: "w-11 hover:bg-black/[0.06] dark:hover:bg-white/10"}
        "
		on:mouseenter={() => {
			if (!isDesktopSearchExpanded) {
				toggleDesktopSearch();
			}
		}}
		on:mouseleave={collapseDesktopSearch}
		on:click={() => {
			const input = document.getElementById(
				"search-input-desktop",
			) as HTMLInputElement | null;
			input?.focus();
		}}
	>
		<!-- 图标固定不动，input 从图标右侧恒定距离处随按钮宽度展开 -->
		<Icon
			icon="material-symbols:search"
			class="shrink-0 text-[1.25rem] pointer-events-none ml-3 transition-colors duration-500 {isDesktopSearchExpanded
				? "text-black/30 dark:text-white/30"
				: "text-black/75 dark:text-white/75"}"
		></Icon>
		<input
			id="search-input-desktop"
			placeholder="搜索"
			bind:value={keywordDesktop}
			on:focus={() => {
				if (!isDesktopSearchExpanded) {
					toggleDesktopSearch();
				}
				search(keywordDesktop, true);
			}}
			class="transition-all duration-500 min-w-0 pl-2 text-sm bg-transparent outline-0
                h-full flex-1 {isDesktopSearchExpanded
				? "opacity-100"
				: "opacity-0 pointer-events-none"} text-black/50 dark:text-white/50"
		/>
		{#if isDesktopSearchExpanded && keywordDesktop}
			<button
				type="button"
				aria-label="清空搜索"
				class="shrink-0 flex items-center justify-center w-7 h-7 mr-2 rounded-md text-black/35 hover:text-black/80 hover:bg-black/[0.06] dark:text-white/35 dark:hover:text-white/90 dark:hover:bg-white/10 transition-colors duration-200"
				on:click|stopPropagation={clearSearch}
			>
				<Icon icon="material-symbols:close-rounded" class="text-[1.125rem]"></Icon>
			</button>
		{/if}
	</div>
</div>

<!-- toggle btn for phone/tablet view -->
<button on:click={togglePanel} aria-label="Search Panel" id="search-switch"
        class="btn-plain scale-animation lg:!hidden rounded-lg w-11 h-11 active:scale-90">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

<!-- search panel -->
<div id="search-panel" class="float-panel float-panel-closed search-panel absolute md:w-[30rem]
top-20 left-4 md:left-[unset] right-4 shadow-2xl rounded-2xl p-2">

    <!-- search bar inside panel for phone/tablet -->
    <div id="search-bar-inside" class="flex relative lg:hidden transition-all items-center h-11 rounded-xl
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
  ">
        <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
		<input placeholder="搜索" bind:value={keywordMobile}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    <!-- search results -->
    {#each result as item}
        <a href={item.url}
           class="transition first-of-type:mt-2 lg:first-of-type:mt-0 group block
       rounded-xl text-lg px-3 py-2 hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
            <div class="transition text-90 inline-flex font-bold group-hover:text-[var(--primary)]">
                {item.meta.title}<Icon icon="fa6-solid:chevron-right" class="transition text-[0.75rem] translate-x-1 my-auto text-[var(--primary)]"></Icon>
            </div>
            <div class="transition text-sm text-50">
                {@html item.excerpt}
            </div>
        </a>
    {/each}
</div>

<style>
  input:focus {
    outline: 0;
  }
  .search-panel {
    max-height: calc(100vh - 100px);
    overflow-y: auto;
  }

</style>
