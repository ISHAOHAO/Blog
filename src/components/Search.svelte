<script lang="ts">
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import Icon from "@iconify/svelte";
import { url } from "@utils/url-utils.ts";
import { onMount } from "svelte";
import type { SearchResult } from "@/global";

let keywordDesktop = "";
let keywordMobile = "";
let result: SearchResult[] = [];
let isSearching = false;
let pagefindLoaded = false;
let initialized = false;
let selectedTag = "";
let selectedCategory = "";
let selectedYear = "";
let availableTags: string[] = [];
let availableCategories: string[] = [];
let availableYears: string[] = [];

const filterValues = (
	filters: Record<string, Record<string, number>>,
	key: string,
): string[] =>
	Object.keys(filters[key] ?? {}).sort((a, b) =>
		a.localeCompare(b, "zh-CN", { numeric: true }),
	);

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

const search = async (
	keyword: string,
	isDesktop: boolean,
	tag = selectedTag,
	category = selectedCategory,
	year = selectedYear,
): Promise<void> => {
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
			const filters: Record<string, string> = {};
			if (tag) filters.tag = tag;
			if (category) filters.category = category;
			if (year) filters.year = year;
			const response = await window.pagefind.search(
				keyword,
				Object.keys(filters).length > 0 ? { filters } : undefined,
			);
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
	const initializeSearch = async () => {
		initialized = true;
		pagefindLoaded =
			typeof window !== "undefined" &&
			!!window.pagefind &&
			typeof window.pagefind.search === "function";
		if (pagefindLoaded && typeof window.pagefind.filters === "function") {
			const filters = await window.pagefind.filters();
			availableTags = filterValues(filters, "tag");
			availableCategories = filterValues(filters, "category");
			availableYears = filterValues(filters, "year").reverse();
		}
		if (keywordDesktop) search(keywordDesktop, true);
		if (keywordMobile) search(keywordMobile, false);
	};

	if (import.meta.env.DEV) {
		console.log(
			"Pagefind is not available in development mode. Using mock data.",
		);
		initializeSearch();
	} else {
		const handleReady = () => initializeSearch();
		const handleError = () => {
			console.warn(
				"Pagefind load error event received. Search functionality will be limited.",
			);
			initializeSearch(); // Initialize with pagefindLoaded as false
		};
		document.addEventListener("pagefindready", handleReady);
		document.addEventListener("pagefindloaderror", handleError);

		// Fallback in case events are not caught or pagefind is already loaded by the time this script runs
		const fallbackTimer = window.setTimeout(() => {
			if (!initialized) {
				initializeSearch();
			}
		}, 2000); // Adjust timeout as needed

		return () => {
			window.clearTimeout(fallbackTimer);
			document.removeEventListener("pagefindready", handleReady);
			document.removeEventListener("pagefindloaderror", handleError);
		};
	}
});

$: if (initialized && keywordDesktop) {
	(async () => {
		await search(
			keywordDesktop,
			true,
			selectedTag,
			selectedCategory,
			selectedYear,
		);
	})();
}

$: if (initialized && keywordMobile) {
	(async () => {
		await search(
			keywordMobile,
			false,
			selectedTag,
			selectedCategory,
			selectedYear,
		);
	})();
}
</script>

<!-- search bar for desktop view -->
<div id="search-bar" class="hidden lg:flex transition-all items-center h-11 mr-2 rounded-lg
      bg-black/[0.04] hover:bg-black/[0.06] focus-within:bg-black/[0.06]
      dark:bg-white/5 dark:hover:bg-white/10 dark:focus-within:bg-white/10
">
    <Icon icon="material-symbols:search" class="absolute text-[1.25rem] pointer-events-none ml-3 transition my-auto text-black/30 dark:text-white/30"></Icon>
    <input placeholder="{i18n(I18nKey.search)}" bind:value={keywordDesktop} on:focus={() => search(keywordDesktop, true)}
           class="transition-all pl-10 text-sm bg-transparent outline-0
         h-full w-40 active:w-60 focus:w-60 text-black/50 dark:text-white/50"
    >
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
        <input placeholder="Search" bind:value={keywordMobile}
               class="pl-10 absolute inset-0 text-sm bg-transparent outline-0
               focus:w-60 text-black/50 dark:text-white/50"
        >
    </div>

    {#if availableTags.length > 0 || availableCategories.length > 0 || availableYears.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
        <select bind:value={selectedCategory} aria-label="按分类筛选" class="h-9 rounded-lg px-2 text-sm bg-[var(--btn-regular-bg)] text-75 outline-none">
          <option value="">全部分类</option>
          {#each availableCategories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <select bind:value={selectedTag} aria-label="按标签筛选" class="h-9 rounded-lg px-2 text-sm bg-[var(--btn-regular-bg)] text-75 outline-none">
          <option value="">全部标签</option>
          {#each availableTags as tag}
            <option value={tag}>{tag}</option>
          {/each}
        </select>
        <select bind:value={selectedYear} aria-label="按年份筛选" class="h-9 rounded-lg px-2 text-sm bg-[var(--btn-regular-bg)] text-75 outline-none">
          <option value="">全部年份</option>
          {#each availableYears as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </div>
    {/if}

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
