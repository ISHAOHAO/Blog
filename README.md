
# 🚀 博客指南 (v1.3.x)

本文档记录了基于 Fuwari 深度定制后的功能模块与维护指南。

## 📂 新增功能模块索引

| 功能模块 | 配置文件/数据路径 | 核心组件/页面 |
| --- | --- | --- |
| **文章发布** | `src/content/posts/` | `src/pages/posts/[...slug].astro` |
| **评论系统** | Giscus (GitHub Discussions) | `src/components/Comment.astro` |
| **赞助/广告** | 脚本注入逻辑 | `src/components/AdSidebar.astro` |

---

## 📝 内容发布指南

### ✅ 发布正式文章

文章存储在 `src/content/posts/`。建议采用“文件夹”模式管理资源：

1. 在 `posts` 下新建文件夹（如 `my-blog/`）。
2. 在文件夹内新建 `index.md`。
3. 将图片放在同级目录下。

**Front-matter 标准配置：**

```yaml
---
title: 文章标题
published: 2026-02-18
description: "简短的文章描述"
image: "./cover.jpg"      # 指向同级目录下的图片
tags: ["标签1", "标签2"]
category: 分类名称
draft: false              # 设置为 true 则不发布
---

```

---

### ✅ 发布说说 (Moments)

打开：👉 [`src/data/ss.json`](./src/data/ss.json)
将新内容插入数组**最上方**。

---

## 🛠 核心组件说明

### 💬 评论系统 (Giscus)

项目已集成基于 **GitHub Discussions** 的评论系统。

* **独立性**：基于 `pathname` 映射，确保每篇文章、说说、关于页的评论互不干扰。
* **实时同步**：支持全站主题（亮/暗）实时联动，无缝切换。
* **入场动画**：组件自带淡淡的位移淡入效果，提升视觉质感。

**维护注意：**
如果更换了 GitHub 仓库，需修改 `src/components/Comment.astro` 中的 `data-repo-id` 和 `data-category-id`。

### 💰 侧边栏赞助 (AdSidebar)

模仿 `tianhw.top` 风格的侧边栏组件。

* **位置**：固定于左侧边栏底部。
* **加载逻辑**：支持异步加载与 Swup 无刷新页面跳转兼容。
* **自定义**：如需修改广告源，请更新 `src/components/AdSidebar.astro` 中的 `s.src` 链接。

---

## 🎨 视觉与交互规范

### 动画效果

* **页面切换**：使用 Swup 实现丝滑过渡。
* **组件入场**：评论区采用 `cubic-bezier(0.16, 1, 0.3, 1)` 曲线的位移淡入动画。
* **主题切换**：支持手动切换与系统偏好跟随，评论区与广告位均已做适配。

### 相对时间（说说页）

系统自动将 `ss.json` 中的时间戳转换为“几分钟前”、“昨天”等可读格式。

---

## ✅ 维护建议与版本管理

* **版本记录**：所有重大更新需记录在 [`CHANGELOG.md`](./CHANGELOG.md)。
* **资源引用**：文章图片优先使用相对路径 `./`，全局公共资源存放在 `/public/`。
* **本地预览**：推送至 GitHub 前，务必运行 `npm run dev` 检查广告位与评论区的加载状态。

---

## 🎯 快速维护入口

| 操作 | 直达位置 |
| --- | --- |
| **写新文章** | [`src/content/posts/`](./src/content/posts/) |
| **发布说说** | [`ss.json`](./src/data/ss.json) |
| **管理友链** | [`friends.json`](./src/data/friends.json) |
| **调整广告** | [`AdSidebar.astro`](./src/components/AdSidebar.astro) |
| **调整评论** | [`Comment.astro`](./src/components/Comment.astro) |
