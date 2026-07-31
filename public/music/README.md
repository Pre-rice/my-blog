# 本地音乐文件

本目录存放音乐播放器（右侧栏播放器）使用的本地音频资源。

## 目录结构

```
public/music/
├── url/       # 音频文件（.mp3 等）
├── cover/     # 封面图片（含构建时自动提取的内嵌封面）
└── README.md  # 本文件
```

## 添加歌曲步骤

1. 将音频文件放入 `public/music/url/`（如 `example.mp3`）
2. 重新运行 `pnpm dev` / `pnpm build`

构建时（`src/plugins/music-metadata.mjs`）会自动扫描该目录，并识别每首歌的：

- 标题（音频元数据中的 title，识别不到则用文件名）
- 歌手（元数据中的 artist / albumartist）
- 封面（提取音频内嵌封面，存到 `public/music/cover/`，已存在则不覆盖）
- 时长（秒）

## 自定义某首歌（可选）

`src/config.ts` 中 `musicPlayerConfig` 的 `localPlaylist` 留空即可全自动；
如需覆盖某首歌的显示信息，按 url 添加条目（填的字段优先，没填的仍自动识别）：

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

## 切换为在线歌单（Meting 模式）

编辑 `src/config.ts` 中 `musicPlayerConfig`，将 `mode` 改为 `"meting"` 并填写 `id`：

```ts
export const musicPlayerConfig: MusicPlayerConfig = {
	enable: true,
	mode: "meting", // 改为 meting
	id: "你的歌单ID",
	localPlaylist: [], // meting 模式下可留空
	defaultSong: {...},
};
```

> 注意：Meting 在线接口稳定性依赖第三方 API，若加载失败请检查网络或改用 local 模式。
