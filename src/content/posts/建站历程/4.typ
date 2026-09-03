#metadata((
  title: "对博客进行简单改造",
  published: "2026-08-01-3",
  description: "建站历程 - 其四",
  tags: ("个人博客", "Fuwari", "Giscus", "Mizuki"),
  category: "建站历程",
  draft: false,
))<frontmatter>

#html.elem("p", attrs: (style: "margin-top: -1em;"))

== 给你的 Fuwari 添加新的页面

请参考 AULyPc 大佬的 #link("https://aulypc1.github.io/posts/website/add_friendspage_in_fuwari/")[这篇文章] ，其中详细说明了如何给 Fuwari 添加“友链”页面。

同理，除了“友链”页面，你还可以自由地添加其它页面。

== 利用 Giscus 添加评论功能

#link("https://github.com/giscus/giscus")[Giscus] 是一个基于 GitHub Discussions 的免费、开源评论系统，让网站访问者可以使用自己的 GitHub 账号发表评论。所有评论数据都存储在你自己的 GitHub 仓库的 Discussions 中，因此不需要维护额外的数据库，非常适合 Fuwari 这样的静态博客。

具体实现方式请参考 AULyPc 大佬的 #link("https://aulypc1.github.io/posts/website/add_comment_for_your_website_in_fuwari/")[这篇文章] 。他的博客中还有 #link("https://aulypc1.github.io/posts/website/use_custom_fonts_in_fuwari/")[在 Fuwari 使用自定义字体] 等文章，或许对你有帮助。

== 添加右侧栏及音乐播放器等小组件

你可能会注意到，我的博客相比 Fuwari 的初始模板，多了一个右侧栏，其中放置了“站点信息”和“音乐”等组件。其实，添加这些并不复杂。

你需要知道，这类组件一般都放在 `/src/components/widget` 文件夹中。例如“个人信息”方框对应 `Profile.astro`，“标签”方框对应 `Tags.astro`，而整个左侧栏则对应 `SideBar.astro`。

至于具体的实现方式，我推荐参考 #link("https://github.com/LyraVoid/Mizuki")[Mizuki] 这个博客主题。它相比 Fuwari 多了很多功能，其中可能就有你需要的。你可以把该仓库的源码下载到本地，然后参考它改造自己的博客。

你也可以查看本博客的 github 仓库，参考其中的实现方式。

::github{repo="Pre-rice/my-blog"}

以上便是我对博客做的简单改造，希望对你有所启发。