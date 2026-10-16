# 本地音乐资源

本目录存放音乐播放器（右侧栏播放器）使用的数据与资源。

## 目录结构

```
public/music/
├── playlist.json  # 歌单数据源（meting 模式），由 pnpm playlist 生成，已纳入 git
├── url/           # 音频文件（.mp3 等，仅 local 模式使用，按需创建）
├── cover/         # 封面图片（仅 local 模式使用，构建时自动提取）
└── README.md      # 本文件
```

## 更新歌单（常用）

播放器当前是 **meting 模式**，歌单数据来源就是本目录的 `playlist.json`——一个**生成好的静态文件**，不依赖任何在线 API，所以不会出现"歌单加载失败"。

1. 在 QQ 音乐里编辑歌单（歌单 ID 见 `src/config.ts` 中 `musicPlayerConfig.id`，当前为 `5715312555`）
2. 在项目根目录运行：

   ```bash
   pnpm playlist
   ```

   等价完整命令：`node src/plugins/fetch-playlist.mjs [歌单ID]`
3. **确认输出里有 `完成：N 首可播放`** —— 只有看到这一行才算更新成功
4. 提交并推送，线上重新部署后才生效：

   ```bash
   git add public/music/playlist.json
   git commit -m "更新歌单"
   git push
   ```

脚本做的事：抓取 QQ 歌单 → 逐首调 QQ vkey 接口验证能否解析出真实音频地址 → 能播的写入 `playlist.json`，**解析不出的（VIP / 版权受限）直接剔除**，所以条目数会比 QQ 歌单里少。

> ⚠️ 脚本带容错：抓取失败时**只打印一行「歌单生成失败（…），复用已有文件」并正常退出**，文件保持旧内容。所以别只看命令有没有报错——没看到「完成：N 首可播放」就是没更新。
>
> ⚠️ 只跑脚本不 `git push`，线上永远不会变。构建流程里**刻意没有**生成歌单这一步：Vercel 构建环境访问 QQ vkey 接口受限，在那里生成会只剩极少数歌。

换歌单：`pnpm playlist <新歌单ID>`，同时把 `src/config.ts` 里的 `id` 一并改掉，之后直接 `pnpm playlist` 即可。

`playlist.json` 每首形如：

```json
{ "author": "HOYO-MiX", "title": "…", "pic": "封面 URL", "url": "", "songmid": "…" }
```

`url` 恒为空：播放时前端按 `songmid` 实时向 QQ 接口解析真实音频地址（流式播放，不落盘）。

## local 模式（播放本地音频文件）

把 `src/config.ts` 的 `musicPlayerConfig.mode` 改为 `"local"` 后，播放器改用本地文件。

1. 将音频文件放入 `public/music/url/`（如 `example.mp3`）
2. 重新运行 `pnpm dev` / `pnpm build`

构建时（`src/plugins/music-metadata.mjs`）会自动扫描该目录，并识别每首歌的：

- 标题（音频元数据中的 title，识别不到则用文件名）
- 歌手（元数据中的 artist / albumartist）
- 封面（提取音频内嵌封面，存到 `public/music/cover/`，已存在则不覆盖）
- 时长（秒）

### 自定义某首歌（可选）

`localPlaylist` 留空即可全自动；如需覆盖某首歌的显示信息，按 url 添加条目（填的字段优先，没填的仍自动识别）：

```ts
localPlaylist: [
	{
		id: 1,
		url: "music/url/example.mp3",
		title: "自定义标题", // 可选，留空自动识别
		artist: "自定义歌手", // 可选
		cover: "music/cover/custom.jpg", // 可选
		duration: 0, // 可选，0 自动读取
	},
],
```

> 提示：播放顺序默认按文件名排序；需要调整可给文件名加序号前缀（如 `01_xxx.mp3`）。
> 注意：改动配置或音频文件后，需重新运行 `pnpm dev` / `pnpm build`。

## 配置入口

`src/config.ts` 的 `musicPlayerConfig`：`mode`（`local` / `meting`）、`id` / `server` / `type`、`api`（现指向 `/music/playlist.json`）、`localPlaylist`、`defaultSong`。

想切回在线 Meting API：把 `api` 改成形如 `https://xxx/api?server=:server&type=:type&id=:id&auth=:auth&r=:r` 的地址即可。注意在线实例稳定性不受控，公共实例大概率会再次失效。
