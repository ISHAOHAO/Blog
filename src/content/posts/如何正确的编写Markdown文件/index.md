---

title: 如何编写 Markdown 文件
published: 2026-02-17
description: "如何使用这个博客模板。"
image: "./markdown-icon256.png"
tags: ["Markdown", "教程", "指南"]
category: 教程
draft: false
------------

> 封面图片来源：[markdown-here](https://markdown-here.com/img/icon256.png)

Markdown 是一种轻量级标记语言，由约翰·格鲁伯（John Gruber）在 2004 年创建。它允许人们使用易读易写的纯文本格式编写文档，然后转换成有效的 HTML。如今，Markdown 已成为编写技术文档、博客文章、笔记甚至书籍的流行选择。本文将全面介绍 Markdown 的语法、最佳实践、高级技巧和实用工具，帮助你快速掌握这门强大的语言。

---

## 1. 什么是 Markdown？

Markdown 是一种纯文本格式化语法，设计初衷是让作者专注于内容而不是排版。它的核心思想是：**用简单的符号标记文本的结构，使文本在未渲染时依然保持可读性**。例如，在文字两侧加 `*` 或 `_` 表示斜体，加 `**` 表示粗体。这些标记非常直观，几乎不需要学习就能看懂。

Markdown 文件通常以 `.md` 或 `.markdown` 为扩展名。你可以用任何文本编辑器编写，然后通过 Markdown 渲染器将其转换为美观的 HTML、PDF 或其他格式。

## 2. 为什么使用 Markdown？

- **简单易学**：语法极少，十分钟即可上手。
- **纯文本**：无需专用软件，兼容所有操作系统和设备。
- **版本控制友好**：可以方便地用 Git 等工具追踪变更。
- **平台支持广泛**：GitHub、GitLab、Stack Overflow、Notion、Obsidian 等都支持 Markdown。
- **专注内容**：不用分心调整字体、字号，让你专注于写作本身。

---

## 3. 基本语法

以下是最常用、最核心的 Markdown 语法。每个部分都会先展示 Markdown 写法，再给出渲染后的效果示例。

### 3.1 标题

Markdown 支持六级标题，用 `#` 的个数表示级别：

```markdown
# 一级标题
## 二级标题
### 三级标题
#### 四级标题
##### 五级标题
###### 六级标题
```

**效果：**

# 一级标题

## 二级标题

### 三级标题

#### 四级标题

##### 五级标题

###### 六级标题

> 注意：`#` 和标题文字之间要留一个空格，这是标准写法。

### 3.2 段落与换行

- **段落**：由一行或多行文字组成，段落之间用空行分隔。
- **换行**：在行尾添加两个空格，然后回车，即可实现换行（有些渲染器也支持直接使用 `<br>` 标签）。

```markdown
这是第一段。  
这是第一段内的换行（行尾有两个空格）。

这是第二段。
```

**效果：**

这是第一段。  
这是第一段内的换行（行尾有两个空格）。

这是第二段。

### 3.3 强调

| 样式 | 语法 | 示例 | 效果 |
|------|------|------|------|
| 斜体 | `*文字*` 或 `_文字_` | `*斜体*` | *斜体* |
| 粗体 | `**文字**` 或 `__文字__` | `**粗体**` | **粗体** |
| 粗斜体 | `***文字***` | `***粗斜体***` | ***粗斜体*** |
| 删除线 | `~~文字~~` | `~~删除线~~` | ~~删除线~~ |

> 注意：某些渲染器要求符号与文字之间不能有空格，例如 `* 斜体*` 不会生效，应写作 `*斜体*`。

### 3.4 列表

#### 无序列表

使用 `-`、`*` 或 `+` 作为标记：

```markdown
- 苹果
- 香蕉
- 橙子

* 苹果
* 香蕉
* 橙子
```

**效果：**

- 苹果
- 香蕉
- 橙子

#### 有序列表

使用数字后跟英文句点：

```markdown
1. 第一步
2. 第二步
3. 第三步
```

**效果：**

1. 第一步
2. 第二步
3. 第三步

#### 嵌套列表

在子列表前缩进 2 或 4 个空格：

```markdown
- 水果
  - 苹果
  - 香蕉
- 蔬菜
  1. 胡萝卜
  2. 西兰花
```

**效果：**

- 水果
  - 苹果
  - 香蕉
- 蔬菜
  1. 胡萝卜
  2. 西兰花

### 3.5 链接

#### 行内式链接

```markdown
[必应](https://www.bing.com)
[带标题的链接](https://www.bing.com "访问必应")
```

**效果：**  
[必应](https://www.bing.com)  
[带标题的链接](https://www.bing.com "访问必应")（鼠标悬停可看到提示）

#### 参考式链接

适用于多处引用同一链接的情况：

```markdown
[百度][baidu] 和 [必应][bing] 都是搜索引擎。

[baidu]: https://www.baidu.com
[bing]: https://www.bing.com
```

**效果：**  
[百度][baidu] 和 [必应][bing] 都是搜索引擎。

[baidu]: https://www.baidu.com
[bing]: https://www.bing.com

#### 自动链接

直接用尖括号包裹 URL 或邮箱地址：

```markdown
<https://example.com>
<email@example.com>
```

**效果：**  
<https://example.com>  
<email@example.com>

### 3.6 图片

图片语法与链接类似，前面加一个感叹号：

```markdown
![替代文字](图片URL "可选标题")
```

例如：

```markdown
![Markdown 徽章](https://markdown-here.com/img/icon256.png)
```

**效果：**  
![Markdown 徽章](https://markdown-here.com/img/icon256.png)

图片也支持参考式写法。

### 3.7 引用

使用 `>` 表示引用，可以嵌套：

```markdown
> 这是一段引用。
> 
> 可以跨越多行。
>> 嵌套引用。
```

**效果：**

> 这是一段引用。
>
> 可以跨越多行。
>> 嵌套引用。

### 3.8 代码

#### 行内代码

用反引号 `` ` `` 包裹：

```markdown
请执行 `npm install` 命令。
```

**效果：**  
请执行 `npm install` 命令。

#### 代码块

用三个反引号 ` ``` ` 包裹，并可指定语言实现语法高亮：

````markdown
```python
def hello():
    print("Hello, Markdown!")
```
````

**效果：**

```python
def hello():
    print("Hello, Markdown!")
```

也可以用缩进 4 个空格或一个制表符表示代码块，但不支持语法高亮。

### 3.9 水平线

使用三个或更多的 `-`、`*` 或 `_`：

```markdown
---
***
___
```

**效果：**

---
***
___

### 3.10 表格

用 `|` 分隔单元格，用 `-` 分隔表头与表体，可用 `:` 设置对齐方式：

```markdown
| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 苹果   | 香蕉     | 橙子   |
| 猫     | 狗       | 兔子   |
```

**效果：**

| 左对齐 | 居中对齐 | 右对齐 |
|:-------|:--------:|-------:|
| 苹果   | 香蕉     | 橙子   |
| 猫     | 狗       | 兔子   |

### 3.11 任务列表

在 GitHub Flavored Markdown (GFM) 中支持任务列表：

```markdown
- [x] 已完成任务
- [ ] 未完成任务
```

**效果：**

- [x] 已完成任务
- [ ] 未完成任务

### 3.12 脚注

某些 Markdown 处理器（如 Pandoc、GitHub 部分支持）支持脚注：

```markdown
这是一段文字[^1]。

[^1]: 这是脚注的解释。
```

**效果：**  
这是一段文字[^1]。

[^1]: 这是脚注的解释。

> 注意：脚注的渲染效果依赖具体平台。

### 3.13 定义列表

部分扩展语法支持定义列表：

```markdown
Markdown
:   一种轻量级标记语言。

HTML
:   超文本标记语言。
```

**效果（取决于渲染器）：**

Markdown
:   一种轻量级标记语言。

HTML
:   超文本标记语言。

### 3.14 内嵌 HTML

Markdown 兼容 HTML，当 Markdown 语法无法满足需求时，可以直接使用 HTML 标签：

```markdown
这是一段 <span style="color: red;">红色文字</span>。

<details>
  <summary>点击展开</summary>
  这里是隐藏的内容。
</details>
```

**效果：**

这是一段 <span style="color: red;">红色文字</span>。

<details>
  <summary>点击展开</summary>
  这里是隐藏的内容。
</details>

---

## 4. 扩展语法（GFM）

GitHub Flavored Markdown (GFM) 在标准 Markdown 基础上增加了一些实用功能，包括：

- **任务列表**（见 3.11）
- **表格**（见 3.10）
- **删除线**（见 3.3）
- **自动链接**（URL 自动识别）
- **围栏代码块并支持语法高亮**（见 3.8）
- **表情符号**：`:smile:` 显示为 :smile:
- **提及用户**：`@github/someone` 在 GitHub 上会触发通知
- **参考链接和脚注**的增强

大多数在线平台都采用 GFM 或其变体，因此掌握这些扩展语法非常实用。

---

## 5. Markdown 编辑器推荐

- **Typora**：所见即所得，界面简洁，支持多种主题和导出格式。
- **Visual Studio Code** + 插件（如 Markdown All in One）：强大的编辑体验，支持实时预览。
- **Obsidian**：基于 Markdown 的知识库管理工具，适合做笔记和双链。
- **Mark Text**：开源、跨平台的所见即所得编辑器。
- **Haroopad**：功能丰富的 Markdown 编辑器。
- **在线编辑器**：StackEdit、Dillinger、Cmd Markdown 等，无需安装即可使用。

---

## 6. 最佳实践

- **保持简单**：不要过度嵌套或使用复杂 HTML，除非必要。
- **使用语义化标记**：例如标题按层级使用，不要为了改变字体大小而滥用标题。
- **列表项一致性**：无序列表统一使用 `-`，有序列表的数字不必按顺序，Markdown 会自动修正，但建议手动编写正确顺序便于阅读。
- **适当添加空行**：段落、列表、代码块前后用空行分隔，提高可读性。
- **为图片添加替代文字**：有利于无障碍访问和图片加载失败时的理解。
- **使用参考式链接管理长 URL**：使正文更清晰。
- **遵循项目规范**：如果参与多人协作，事先约定 Markdown 风格（如缩进空格数、列表标记等）。

---

## 7. 高级主题

### 7.1 YAML Front Matter

许多静态网站生成器（如 Jekyll、Hugo、Hexo）和 Markdown 编辑器支持在文件开头添加 YAML 格式的元数据，称为 Front Matter。它通常用 `---` 包裹，用于定义标题、日期、分类、标签等信息。

```markdown
---
title: 我的文章
date: 2025-03-15
categories: 技术
tags: [Markdown, 教程]
---

# 正文开始...
```

Front Matter 在渲染时会被解析，但不会显示在正文中。

### 7.2 数学公式

通过 LaTeX 语法，许多 Markdown 渲染器（如 Typora、Jupyter、GitHub 的 MathJax 支持）可以显示数学公式。

- **行内公式**：用单个美元符号 `$...$` 包裹  
  `$E = mc^2$` 效果：$E = mc^2$
- **块级公式**：用双美元符号 `$$...$$` 包裹  

```markdown
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$
```

效果：
$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### 7.3 图表和流程图（Mermaid）

Mermaid 是一种基于文本的图表绘制工具，许多 Markdown 编辑器（如 Typora、GitHub）支持嵌入 Mermaid 代码块。

````markdown
```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
````

效果（需渲染器支持）：

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```

### 7.4 交叉引用与目录

一些扩展语法允许插入目录或交叉引用标题。例如在 Markdown 中，可以使用 `[链接文本](#标题标识符)` 的方式链接到同一文档的标题。标题标识符通常是将标题转换为小写、用连字符连接（如 `## 我的标题` 的标识符为 `#我的标题`）。

在支持自动目录的编辑器（如 Typora）中，可以插入 `[TOC]` 生成目录。

```markdown
[TOC]

## 第一节
## 第二节
```

### 7.5 内联属性

某些 Markdown 变体（如 Kramdown）允许为元素添加属性，例如为图片指定宽度：

```markdown
![图片](image.png){: width="50%"}
```

这并非标准语法，使用时需确认渲染器支持。

---

## 8. Markdown 与其他工具的集成

### 8.1 静态网站生成器

Markdown 是静态网站生成器（如 **Hugo**、**Jekyll**、**Next.js**、**VuePress**）的核心内容格式。你可以用 Markdown 写文章，生成器会自动将其转换为 HTML，并套用主题。

### 8.2 文档生成工具

- **MkDocs**：专为项目文档设计，使用 Markdown 编写，支持主题和插件。
- **Docusaurus**：Facebook 开源，适合构建文档网站，支持 Markdown 和 MDX（在 Markdown 中嵌入 JSX）。
- **GitBook**：在线文档平台，支持 Markdown 导入。

### 8.3 笔记应用

- **Obsidian**：基于本地 Markdown 文件的双向链接笔记工具，知识库构建神器。
- **Roam Research**、**Logseq**：类似理念，支持 Markdown 格式。
- **Notion**：虽使用自己的块编辑器，但支持 Markdown 快捷输入（如 `#` 标题、`*` 列表等）。

### 8.4 转换工具（Pandoc）

**Pandoc** 是一个强大的文档转换工具，可以在 Markdown、HTML、PDF、Word、LaTeX 等数十种格式之间相互转换。例如：

```bash
pandoc input.md -o output.pdf
```

通过 Pandoc，你可以利用 Markdown 编写，然后输出为出版级 PDF 或 Word 文档。

---

## 9. 常见问题与解答

### Q1: Markdown 中如何添加注释？

A: Markdown 没有内置注释语法，但可以使用 HTML 注释 `<!-- 注释内容 -->`，它在渲染时会被忽略。

### Q2: 如何在表格中换行？

A: 可以在单元格中使用 HTML 的 `<br>` 标签。例如：

```markdown
| 列1 | 列2 |
|-----|-----|
| 第一行<br>第二行 | 内容 |
```

### Q3: 如何强制换行而不开始新段落？

A: 在行尾添加两个空格再回车。

### Q4: 不同平台的 Markdown 语法有差异，如何保证兼容性？

A: 尽量使用标准 CommonMark 语法，避免依赖特定扩展。如果必须使用扩展，可在文档开头注明所需的渲染器。

### Q5: 如何在 Markdown 中嵌入视频？

A: Markdown 本身不支持嵌入视频，但可以使用 HTML 的 `<video>` 标签或嵌入 iframe（如 YouTube 嵌入代码）。

```html
<video src="video.mp4" controls></video>
```

### Q6: 有没有 Markdown 的语法检查工具？

A: 有，例如 **markdownlint**（VS Code 插件）可以检查并修复语法问题，保持风格一致。

---

## 10. 总结

通过本文，你应该已经全面掌握了 Markdown 的编写方法，包括：

- **基本语法**：标题、强调、列表、链接、图片、引用、代码、表格、任务列表等。
- **扩展语法**：GFM、数学公式、Mermaid 图表、Front Matter 等。
- **最佳实践**：保持简洁、语义化、合理使用空行和参考链接。
- **实用工具**：编辑器推荐、与静态网站生成器和 Pandoc 的集成。
- **常见问题**：注释、表格换行、兼容性等解决方案。

Markdown 是一门终身受用的技能，无论你是写博客、记笔记、写文档还是出书，它都能让你专注于内容本身。现在就开始用 Markdown 记录你的想法吧！

---

**延伸阅读：**

- [Markdown 官方文档（英文）](https://daringfireball.net/projects/markdown/)
- [GitHub Flavored Markdown 规范](https://github.github.com/gfm/)
- [CommonMark 规范](https://commonmark.org/)
- [Pandoc 用户指南](https://pandoc.org/MANUAL.html)
