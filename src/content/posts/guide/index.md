---

title: 关于Fuwari如何发布文章
published: 2026-02-13
description: "如何使用这个博客模板。"
image: "./cover.jpeg"
tags: ["Fuwari", "博客", "自定义"]
category: 指南
draft: false
------------

> 封面图片来源：[Source](https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/208fc754-890d-4adb-9753-2c963332675d/width=2048/01651-1456859105-%28colour_1.5%29,girl,_Blue,yellow,green,cyan,purple,red,pink,_best,8k,UHD,masterpiece,male%20focus,%201boy,gloves,%20ponytail,%20long%20hair,.jpeg)

这个博客模板基于 Astro 构建。对于本指南中未提到的内容，你可以在 Astro Docs 中找到答案。

## 文章的 Front-matter

```yaml
---
title: 我的第一篇博客文章
published: 2023-09-09
description: 这是我新的 Astro 博客的第一篇文章。
image: ./cover.jpg
tags: [Foo, Bar]
category: 前端
draft: false
---

```

| 属性            | 说明                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `title`       | 文章标题。                                                                                                                     |
| `published`   | 文章的发布日期。                                                                                                                  |
| `description` | 文章的简短描述，会显示在索引页面。                                                                                                         |
| `image`       | 文章封面图片路径。<br/>1. 以 `http://` 或 `https://` 开头：使用网络图片<br/>2. 以 `/` 开头：表示 `public` 目录中的图片<br/>3. 没有这些前缀：相对于当前 markdown 文件的路径 |
| `tags`        | 文章标签。                                                                                                                     |
| `category`    | 文章分类。                                                                                                                     |
| `draft`       | 是否为草稿。草稿不会被显示。                                                                                                            |

## 将文章文件放在哪里

你的文章文件应放在 `src/content/posts/` 目录中。你也可以创建子目录来更好地组织文章和资源文件。

```

src/content/posts/
├── post-1.md
└── post-2/
    ├── cover.png
    └── index.md

```
