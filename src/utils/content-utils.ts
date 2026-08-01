import { type CollectionEntry, getCollection } from "astro:content";
import type { MarkdownHeading } from "astro";
import GithubSlugger from "github-slugger";
import { getCategoryUrl } from "@utils/url-utils.ts";

const UNCATEGORIZED = "未分类";

// // Retrieve posts and sort them by publication date
async function getRawSortedPosts() {
	const allBlogPosts = await getCollection("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const sorted = allBlogPosts.sort((a, b) => {
		const dateA = a.data.published;
		const dateB = b.data.published;
		if (dateA.getTime() !== dateB.getTime()) {
			return dateA > dateB ? -1 : 1; // 日期降序（新的在前）
		}
		// 同一天：按 published 的 -N 后缀（publishedOrder）降序——数字大表示发布时间更靠后（更新），
		// 列表新在前，所以数字大的显示在前面；不写默认为 0，排在同日最后
		return (b.data.publishedOrder ?? 0) - (a.data.publishedOrder ?? 0);
	});
	return sorted;
}

export async function getSortedPosts() {
	const sorted = await getRawSortedPosts();

	for (let i = 1; i < sorted.length; i++) {
		sorted[i].data.nextSlug = sorted[i - 1].slug;
		sorted[i].data.nextTitle = sorted[i - 1].data.title;
	}
	for (let i = 0; i < sorted.length - 1; i++) {
		sorted[i].data.prevSlug = sorted[i + 1].slug;
		sorted[i].data.prevTitle = sorted[i + 1].data.title;
	}

	return sorted;
}
export type PostForList = {
	slug: string;
	data: CollectionEntry<"posts">["data"];
};
/**
 * 统计 typst 源码的可读字数（用于 .typ 文章展示"xx 字"）。
 * 粗略做法：去掉 frontmatter、公式（每段算 1 词）、命令与符号后，
 * 中文字符逐个计数，英文/数字按连续片段计数。
 */
export function countTypstWords(source: string): number {
	const body = source
		.replace(/#metadata\s*\([\s\S]*?\)\s*<frontmatter>/, "")
		.replace(/\$[\s\S]*?\$/g, " x ")
		.replace(/#\s*[a-zA-Z][\w.-]*[^\n]*/g, " ")
		.replace(/\\/g, " ")
		.replace(/[\[\](){}`|,;:!?<>#=_*~.]/g, " ");
	const cjk = body.match(/[　-〿一-鿿]/g) ?? [];
	const words = body.match(/[a-zA-Z0-9]+/g) ?? [];
	return cjk.length + words.length;
}

/**
 * 从 typst 源码提取标题，供 .typ 文章的侧栏目录（TOC）使用。
 * astro-typst 不提供 headings，这里手动解析 `= 标题` 语法：
 * 补丁把标题整体降级后 `=` → `<h1>`、`==` → `<h2>`、`===` → `<h3>`，与 .md 的 `#/##/###` 对齐，
 * 所以这里 depth 直接取 `=` 的个数（1/2/3…）。
 * slug 用 github-slugger 生成（与 .md 的 rehype-slug 同一算法），锚点 URL 形如 `#第一题`。
 */
export function extractTypstHeadings(source: string): MarkdownHeading[] {
	const slugger = new GithubSlugger();
	const headings: MarkdownHeading[] = [];
	const lines = source.split("\n");
	// 跳过 raw block（``` 代码块）内的行，避免把代码块里的 `= 标题` 误识别为标题
	let inCode = false;
	for (const line of lines) {
		if (/^`{3,}/.test(line.trim())) {
			inCode = !inCode;
			continue;
		}
		if (inCode) continue;
		const m = line.match(/^(={1,6})\s+(.+?)\s*$/);
		if (m) {
			const text = m[2].trim();
			headings.push({
				depth: m[1].length,
				slug: slugger.slug(text),
				text,
			});
		}
	}
	return headings;
}

export async function getSortedPostsList(): Promise<PostForList[]> {
	const sortedFullPosts = await getRawSortedPosts();

	// delete post.body
	const sortedPostsList = sortedFullPosts.map((post) => ({
		slug: post.slug,
		data: post.data,
	}));

	return sortedPostsList;
}
export type Tag = {
	name: string;
	count: number;
};

export async function getTagList(): Promise<Tag[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});

	const countMap: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
		post.data.tags.forEach((tag: string) => {
			if (!countMap[tag]) countMap[tag] = 0;
			countMap[tag]++;
		});
	});

	// sort tags
	const keys: string[] = Object.keys(countMap).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
	name: string;
	count: number;
	url: string;
};

export async function getCategoryList(): Promise<Category[]> {
	const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
		return import.meta.env.PROD ? data.draft !== true : true;
	});
	const count: { [key: string]: number } = {};
	allBlogPosts.forEach((post: { data: { category: string | null } }) => {
		if (!post.data.category) {
			count[UNCATEGORIZED] = count[UNCATEGORIZED]
				? count[UNCATEGORIZED] + 1
				: 1;
			return;
		}

		const categoryName =
			typeof post.data.category === "string"
				? post.data.category.trim()
				: String(post.data.category).trim();

		count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
	});

	const lst = Object.keys(count).sort((a, b) => {
		return a.toLowerCase().localeCompare(b.toLowerCase());
	});

	const ret: Category[] = [];
	for (const c of lst) {
		ret.push({
			name: c,
			count: count[c],
			url: getCategoryUrl(c),
		});
	}
	return ret;
}
