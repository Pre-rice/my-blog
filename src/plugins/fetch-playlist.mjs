#!/usr/bin/env node
/**
 * 抓取 QQ 音乐歌单元数据，生成静态歌单 public/music/playlist.json。
 *
 * 播放器 meting 模式现改为读取这个静态文件（见 src/config.ts 的 musicPlayerConfig.api），
 * 不再依赖任何在线 API，彻底避免歌单加载失败。
 *
 * 生成时逐首验证能否解析出真实音频地址，解析不出的（VIP/版权受限）直接剔除，
 * 保证歌单里每首都可播放，前端无需再运行时剔除。
 *
 * 构建时由 pnpm build 自动调用；也可手动运行：
 *   node src/plugins/fetch-playlist.mjs [歌单ID]   （歌单ID 默认 5715312555）
 *
 * 容错：生成失败时若已存在 playlist.json 则复用旧文件继续（避免本地构建被网络问题打断）。
 */
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const id = process.argv[2] || "5715312555";
const OUT = resolve(ROOT, "public/music/playlist.json");

/** 按 songmid 解析真实音频地址（QQ 音乐 vkey 接口），失败返回 null */
async function resolveRealUrl(songmid) {
	const data = {
		req_0: {
			module: "vkey.GetVkeyServer",
			method: "CgiGetVkey",
			param: {
				guid: String(Math.floor(1e7 * Math.random())),
				songmid: [songmid],
				songtype: [0],
				uin: "",
				loginflag: 1,
				platform: "20",
			},
		},
		comm: { uin: "", format: "json", ct: 19, cv: 0, authst: "" },
	};
	const params = new URLSearchParams({
		"-": "getplaysongvkey",
		g_tk: "5381",
		loginUin: "",
		hostUin: "0",
		format: "json",
		inCharset: "utf8",
		// ¬ 即 ¬（QQ 接口的历史遗留怪串，与前端 resolveTencentUrl 保持一致）
		outCharset: "utf-8¬ice=0",
		platform: "yqq.json",
		needNewCode: "0",
		data: JSON.stringify(data),
	});
	const res = await fetch(
		`https://u.y.qq.com/cgi-bin/musicu.fcg?${params.toString()}`,
	);
	const result = await res.json();
	const info = result?.req_0?.data;
	const purl = info?.midurlinfo?.[0]?.purl || "";
	const domain =
		info?.sip?.find((i) => !i.startsWith("http://ws")) || info?.sip?.[0] || "";
	if (!purl || !domain) return null;
	return `${domain}${purl}`.replace("http://", "https://");
}

/** 抓取歌单并生成 playlist.json（逐首剔除 VIP/版权受限歌曲） */
async function generate() {
	const url = `https://c.y.qq.com/qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg?type=1&utf8=1&disstid=${id}&loginUin=0&format=json&outCharset=utf-8`;
	const res = await fetch(url, {
		headers: { Referer: "https://y.qq.com/n/yqq/playlist" },
	});
	if (!res.ok) throw new Error(`歌单接口 HTTP ${res.status}`);
	const data = await res.json();
	const songlist = data?.cdlist?.[0]?.songlist;
	if (!Array.isArray(songlist) || songlist.length === 0) {
		throw new Error("歌单解析失败（cdlist 为空）");
	}

	const songs = [];
	const removed = [];
	for (const song of songlist) {
		const meta = {
			author: song.singer.reduce(
				(acc, v) => (acc ? acc + " / " : acc) + v.name,
				"",
			),
			title: song.songname,
			pic: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${song.albummid}.jpg`,
			url: "", // 播放时前端按 songmid 实时解析，留空
			songmid: song.songmid,
		};
		// 逐首验证可播放，VIP/版权受限（解析不出地址）的直接剔除
		try {
			const realUrl = await resolveRealUrl(song.songmid);
			if (realUrl) {
				songs.push(meta);
				console.log(`  ✓ ${meta.title}`);
			} else {
				removed.push(meta.title);
				console.log(`  ✗ ${meta.title}（VIP/版权受限）`);
			}
		} catch {
			removed.push(meta.title);
			console.log(`  ✗ ${meta.title}（解析异常）`);
		}
	}

	mkdirSync(dirname(OUT), { recursive: true });
	writeFileSync(OUT, JSON.stringify(songs, null, 2));
	console.log(
		`\n完成：${songs.length} 首可播放，剔除 ${removed.length} 首（VIP/版权受限）`,
	);
	if (removed.length) console.log("已剔除:", removed.join(" | "));
	console.log(`已生成 ${OUT}`);
}

// 构建容错：失败时若已有旧文件则复用，否则中断
try {
	await generate();
} catch (err) {
	if (existsSync(OUT)) {
		console.warn(`歌单生成失败（${err.message}），复用已有文件 ${OUT}`);
	} else {
		throw err;
	}
}
