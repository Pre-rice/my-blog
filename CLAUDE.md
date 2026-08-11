# CLAUDE.md

本文件为 AI 协作说明文档，帮助 AI 快速理解项目并高效开发。请先通读后再动手。

## 1. 项目简介与全局守则

- **Pre-rice 的博客**：基于 [Fuwari](https://github.com/saicaca/fuwari)（MIT）深度定制的个人博客。站点名以 `src/config.ts` 的 `siteConfig.title` 为准。
- 技术栈：Astro 5.13 + Svelte 5.39 + TypeScript（strict）+ Tailwind CSS 3.4 + Stylus。包管理仅支持 **pnpm**（`preinstall` 强制 `only-allow pnpm`），不要用 npm/yarn。
- 内容以 **Markdown 与 Typst 双格式**书写，支持 KaTeX 公式、代码高亮、GitHub 提示框/卡片、无刷新导航、站内搜索、音乐播放器。
- 无测试框架，质量靠类型检查与 Biome 保障。

**全局守则：所有对话、代码注释、文档、UI 文案一律使用中文。禁止写英文注释。**

## 2. 常用命令

| 命令 | 用途 |
|---|---|
| `pnpm dev` | 启动开发服务器（热更新，**日常主要工作流**） |
| `pnpm build` | 构建 + 生成 Pagefind 搜索索引（`astro build && pagefind --site dist`） |
| `pnpm preview` | 预览构建产物 |
| `pnpm check` | Astro 类型检查（`astro check`） |
| `pnpm type-check` | 严格类型检查（`tsc --noEmit --isolatedDeclarations`） |
| `pnpm lint` | Biome 静态检查 + 自动修复（`biome check --write ./src`） |
| `pnpm format` | Biome 格式化（`biome format --write ./src`） |

## 3. 技术栈与集成速览

核心：Astro 5（`astro` 固定 5.13.10）/ Svelte 5（runes）/ TypeScript（strict）/ Tailwind 3.4（`darkMode: "class"`）/ Stylus。质量工具：Biome 2.2.5（替代 ESLint/Prettier，无测试框架）。

集成与功能（一句话用途，细节见对应章节）：

- `@swup/astro` 无刷新页面切换；`pagefind` 站内搜索；`photoswipe` 图片灯箱；`katex` 公式
- `astro-expressive-code` 代码高亮（github-dark）；`astro-icon` 图标；`astro-seo` SEO
- `astro-typst` Typst 内容管道（`htmlMode: "text"`，经 pnpm 补丁 `src/patches/astro-typst.patch`）
- 音乐播放器侧栏（`musicPlayerConfig`，当前为 meting 在线模式）

## 4. 内容写作指南（最高频任务，优先掌握）

### 4.1 存放位置

- 新文章放 `src/content/posts/<分类子目录>/`。现有分类：`学习笔记`、`建站历程`、`技术分享`、`数学研究`；新增分类需自建目录（用中文名）。
- 页面静态数据放 `src/content/spec/`（`about.md`、`links.md`），该集合 schema 为空对象。

### 4.2 posts frontmatter

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | 是 | 标题 |
| `published` | 是 | 日期 `"2026-08-01"`，支持同日排序后缀（见 4.3） |
| `updated` | 否 | 更新时间 |
| `draft` | 否（默认 false） | 为 `true` 时不发布 |
| `description` | 否 | 摘要 |
| `image` | 否 | 封面图 |
| `tags` | 否 | 字符串数组，如 `[Astro, Typst]` |
| `category` | 否 | 分类名（对应 4.1 的子目录名） |

内部字段 `publishedOrder`、`prevTitle`/`prevSlug`、`nextTitle`/`nextSlug` 由系统自动填充，**不要手写**。

### 4.3 published 排序规则（关键坑）

- `published` 支持两种格式：`"2026-08-01"` 和 `"2026-08-01-3"`。
- `-N` 后缀是同一天的排序权重：**数字越大 = 发布时间越靠后 = 更新 = 列表显示越靠前**（缺省为 0）。
  - 即 `"2026-08-01-3"` 排在 `"2026-08-01"` 之前。
- 后缀是 `published` 字符串的一部分，会被解析为内部字段 `publishedOrder`，前后篇导航（prev/next）也据此自动排序。

### 4.4 Markdown 文章（.md）

- 标准 Astro content 语法。可用：
  - KaTeX 数学公式：行内 `$...$`、块级 `$$...$$`
  - GitHub 提示框 directive：`:::note` / `:::tip` / `:::important` / `:::caution` / `:::warning`
  - GitHub 卡片：`:::github{user=xxx repo=xxx}`
- 文章内图片放 `src/assets/images/` 并通过 `ImageWrapper` 组件引用，不要直接用 `/public` 相对路径。

### 4.5 Typst 文章（.typ）

- frontmatter 用特殊语法 `#metadata((...))<frontmatter>...</frontmatter>`（参考 `数学研究/泊松分布.typ`）。
- `htmlMode: "text"` 将 Typst 渲染结果直接内嵌 HTML；标题 id/锚点由 `src/layouts/Layout.astro` 补齐；字数与目录由 content-utils 的 `countTypstWords` / `extractTypstHeadings` 兜底。
- `src/patches/astro-typst.patch` 由 pnpm `patchedDependencies` 应用，**勿删勿改**。

### 4.6 归档与搜索

- 标签/分类**没有独立路由**，统一复用归档页 `/archive/`：`/archive/?tag=xxx`、`/archive/?category=xxx`、`/archive/?uncategorized=true`（`ArchivePanel.svelte` 解析 query）。
- Pagefind 搜索索引只在 `pnpm build` 后生成；**dev 环境下 `Search.svelte` 返回 mock，搜索不可用属正常现象**，验证搜索请先构建。

## 5. 目录结构与关键路径

```
src/
├── assets/        # 静态资源（images/avatar.png、images/bg.png）
├── components/    # 组件：按功能分 control/ misc/ widget/（.astro SSR 与 .svelte 客户端交互混排）
│   └── widget/music-sidebar/   # 音乐播放器子项目
├── config.ts      # 站点唯一配置入口（见下）
├── constants/     # 常量（布局尺寸、LinkPreset、音乐）
├── content/       # 内容集合：config.ts（schema）+ posts/ + spec/
├── layouts/       # Layout.astro（HTML 框架）、MainGridLayout.astro（三栏布局）
├── pages/         # 路由：首页分页、posts/[...slug]、archive、about、links、rss.xml.ts、robots.txt.ts
├── patches/       # pnpm 补丁（astro-typst.patch）
├── plugins/       # remark/rehype/expressive-code/music-metadata 插件
├── styles/        # main.css + 多个 .styl（variables.styl、markdown-extend.styl 等）
├── types/         # 类型定义（config.ts、music.ts）
└── utils/         # content-utils、date-utils、url-utils、setting-utils、widget-manager
```

- **`src/config.ts` 是站点唯一配置入口**：分段导出 `siteConfig` / `navBarConfig` / `profileConfig` / `licenseConfig` / `expressiveCodeConfig` / `sidebarLayoutConfig` / `musicPlayerConfig`，类型由 `src/types/config.ts` 约束，文件内中文注释详尽。改站点信息先看这里。
- **`src/content/config.ts`** 定义 posts/spec 集合 schema（zod）。
- 路径别名（tsconfig.json）：`@/*` → `src/*`，另有 `@components/`、`@assets/`、`@constants/`、`@utils/`、`@layouts/`。

## 6. 架构与核心约定（坑集中区）

- **组件组织**：按功能子目录混排 `.astro`（服务端渲染）与 `.svelte`（客户端交互），文件名 PascalCase 英文。新增组件遵循此惯例。
- **Svelte 5 runes 坑**：Svelte 5 默认用 runes（`$props()`），但 `@astrojs/svelte` 对 runes 组件存在类型退化问题，**`client:only` 组件必须回退传统 props 语法**。新增 client:only 组件前先读 `src/components/LightDarkSwitch.svelte` 中的注释。
- **暗色模式**：class 驱动（`html.dark`），**不跟随系统**偏好；切换统一走 `src/utils/setting-utils.ts` 的 `applyThemeToDocument`。写样式须同时提供亮/暗两套值。
- **配置驱动 UI**：侧栏布局由 `sidebarLayoutConfig`（config.ts）+ `WidgetManager` 驱动。调整侧栏部件增删/顺序改 config 即可，**不要去改 MainGridLayout 的硬编码**。
- **无刷新导航**：Swup 容器为 `main` + `#toc`（见 astro.config.mjs）。容器外新增的动态区域在页面切换时不会更新，需留意。
- **类型约束**：tsconfig 开启 `declaration: true` 且 type-check 用 `--isolatedDeclarations`，**导出的常量/函数必须显式标注类型**，否则 tsc 报错。
- **新增图标集**：astro-icon 只使用 `astro.config.mjs` 的 `icon.include` 中注册的集合（当前：fa6-brands/regular/solid、material-symbols）。引入新集合需 `pnpm add @iconify-json/<集合名>` 并在 include 中同步注册。
- **命名规范**：变量/函数 camelCase、组件与类型 PascalCase、常量 SCREAMING_SNAKE_CASE。

## 7. 样式体系

- **Tailwind + Stylus 分层**：`src/styles/variables.styl` 用 oklch 定义全局 `--hue` 与组件变量，通过 `define()` 宏同时生成 `:root` 与 `:root.dark` 两套值。
- 组件中常用 `bg-[var(--primary)]` 这类 Tailwind 任意值语法引用 Stylus 变量（Astro/Svelte 均可用）。
- 主题色相在 `config.ts` 的 `themeColor.hue`（当前 250，`fixed: true` 隐藏了访客色相切换器）。
- **Expressive Code 代码块配色由 Stylus 变量覆盖**（`--codeblock-bg`、`--codeblock-topbar-bg` 等，见 astro.config.mjs 的 `styleOverrides`）。调代码块颜色改 Stylus 变量，不是改代码高亮主题文件。

## 8. 代码规范与质量检查

- 改动后至少跑 `pnpm check` + `pnpm lint` 再收尾。
- Biome 规则严格：tab 缩进、双引号、organizeImports；style 组规则全 error（noInferrableTypes、useSingleVarDeclarator、noUselessElse、noParameterAssign 等）。
- Biome 对 `*.svelte / *.astro / *.vue` 仅豁免 `useConst`、`useImportType`、`noUnusedVariables`、`noUnusedImports`，**其余规则照常生效**。
- Biome 忽略 `src/**/*.css`、`dist/`、`node_modules/`、`music-playlist.generated.ts`（后者是构建时由 music-metadata 集成自动生成，勿手改）。

## 9. 部署

- `astro.config.mjs` 的 `site` 为 `https://prerice.novic.cc/`（真实部署域名）。
- `trailingSlash: "always"`，构造内部链接时注意尾部斜杠约定。
- 音乐播放器 meting 模式依赖第三方 API（`api.i-meto.com`），离线或该服务不可用时播放器会失败。
