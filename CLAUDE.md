# CLAUDE.md

## 1. 项目概览与守则

- Pre-rice 的个人博客（Fuwari 深度定制），站点名以 `src/config.ts` 的 `siteConfig.title` 为准。
- 技术栈：Astro + Svelte 5（runes）+ TS strict + Tailwind + Stylus，**包管理仅 pnpm**（`preinstall` 强制）。无测试框架，质量靠 `pnpm check` + `pnpm lint`。
- **dev server 规则**：优先用用户已启动的 `localhost:4321`，未启动时才自行启动。

## 2. 常用命令

| 命令 | 用途 |
|---|---|
| `pnpm dev` | 开发服务器（日常主流程） |
| `pnpm build` | 生成歌单 + 构建 + Pagefind 索引 |
| `pnpm preview` | 预览构建产物 |
| `pnpm check` | Astro 类型检查 |
| `pnpm type-check` | 严格类型检查（`--isolatedDeclarations`） |
| `pnpm lint` / `format` | Biome 检查+修复 / 格式化 |

## 3. 内容写作

### 3.1 存放与 frontmatter

- 新文章放 `src/content/posts/<中文分类>/`（现有：学习笔记、建站历程、技术分享、数学研究）；页面静态数据放 `src/content/spec/`。
- frontmatter 必填 `title`、`published`；可选 `updated`、`draft`（true 不发布）、`description`、`image`、`tags`、`category`（对应子目录名）。**`publishedOrder`、`prev/nextTitle`、`prev/nextSlug` 由系统自动填充，勿手写。**

### 3.2 published 排序

- 格式 `"2026-08-01"` 或 `"2026-08-01-3"`；`-N` 越大 = 发布时间越靠后 = 列表显示越靠前（缺省 0）。

### 3.3 文章格式

- `.md`：支持 KaTeX（`$...$` / `$$...$$`）、GitHub 提示框（`:::note` 等）、`:::github{user= repo=}` 卡片；图片放 `src/assets/images/` 用 `ImageWrapper` 引用。
- `.typ`：frontmatter 用 `#metadata((...))<frontmatter>...</frontmatter>`（参考 `数学研究/泊松分布.typ`）；`src/patches/astro-typst.patch` 由 pnpm patchedDependencies 应用，**勿删勿改**。

### 3.4 归档与搜索

- 标签/分类无独立路由，统一走 `/archive/` 的 query（`?tag=`、`?category=`、`?uncategorized=true`）。
- Pagefind 索引仅在 build 后生成，**dev 下搜索返回 mock、不可用属正常**。

## 4. 目录与关键路径

- **`src/config.ts` 是站点唯一配置入口**（分段导出 siteConfig / navBarConfig / profileConfig / licenseConfig / expressiveCodeConfig / sidebarLayoutConfig / musicPlayerConfig）；改站点信息先看这里。
- `src/content/config.ts` 定义 posts/spec 集合 schema（zod）；`src/components/widget/music-sidebar/` 为音乐播放器子项目。
- 路径别名：`@/*` → `src/*`，另有 `@components/` 等。

## 5. 架构与核心约定（坑集中区）

- **组件组织**：按功能子目录混排 `.astro`（SSR）与 `.svelte`（客户端交互），组件/类型 PascalCase、变量/函数 camelCase、常量 SCREAMING_SNAKE_CASE。
- **Svelte 5 runes 坑**：`client:only` 组件必须回退传统 props 语法（runes 在 `@astrojs/svelte` 下类型退化），先读 `src/components/LightDarkSwitch.svelte` 注释。
- **暗色模式**：class 驱动（`html.dark`），不跟随系统，统一走 `src/utils/setting-utils.ts` 的 `applyThemeToDocument`；样式须同时给亮/暗两套值。
- **配置驱动 UI**：侧栏布局由 `sidebarLayoutConfig` + `WidgetManager` 驱动，**别改 MainGridLayout 硬编码**。
- **无刷新导航**：Swup 容器为 `main` + `#toc`，容器外动态区域切换时不更新。
- **类型约束**：导出常量/函数须显式标注类型（`declaration: true` + `--isolatedDeclarations`）。
- **图标**：astro-icon 仅用 `astro.config.mjs` 的 `icon.include` 注册集合（fa6-brands/regular/solid、material-symbols），新增需 `pnpm add @iconify-json/<集合>` 并同步注册。

## 6. 样式

- Tailwind + Stylus 分层：`src/styles/variables.styl` 用 oklch 定义全局变量，`define()` 宏生成亮/暗两套值；组件用 `bg-[var(--primary)]` 引用。
- 主题色相在 `config.ts` 的 `themeColor.hue`（250，`fixed: true`）。
- 代码块配色由 Stylus 变量覆盖（`--codeblock-bg` 等，见 astro.config.mjs `styleOverrides`），**改颜色改 Stylus 变量，不改高亮主题文件**。

## 7. 规范与质量

- 改动后至少跑 `pnpm check` + `pnpm lint`。
- Biome 严格：tab 缩进、双引号、organizeImports，style 组全 error；对 svelte/astro/vue 仅豁免 useConst、useImportType、noUnusedVariables、noUnusedImports。忽略 `src/**/*.css`、`dist/`、`node_modules/`、`music-playlist.generated.ts`（构建自动生成，勿手改）。

## 8. 部署

- `site` 为 `https://prerice.novic.cc/`；`trailingSlash: "always"`，内部链接注意尾部斜杠。
- 音乐歌单为静态文件 `public/music/playlist.json`（构建时生成，不入 git），播放时按 `songmid` 实时解析 QQ 音乐地址。
