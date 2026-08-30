#metadata((
  title: "让博客支持 Typst",
  published: "2026-08-01-1",
  description: "建站历程 - 其三",
  tags: ("个人博客", "Fuwari", "Typst", "Astro"),
  category: "建站历程",
  draft: false,
))<frontmatter>

#html.elem("p", attrs: (style: "margin-top: 2em;")) 

本篇文章的技术细节由 AI 书写，仅供参考。

== 从"夹带私货"到"正式入驻"

上篇文章的结尾，我留下一句话："对于这类个性化的需求，下一步便是改造这个网站！"如今，一个重大的改造已经完成了。

于是就有了这篇文章——或者说，有了这篇文章的载体。你现在读到的每一个字，都是用 Typst 书写的，由博客原生渲染出来的。标题、目录、公式、列表、代码块，无一例外。而在几天之前，这还是一桩不可能的事。

这篇文章记录了我让博客支持并适配 Typst 的完整过程。如果你也想让博客支持 Typst，照着我的步骤走一遍基本能复现。

== 为什么要让博客支持 Typst

在前一篇里，我已经介绍过 Typst 这个排版系统，这里不再赘述，只补充一点实际用下来的体验：

- 我计划为自己的博客添加数学相关内容，其中涉及大量公式的编辑和排版。Markdown 的数学公式沿袭了 LaTeX 的语法，写起来冗长、可读性低。而 Typst 的公式写起来就非常顺手，从代码上一眼就能看出含义。
- Typst 原生支持 HTML 导出（虽然还在实验阶段），配合社区维护的 `astro-typst` 集成，就能让博客直接渲染 `.typ` 文件。虽然生态尚未成熟，但通过恰当的配置，也能实现极好的效果——比如这篇文章，看上去就和前面几篇的样式完全一致。你也可以看看我用 Typst 写的 #link("/posts/数学研究/泊松分布/")[泊松分布] 这篇文章，里面的数学公式效果也非常好。

== 安装与配置

=== 安装依赖

在项目根目录执行下面的命令：

```bash
pnpm add astro-typst @myriaddreamin/typst-ts-node-compiler @myriaddreamin/typst-ts-renderer @myriaddreamin/typst.ts
```

- `astro-typst`：集成本身，负责把 `.typ` 文件接入 Astro 的内容管线。
- `typst-ts-node-compiler`：Typst 的 Node 编译绑定，真正干活的编译器。
- `typst-ts-renderer`、`typst.ts`：配套的渲染与类型库。

装完依赖后，`.typ` 文件还不会被识别，接下来要注册集成。

=== 注册集成

在 `astro.config.mjs` 中引入并注册 `typst` 集成：

```js
import { typst } from "astro-typst";
// ...
integrations: [
  // ... 其他集成
  typst({
    options: { remPx: 16 }, // 以 16px 为 rem 基准
    target: () => "html", // 输出为 HTML
    htmlMode: "text", // 直接内嵌正文 HTML（关键，见下文）
  }),
],
```

- `remPx`：Typst 排版内部用 rem 做单位换算的基准。设成 16，与浏览器默认字号一致，各种字号、间距的换算才准确。
- `target: () => "html"`：明确告诉集成输出 HTML 而不是 SVG 图片。选 SVG 的话，整篇文章会渲染成一张大图，既不能选中文本，公式也无法变成 MathML。
- `htmlMode: "text"`：把渲染结果作为 HTML 片段直接内嵌。这个选项很关键，它会绕过集成默认的 hast 处理，让后续的格式统一后处理变得简单可靠。这也是代码块统一（见下文）能实现的前提。

这样，`src/content/posts/` 目录下的 `.typ` 文件就会被识别为博客文章了。

== 书写第一篇 Typst 文章

=== Frontmatter

和 Markdown 用 `---` 包裹不同，Typst 文章的 frontmatter 用的是 Typst 自身的语法。把它放在文件的最开头：

```typst
#metadata((
  title: "让博客支持 Typst",
  published: "2026-08-01",
  description: "建站历程 - 其三",
  tags: ("个人博客", "Typst", "Astro"),
  category: "建站历程",
  draft: false,
))<frontmatter>
```

字段的含义和 Markdown 版本的 frontmatter 一一对应：标题、日期、描述、标签、分类、草稿开关。写错格式集成会直接报错，大小写和括号要留意。

=== Typst 语法简介

Typst 的正文语法和 Markdown 有不少相似之处，这里只简单介绍一点。更多细节可以查阅 #link("https://typst.app/docs/tutorial")[官方文档] 。

```typst
= 一级标题
== 二级标题
=== 三级标题

_斜体_，*粗体*，`等宽字体`，#underline[下划线]，#strike[删除线]

+ 有序列表
- 无序列表
```

公式用的是 Typst 自己的语法，比 LaTeX 清爽得多。例如 e 的定义：

```typst
$ lim_(n -> oo) (1 + 1/n)^n = e $
```

非常直观对吧，渲染出来是这样的：

$ lim_(n -> oo) (1 + 1/n)^n = e $

代码块同样用三个反引号包裹，开头的三个反引号后紧跟语言标记即可。你在这篇文章里看到的每一个代码框——行号、复制按钮、语言徽章——都是 Typst 文章代码块统一适配后的效果（详见下文）。

== 让渲染效果与 Markdown 一致

文章能渲染只是第一步。博客里已有的 Markdown 文章已经形成了一套统一的排版，Typst 文章如果各处细节和它不一致，读者体验就会很割裂。所以我的目标是：*两种格式，一种效果*。

这一节是全文的重头戏。逐项讲讲差异是怎么来的、又是怎么解决的。

=== 目录与标题锚点

Markdown 文章的目录（TOC）是 Astro 的内容管线自动提取的。但 Typst 文章从渲染结果里拿不到结构化的标题列表，目录得自己从源码提取。

我在 `src/utils/content-utils.ts` 里写了一个 `extractTypstHeadings`，逐行解析 `= 标题` 语法：

```ts
export function extractTypstHeadings(source: string): MarkdownHeading[] {
  const slugger = new GithubSlugger();
  const headings: MarkdownHeading[] = [];
  const lines = source.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (/^`{3,}/.test(line.trim())) { inCode = !inCode; continue; }
    if (inCode) continue;
    const m = line.match(/^(={1,6})\s+(.+?)\s*$/);
    if (m) {
      headings.push({
        depth: m[1].length,
        slug: slugger.slug(m[2].trim()),
        text: m[2].trim(),
      });
    }
  }
  return headings;
}
```

两个细节：

- *slug 用 `github-slugger` 生成*，与 Markdown 的 `rehype-slug` 是同一套算法（中文保留、空格转 `-`、重复标题加 `-1`）。这样 Typst 和 Markdown 的标题锚点 URL 形式完全一致。
- *`inCode` 状态跳过代码块*。一开始我没考虑这个，结果把代码块里演示用的 `= 一级标题` 也当成了标题，目录里凭空多出几个"幽灵条目"，点击还会跳空。后来加上对三个反引号包裹区域的识别，问题才解决。

标题的 `id` 和右侧的 `#` 锚点链接，在前端补上：服务端把 slug 列表写进一个 `data-typst-heading-slugs` 属性，页面加载时按顺序给每个标题设置 `id` 并追加锚点 `<a>`，与 Markdown 的锚点表现一致。

=== 标题层级

Typst 渲染 HTML 时，会把 `=` 一级标题映射为二级标题——因为它在语义上认为，文档还应该有一个"文章标题"。这样 Typst 的标题整体就会比 Markdown 低一级，看起来小一号。

我在渲染流程的最后对 HTML 做了一次后处理，把标题整体抬回一级：`h2 -> h1`、`h3 -> h2`……于是 `=` 与 Markdown 的 `#` 完全对齐了。

=== 列表间距

Typst 的"松列表"（项与项之间留有空行）会把每个列表项的内容包进一个段落标签，导致项与项之间的间距比 Markdown 略宽。同样是在后处理中，把这些结构性的段落标签解开，让列表项内容直接成为文本，行距就完全一致了。

要注意留一个口子：如果某个列表项里全都是段落（读者真的写了多段内容），就保留段落分隔，避免把多段压成一段。

=== 公式

公式是我引入 Typst 的主要动力，这一块自然必须做到位。

一开始我把公式渲染成了 SVG 图片，文本无法选中、颜色固定。后来把 `typst-ts-node-compiler` 升级到 0.8.0（RC 版），才拿到原生 MathML 输出。公式变成真正的数学标记语言后，文字可以复制，颜色随主题自动变化，和 Markdown 一侧用 KaTeX 渲染的观感一致。

=== 代码块统一

Typst 默认的代码块只有内联的语法高亮，没有行号、复制按钮、语言徽章，外观和 Markdown 的代码块差距很大。博客的 Markdown 代码块由 `astro-expressive-code` 渲染，它提供了完整的一套代码框样式。Typst 文章想用上它，靠的是 expressive-code 暴露的*程序化渲染接口* `createRenderer`。

具体做法：在 `astro-typst` 渲染出 HTML 之后、返回之前，对每一个 `<pre><code data-lang="...">`，取出纯文本源码和语言，交给 expressive-code 渲染成完整的代码框结构，再替换回去。随后把 expressive-code 的基础样式、主题样式和交互脚本注入到文章 HTML 中。于是 Typst 文章里的每个代码框，和 Markdown 文章里的在结构上完全一致——行号、复制按钮、语言徽章、主题配色，样样都有。

这段逻辑写在了 `astro-typst` 包内部，通过 pnpm 的补丁机制生效，详见下一节。

=== 关于补丁机制

这几次后处理，我借助了 pnpm 的补丁机制（`patchedDependencies`），对 `astro-typst` 集成做定点修改。

做法分三步：

1. 把对 `node_modules/astro-typst` 的修改整理成一个 `.patch` 文件（类似 Git 的 diff）。
2. 在 `package.json` 里声明补丁位置：

```json
"pnpm": {
  "patchedDependencies": {
    "astro-typst": "src/patches/astro-typst.patch"
  }
}
```

3. 之后每次 `pnpm install`，pnpm 都会自动把这个补丁应用到 `astro-typst` 上。依赖更新时补丁也会重新应用；如果补丁和新版代码对不上，pnpm 会明确报错，你更新补丁即可。

这样做的好处是：项目的 `src` 源码完全不用动，所有定制都集中在补丁里，一目了然。

有两个坑值得单独提醒：

- *补丁里引不到项目源码。* 补丁修改的是 `node_modules` 里的包文件，`import` 项目 `src` 目录下的自定义插件会失败。我把两个自定义插件（语言徽章、复制按钮）的代码直接内联进了补丁。代价是：日后改 `src/plugins/` 里的插件，要记得同步补丁里的内联版本。
- *手写补丁要小心格式。* 补丁的 `index` 行如果全写 0，git 会静默跳过这个文件的修改；hunk 的起始行数、增删行数也必须与实际内容一致，否则报 `hunk header integrity check failed`。最稳妥的做法是：改完 `node_modules` 里的文件后，用 `git diff --no-index` 从真实文件生成补丁，而不是手写。

=== 已知限制

- `typst` 这个语言在 expressive-code 的语法库里暂时没有对应高亮，所以语言标记写作 `typst` 的代码块会以纯文本渲染（行号、复制按钮、语言徽章仍在）。这与 Markdown 里的表现一致，结构是统一的。
- 补丁内联了项目插件，与 `src/plugins/` 里的插件构成双份维护，改动时需要两边同步。

== 如何验证适配成功

搭好之后，把一篇 Markdown 文章和一篇 Typst 文章并排对比，重点检查：

- 标题大小逐级对齐（`=` 与 `#` 同级）。
- 列表项间距一致。
- 公式能选中、能复制、颜色随主题。
- 代码块有行号、复制按钮、语言徽章，外观与 Markdown 代码块一致。
- 目录层级、锚点跳转、浏览高亮与 Markdown 文章一致。

== 结语

至此，我的博客终于可以同时"说"两种语言了。需要写公式时，我会优先选择 Typst；而日常使用时，Markdown 依然是可靠的老朋友。

从这次的改造也可以看出，想要让博客更加适配个人需求，适当的改造是必不可少的。接下来我还会简单介绍博客的其它一些改造。