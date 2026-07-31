/**
 * 音乐播放器构建时元数据识别（Astro 集成）
 *
 * 在 dev / build / check 加载配置时自动执行：
 *   1. 扫描 public/music/url/ 下的所有音频文件；
 *   2. 读取 src/config.ts 中 musicPlayerConfig.localPlaylist 的条目作为“覆盖项”
 *      （同 url 的条目：id 及已填写的 title/artist/cover/duration 优先）；
 *   3. 对每首歌解析音频元数据，自动识别标题、歌手、时长，
 *      内嵌封面提取到 public/music/cover/（按专辑命名，已存在则复用）；
 *   4. 将最终播放列表写入
 *      src/components/widget/music-sidebar/music-playlist.generated.ts。
 *
 * 也可直接运行：node src/plugins/music-metadata.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseFile } from "music-metadata";
import ts from "typescript";

const ROOT = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
	"..",
);
const CONFIG_FILE = path.join(ROOT, "src", "config.ts");
const PUBLIC_DIR = path.join(ROOT, "public");
const URL_DIR = path.join(PUBLIC_DIR, "music", "url");
const COVER_DIR = path.join(PUBLIC_DIR, "music", "cover");
const OUTPUT_FILE = path.join(
	ROOT,
	"src",
	"components",
	"widget",
	"music-sidebar",
	"music-playlist.generated.ts",
);

/** 支持的音频文件扩展名 */
const AUDIO_EXT_RE =
	/\.(mp3|flac|m4a|mp4|aac|ogg|opus|oga|wav|wma|ape|wv|aiff|alac)$/i;

/** 从 TypeScript 源码中提取 musicPlayerConfig.localPlaylist 的原始条目。 */
function extractLocalPlaylist(sourceCode) {
	const sourceFile = ts.createSourceFile(
		"config.ts",
		sourceCode,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);

	let entries = [];

	const getPropValue = (objectLiteral, propName) => {
		const prop = objectLiteral.properties.find(
			(p) =>
				ts.isPropertyAssignment(p) && p.name.getText(sourceFile) === propName,
		);
		if (!prop || !ts.isPropertyAssignment(prop)) {
			return undefined;
		}
		const value = prop.initializer;
		if (
			ts.isStringLiteral(value) ||
			ts.isNoSubstitutionTemplateLiteral(value)
		) {
			return value.text;
		}
		if (ts.isNumericLiteral(value)) {
			return Number(value.text);
		}
		if (
			ts.isPrefixUnaryExpression(value) &&
			value.operator === ts.SyntaxKind.MinusToken &&
			ts.isNumericLiteral(value.operand)
		) {
			return -Number(value.operand.text);
		}
		// 非字面量写法（变量/表达式）无法静态解析，返回 undefined
		return undefined;
	};

	const visit = (node) => {
		if (
			ts.isVariableDeclaration(node) &&
			node.name.getText(sourceFile) === "musicPlayerConfig"
		) {
			const initializer = node.initializer;
			if (initializer && ts.isObjectLiteralExpression(initializer)) {
				const playlistProp = initializer.properties.find(
					(p) =>
						ts.isPropertyAssignment(p) &&
						p.name.getText(sourceFile) === "localPlaylist",
				);
				if (
					playlistProp &&
					ts.isPropertyAssignment(playlistProp) &&
					ts.isArrayLiteralExpression(playlistProp.initializer)
				) {
					entries = playlistProp.initializer.elements
						.map((element) => {
							if (!ts.isObjectLiteralExpression(element)) {
								return null;
							}
							return {
								id: getPropValue(element, "id"),
								title: getPropValue(element, "title"),
								artist: getPropValue(element, "artist"),
								cover: getPropValue(element, "cover"),
								url: getPropValue(element, "url"),
								duration: getPropValue(element, "duration"),
							};
						})
						.filter((entry) => entry !== null);
				}
			}
		}
		ts.forEachChild(node, visit);
	};

	visit(sourceFile);
	return entries;
}

/** 把图片 MIME 类型映射为文件扩展名。 */
function extFromFormat(format) {
	if (!format) return "jpg";
	const lower = String(format).toLowerCase();
	const mimeMap = {
		"image/jpeg": "jpg",
		"image/jpg": "jpg",
		"image/png": "png",
		"image/webp": "webp",
		"image/gif": "gif",
		"image/bmp": "bmp",
		"image/x-icon": "ico",
		"image/avif": "avif",
	};
	if (mimeMap[lower]) return mimeMap[lower];
	const bare = lower.replace(/^image\//, "");
	if (/^[a-z0-9]+$/.test(bare)) return bare;
	return "jpg";
}

/** 去除文件名中在文件系统里不合法的字符。 */
function sanitizeFileName(name) {
	return (
		name
			// biome-ignore lint/suspicious/noControlCharactersInRegex: 需要过滤文件名中的控制字符
			.replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
			.replace(/\s+/g, " ")
			.trim()
	);
}

/** 从内嵌封面提取图片到 public/music/cover/，返回站点相对路径。 */
function writeCover(picture, audioUrl, meta) {
	const baseName = sanitizeFileName(
		meta.common.album ||
			meta.common.title ||
			audioUrl
				.split("/")
				.pop()
				.replace(/\.[^.]+$/, "") ||
			"cover",
	);
	const fileName = `${baseName}.${extFromFormat(picture.format)}`;
	const absolutePath = path.join(COVER_DIR, fileName);
	const relativePath = `music/cover/${fileName}`;

	// 已存在则直接复用（避免覆盖用户手动放置的封面）
	if (!fs.existsSync(absolutePath)) {
		fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
		fs.writeFileSync(absolutePath, Buffer.from(picture.data));
	}
	return relativePath;
}

/** 扫描本地音频目录，返回排序后的文件名列表（如 "xx.mp3"）。 */
function scanAudioFiles() {
	if (!fs.existsSync(URL_DIR)) {
		return [];
	}
	return fs
		.readdirSync(URL_DIR)
		.filter((name) => AUDIO_EXT_RE.test(name))
		.sort();
}

/** 从文件名推断标题（无元数据时的兜底）。 */
function titleFromFileName(url) {
	const base = url.split("/").pop() || "";
	return base.replace(/\.[^.]+$/, "");
}

/** 分配唯一 id：优先用配置里填的，冲突或未填则取最小可用正整数。 */
function nextAvailableId(usedIds, preferred) {
	if (
		preferred !== undefined &&
		Number.isInteger(preferred) &&
		preferred > 0 &&
		!usedIds.has(preferred)
	) {
		usedIds.add(preferred);
		return preferred;
	}
	let id = 1;
	while (usedIds.has(id)) {
		id += 1;
	}
	usedIds.add(id);
	return id;
}

/** 解析一首歌：config 覆盖优先，留空字段从音频元数据自动识别。 */
async function resolveSong(entry, url, usedIds) {
	const resolved = {
		id: nextAvailableId(usedIds, entry?.id),
		title: (entry?.title || "").trim(),
		artist: (entry?.artist || "").trim(),
		cover: (entry?.cover || "").trim(),
		url,
		duration: Number(entry?.duration) || 0,
	};

	// 在线地址无法在构建时解析元数据，原样保留
	if (/^https?:\/\//i.test(url)) {
		return resolved;
	}

	const audioPath = path.join(PUBLIC_DIR, url.replace(/^\/+/, ""));
	if (!fs.existsSync(audioPath)) {
		if (entry) {
			console.warn(
				`[music-metadata] 音频文件不存在：${audioPath}（保留配置原值）`,
			);
		}
		return resolved;
	}

	try {
		const meta = await parseFile(audioPath, { duration: true });
		const { common, format } = meta;

		if (!resolved.title) {
			resolved.title = (common.title || "").trim() || titleFromFileName(url);
		}
		if (!resolved.artist) {
			resolved.artist =
				(common.artist || common.albumartist || "").trim() || "";
		}
		if (!resolved.cover && common.picture && common.picture.length > 0) {
			resolved.cover = writeCover(common.picture[0], url, meta);
		}
		if (!resolved.duration && typeof format.duration === "number") {
			resolved.duration = Math.round(format.duration);
		}

		const detected = [];
		if ((entry?.title || "").trim() === "" && resolved.title) {
			detected.push("title");
		}
		if ((entry?.artist || "").trim() === "" && resolved.artist) {
			detected.push("artist");
		}
		if ((entry?.cover || "").trim() === "" && resolved.cover) {
			detected.push("cover");
		}
		if (!(Number(entry?.duration) || 0) && resolved.duration) {
			detected.push("duration");
		}
		console.log(
			`[music-metadata] ${url} → 已识别：${
				detected.length > 0 ? detected.join("、") : "（全部使用配置值）"
			}`,
		);
	} catch (error) {
		console.warn(
			`[music-metadata] 解析音频元数据失败：${audioPath}（${error.message}，保留配置原值）`,
		);
	}

	return resolved;
}

/** 生成最终播放列表并写入生成文件。 */
async function generatePlaylist() {
	if (!fs.existsSync(CONFIG_FILE)) {
		console.warn(`[music-metadata] 找不到配置文件：${CONFIG_FILE}`);
		return;
	}

	const rawEntries = extractLocalPlaylist(fs.readFileSync(CONFIG_FILE, "utf8"));
	const entryByUrl = new Map();
	for (const entry of rawEntries) {
		if (entry.url) {
			entryByUrl.set(String(entry.url).trim().replace(/^\/+/, ""), entry);
		}
	}

	const usedIds = new Set();
	const playlist = [];
	const scanned = scanAudioFiles();
	const scannedUrls = new Set(
		scanned.map((fileName) => `music/url/${fileName}`),
	);

	// 1. 目录扫描到的音频文件（自动识别；config 同 url 条目作为覆盖）
	for (const fileName of scanned) {
		const url = `music/url/${fileName}`;
		playlist.push(await resolveSong(entryByUrl.get(url), url, usedIds));
	}

	// 2. config 里写了但目录中不存在的条目（如在线地址或尚未放入的文件）
	for (const entry of rawEntries) {
		const url = (entry.url || "").trim().replace(/^\/+/, "");
		if (!url || scannedUrls.has(url)) {
			continue;
		}
		playlist.push(await resolveSong(entry, url, usedIds));
	}

	// 写入生成文件
	const lines = [
		"// 本文件由 src/plugins/music-metadata.mjs 在构建时自动生成，请勿手动编辑。",
		"// 修改 src/config.ts 中的 localPlaylist 或更换音频文件后，重新构建即可自动更新。",
		'import type { Song } from "../../../types/music";',
		"",
		"export const musicPlaylist: Song[] = [",
	];
	for (const song of playlist) {
		lines.push("\t{");
		lines.push(`\t\tid: ${song.id},`);
		lines.push(`\t\ttitle: ${JSON.stringify(song.title)},`);
		lines.push(`\t\tartist: ${JSON.stringify(song.artist)},`);
		lines.push(`\t\tcover: ${JSON.stringify(song.cover)},`);
		lines.push(`\t\turl: ${JSON.stringify(song.url)},`);
		lines.push(`\t\tduration: ${song.duration},`);
		lines.push("\t},");
	}
	lines.push("];");
	lines.push("");

	fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
	fs.writeFileSync(OUTPUT_FILE, lines.join("\n"), "utf8");
	console.log(
		`[music-metadata] 已生成 ${OUTPUT_FILE}（共 ${playlist.length} 首）`,
	);
}

/** Astro 集成：dev / build / check 加载配置时自动识别。 */
export function musicMetadata() {
	return {
		name: "music-metadata",
		hooks: {
			async "astro:config:setup"() {
				try {
					await generatePlaylist();
				} catch (error) {
					console.error("[music-metadata] 执行失败：", error);
				}
			},
		},
	};
}

// 直接运行：node src/plugins/music-metadata.mjs
const THIS_FILE = fileURLToPath(import.meta.url);
const isMain =
	process.argv[1] && path.resolve(process.argv[1]) === path.resolve(THIS_FILE);
if (isMain) {
	generatePlaylist()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error("[music-metadata] 执行失败：", error);
			process.exit(1);
		});
}
