# 🚀 博客指南 (v1.6.x)

### 快速导航

- 📖 [项目说明](./README.md)
- 📝 [完整更新日志](./CHANGELOG.md)
- 🤝 [贡献指南](./CONTRIBUTING.md)
- 📜 [许可证](./LICENSE)

---

本文档记录了基于 Fuwari 深度定制后的功能模块、自动化流程与维护指南。

## 📂 新增功能模块索引

| 功能模块 | 技术栈 / 数据路径 | 核心组件 / 页面 |
| --- | --- | --- |
| **文章发布** | Markdown + MDX | `src/content/posts/` |
| **友链申请** | **FormSubmit + Cloudflare Turnstile** | `src/pages/friends/index.astro` |
| **评论系统** | Giscus (GitHub Discussions) | `src/components/Comment.astro` |
| **站点统计** | Vercount (Analytics) | `src/components/widget/Statistics.astro` |
| **说说 (Moments)** | JSON Data | `src/data/ss.json` |
| **相关文章推荐** | 标签/分类相似度算法 | `src/components/RelatedPosts.astro` |
| **系列教程管理** | Front-matter `series` 字段 | `src/components/SeriesNav.astro` |
| **阅读进度条** | 页面滚动监听 | `src/components/ReadingProgress.astro` |
| **文章分享** | 微信 / 微博 / QQ / 小红书 / 复制链接 / Twitter | `src/components/ShareButtons.astro` |
| **点赞评分** | localStorage 持久化 | `src/components/PostRating.svelte` |
| **标签云** | 频率加权缩放 | `src/components/widget/Tags.astro` |
| **RSS 订阅提醒** | 文章底部推广卡片 | `src/components/RSSPromo.astro` |
| **RSS 订阅引导页** | 专用订阅页面 + 阅读器推荐 | `src/pages/subscribe.astro` |
| **热门文章** | 侧边栏排行展示（最新 5 篇） | `src/components/PopularPosts.astro` |
| **标签云** | 侧边栏标签（频率加权缩放） | `src/components/widget/Tags.astro` (已注释) |

---

## 🛠 核心功能深入解析

### 🤝 自动化友链申请系统

为了降低维护成本，友链页面已集成 **无后端自动化申请表单**。

- **核心流程**：用户填写表单 -> Cloudflare Turnstile 人机验证 -> FormSubmit API 转发 -> 你的邮箱收到格式化申请。
- **安全防护**：
  - **Cloudflare Turnstile**：针对中国大陆网络优化的无感验证，有效阻断机器人灌水。
  - **Honeypot (蜜罐)**：隐藏字段检测，静默过滤垃圾邮件。
- **视觉反馈**：
  - 采用 `fetch` AJAX 异步提交，用户无需刷新或跳转页面即可完成申请。
  - 成功提交后触发 CSS 渐入动画与状态 Banner。

**维护注意：**

- 修改 `me@ishaohao.cn` 为你的真实邮箱以接收申请。
- 首次使用需在收到的首封邮件中点击 **Confirm** 激活 FormSubmit 服务。

### 💬 评论系统 (Giscus)

基于 **GitHub Discussions**，实现数据与静态页面解耦。

- **映射逻辑**：基于 `pathname` 确保评论独立性。
- **动态适配**：监听系统主题切换，实时更新评论区 UI，无白色闪烁。

### 💰 侧边栏赞助与统计

- **Anti-Adblock 优化**：赞助组件类名经过混淆（如 `sp-container`），规避常见浏览器插件的误杀。
- **流光统计卡片**：在侧边栏显示全站 PV/UV，支持数字滚动动画与加载异常重试逻辑。

### 📚 相关文章推荐

文章页底部根据标签和分类自动匹配相关文章：

- **匹配算法**：标签匹配权重 2 分，分类匹配权重 1 分。
- **排序规则**：按得分降序，同分按发布时间降序。
- **展示数量**：最多 3 篇，无匹配时自动隐藏。
- 核心逻辑位于 `src/utils/content-utils.ts:136`。

### 📖 系列教程管理

支持将多篇文章组织为系列教程：

**在文章 Front-matter 中配置：**

```yaml
---
title: "Docker 入门：安装与配置"
series: "Docker 实战教程"
seriesOrder: 1
---
```

- 自动列出同系列所有文章，按 `seriesOrder` 排序。
- 当前文章高亮标记，序号徽标显示。
- 当同系列仅 1 篇时自动隐藏。

### 📊 阅读进度条

页面顶部 3px 进度条，随滚动实时更新：

- 固定在导航栏上方（`z-index: 60`），颜色跟随主题色。
- 支持 Swup 页面切换后重新计算进度。

### 📣 文章分享系统

文章页底部集成一键分享，国内平台优先排列：

- **微信分享**：点击弹出二维码，扫码即可在微信中打开文章。
- **微博分享**：调起微博分享窗口，自动填入标题和链接。
- **QQ 分享**：调起 QQ 分享窗口。
- **小红书分享**：一键复制链接，提示粘贴到小红书 App 分享。
- **Twitter 分享**：通过 Intent API 分享。
- **复制链接**：一键复制文章 URL，2 秒后文案自动恢复。

### 👍 点赞/点踩评分

文章页底部提供交互式反馈按钮：

- 基于 **localStorage** 持久化，用户可切换或取消投票。
- 无需后端服务，数据存储在浏览器端。
- Svelte 5 组件位于 `src/components/PostRating.svelte:1`。

### 📡 RSS 订阅推广

文章页底部展示 RSS 订阅卡片，引导读者订阅博客获取最新文章。

**订阅引导页（`/subscribe/`）**：

- 提供一键复制 RSS 订阅地址功能。
- 推荐 6 款主流 RSS 阅读器（Feedly、Inoreader、NetNewsWire、FreshRSS、RSSHub、Reeder）。
- 底部保留原始 XML 链接供高级用户使用。
- 全站所有 RSS 链接（侧边栏、页脚、文章页）统一指向此引导页。

**配置站点域名**：在 `astro.config.mjs` 中修改 `site` 字段为你的真实域名，RSS 和 sitemap 会自动使用该域名。

### 🏷 标签云

侧边栏标签按使用频率自动缩放，高频标签更大更显眼。默认已注释，如需启用可在 `SideBar.astro` 中取消注释。

> 注：分类 (Categories) widget 已从侧边栏移除，分类筛选仅通过归档页和文章 metadata 展示。

### 🔥 热门文章排行

侧边栏展示最新 5 篇文章排行，带序号徽标和悬停动效，位于侧边栏首个 widget。

---

## 📝 内容发布规范

### ✅ 正式文章 (Posts)

存储路径：`src/content/posts/`。建议使用文件夹管理，以便资源闭环。

**Front-matter 配置：**

```yaml
---
title: 文章标题
published: 2026-02-18
updated: 2026-03-01   # 可选：最后更新时间
description: "文章摘要"
image: "./cover.jpg"
tags: ["Tech", "教程"]
category: 教程
series: "系列名称"   # 可选：系列教程
seriesOrder: 1       # 可选：系列中的序号
draft: false
---

```

### ✅ 说说 (Moments)

编辑：`src/data/ss.json`。
系统自动解析 ISO 时间戳并转换为相对时间（如“3小时前”）。

---

## 🎨 交互规范与视觉

- **动画引擎**：由 Swup 驱动页面过渡，配合组件入场动画 `cubic-bezier(0.22, 1, 0.36, 1)`。
- **暗色模式**：全局基于 CSS 变量与 OKLCH 色彩空间，确保在不同显示器上的对比度一致性。

---

## 🎯 快速维护入口

| 操作 | 直达位置 |
| --- | --- |
| **审批友链** | 查看邮箱 `me@ishaohao.cn` 并更新 `src/data/friends.json` |
| **发布内容** | `src/content/posts/` |
| **配置系列** | 在文章 front-matter 中设置 `series` 和 `seriesOrder` |
| **RSS 设置** | 引导页：`src/pages/subscribe.astro`，域名：`astro.config.mjs` |
| **统计配置** | `src/components/widget/Statistics.astro` |
| **修改人设** | `src/pages/about.astro` |
| **调整标签云** | `src/components/widget/Tags.astro` |
| **评论设置** | `src/components/Comment.astro` |
