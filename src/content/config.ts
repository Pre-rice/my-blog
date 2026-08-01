import { defineCollection, z } from "astro:content";

/**
 * 解析 published 的原始值，兼容：
 *   - "2026-08-01"（纯日期）
 *   - "2026-08-01-3"（同日排序 order 后缀，数字越大表示发布时间越靠后即更新，列表显示越靠前；不写默认为 0）
 * 返回 { date, order }，date 为 UTC 午夜（与 z.coerce.date() 对 "YYYY-MM-DD" 的解析一致）。
 */
function parsePublished(val: unknown): { date: Date; order: number } {
	const raw =
		val instanceof Date
			? val.toISOString().slice(0, 10)
			: String(val ?? "");
	const m = raw.match(/^(\d{4}-\d{2}-\d{2})(?:-(\d+))?$/);
	if (m) {
		return {
			date: new Date(m[1]),
			order: m[2] !== undefined ? Number(m[2]) : 0,
		};
	}
	const date = new Date(raw);
	return { date: Number.isNaN(date.getTime()) ? new Date() : date, order: 0 };
}

// type: 'content' 让 posts 集合在 astro 的类型系统里落在 ContentEntryMap
// （astro-typst 官方 demo 的写法；缺失时集合会被当成 Data 集合，render 类型错乱）
const postsCollection = defineCollection({
	type: "content",
	schema: z
		.object({
			title: z.string(),
			// 输入允许 YAML 的 Date / 字符串（.typ 文章是字符串），
			// 在下方 transform 里解析出真正的 Date 与同日排序 order（-N 后缀）。
			published: z.preprocess(
				(val) =>
					val instanceof Date
						? val.toISOString().slice(0, 10)
						: String(val ?? ""),
				z.string(),
			),
			updated: z.coerce.date().optional(),
			draft: z.boolean().optional().default(false),
			description: z.string().optional().default(""),
			image: z.string().optional().default(""),
			tags: z.array(z.string()).optional().default([]),
			category: z.string().optional().nullable().default(""),

			/* For internal use */
			// 同一天文章的排序权重（由 published 的 -N 后缀自动解析，无需在 frontmatter 手写；
			// 数字大 = 发布时间更靠后 = 列表显示靠前）
			publishedOrder: z.number().default(0),
			prevTitle: z.string().default(""),
			prevSlug: z.string().default(""),
			nextTitle: z.string().default(""),
			nextSlug: z.string().default(""),
		})
		.transform((data) => {
			const { date, order } = parsePublished(data.published);
			return { ...data, published: date, publishedOrder: order };
		}),
});
const specCollection = defineCollection({
	type: "content",
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
