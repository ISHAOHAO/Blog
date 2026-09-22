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
| **最新文章** | 侧边栏展示最新 3 篇文章 | `src/components/PopularPosts.astro` |
| **移动端目录** | 长文浮动目录按钮 | `src/components/widget/MobileTOC.astro` |
| **站内搜索筛选** | Pagefind 分类 / 标签 / 年份过滤 | `src/components/Search.svelte` |
| **内容校验** | 检查 Front matter、封面、标签与重复标题 | `scripts/validate-content.js` |
| **隐私说明** | 本地存储与第三方服务披露 | `src/pages/privacy.astro` |
| **SEO 元数据** | canonical / Open Graph / Twitter Card / JSON-LD | `src/layouts/Layout.astro` |

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
- 显示当前篇数、总篇数与系列阅读进度条。
- 当同系列仅 1 篇时自动隐藏。

### 📊 阅读进度条

页面顶部 3px 进度条，随滚动实时更新：

- 固定在导航栏上方（`z-index: 60`），颜色跟随主题色。
- 支持 Swup 页面切换后重新计算进度。

### 📣 文章分享系统

文章页底部集成一键分享，国内平台优先排列，移动端支持直接唤起 App：

- **微信分享**：移动端优先调起系统分享面板或微信 App，同时复制链接；桌面端显示二维码扫码分享。
- **微博分享**：调起微博分享窗口，自动填入标题和链接。
- **QQ 分享**：移动端通过深度链接直接打开 QQ 分享面板；桌面端调起 QQ 网页分享窗口。
- **小红书分享**：移动端优先调起系统分享面板或小红书 App，同时复制链接；桌面端一键复制链接。
- **Twitter 分享**：通过 Intent API 分享。
- **复制链接**：一键复制文章 URL，2 秒后文案自动恢复。

### 👍 点赞/点踩评分

文章页底部提供交互式反馈按钮：

- 基于 **localStorage** 持久化，用户可切换或取消投票。
- 无需后端服务，数据存储在浏览器端。
- 页面明确显示“本机反馈 · 仅保存在当前设备”，不作为全站公开评分。
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

侧边栏标签按使用频率自动缩放，高频标签更大更显眼，位于侧边栏底部。

> 注：分类 (Categories) widget 已从侧边栏移除，分类筛选仅通过归档页和文章 metadata 展示。

### 🆕 最新文章

侧边栏展示最新 3 篇文章，带序号徽标和悬停动效，位于侧边栏首个 widget。这里按发布时间排序，不代表真实访问量排行。

### 🔎 站内搜索与筛选

生产构建使用 Pagefind 生成静态搜索索引：

- 支持按关键词搜索文章标题与正文。
- 支持分类、标签和年份三组筛选条件。
- 搜索索引由 `pnpm build` 自动写入 `dist/pagefind/`。
- 开发模式不生成真实索引；请通过 `pnpm build && pnpm preview` 验证搜索结果。

### 🔐 SEO、隐私与安全

- 页面输出 canonical、Open Graph、Twitter Card 与文章 BlogPosting JSON-LD。
- 文章社交分享图由 Astro 在构建时生成 1200×630 优化图片。
- `/privacy/` 说明浏览器本地存储以及统计、评论、表单、赞助等第三方服务。
- `vercel.json` 配置 CSP、HSTS、Referrer Policy、Permissions Policy 等安全响应头。
- 统计和赞助脚本在组件接近视口时才加载，降低首屏第三方请求。

> 本地预览无法验证 Vercount、Giscus、广告、FormSubmit、Turnstile 和 Vercel Speed Insights 的真实生产请求；部署后仍需进行线上验收。

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
lastVerified: 2026-03-01 # 可选：教程最后实测日期
description: "文章摘要"
image: "./cover.jpg"
tags: ["Tech", "教程"]
category: 教程
series: "系列名称"   # 可选：系列教程
seriesOrder: 1       # 可选：系列中的序号
draft: false
---

```

发布前可运行 `pnpm validate-content`。`pnpm check` 与 `pnpm build` 也会自动执行同一套内容校验。

内容校验覆盖：

- Front matter 必填字段与日期格式。
- 摘要长度、封面文件是否存在。
- 重复标题、正文重复 H1。
- 系列名称、顺序及重复序号。
- 标签大小写是否保持一致。

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
| **搜索筛选** | `src/components/Search.svelte` 与文章页 `data-pagefind-*` 属性 |
| **内容校验** | `scripts/validate-content.js` |
| **SEO 元数据** | `src/layouts/Layout.astro`、`src/pages/posts/[...slug].astro` |
| **隐私与安全** | `src/pages/privacy.astro`、`vercel.json` |
