# 🚀 博客指南 (v1.5.x)

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

---

## 🛠 核心功能深入解析

### 🤝 自动化友链申请系统 **(NEW)

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

---

## 📝 内容发布规范

### ✅ 正式文章 (Posts)

存储路径：`src/content/posts/`。建议使用文件夹管理，以便资源闭环。

**Front-matter 配置：**

```yaml
---
title: 文章标题
published: 2026-02-18
description: "文章摘要"
image: "./cover.jpg"
tags: ["Tech"]
category: Tutorial
draft: false
---

```

### ✅ 说说 (Moments)

编辑：[`src/data/ss.json`](https://www.google.com/search?q=./src/data/ss.json)。
系统自动解析 ISO 时间戳并转换为相对时间（如“3小时前”）。

---

## 🎨 交互规范与视觉

- **动画引擎**：由 Swup 驱动页面过渡，配合组件入场动画 `cubic-bezier(0.22, 1, 0.36, 1)`。
- **暗色模式**：全局基于 CSS 变量与 OKLCH 色彩空间，确保在不同显示器上的对比度一致性。

---

## 🎯 快速维护入口

| 操作 | 直达位置 |
| --- | --- |
| **审批友链** | 查看邮箱 `me@ishaohao.cn` 并更新 `friends.json` |
| **发布内容** | [`src/content/posts/`](https://www.google.com/search?q=./src/content/posts/) |
| **统计配置** | [`src/components/widget/Statistics.astro`](https://www.google.com/search?q=./src/components/widget/Statistics.astro) |
| **修改人设** | [`src/pages/about.astro`](https://www.google.com/search?q=./src/pages/about.astro) |
