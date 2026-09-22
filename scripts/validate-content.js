import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const postsDirectory = path.resolve("src/content/posts");
const issues = [];
const titles = new Map();
const tagSpellings = new Map();

function collectMarkdownFiles(directory) {
	return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const fullPath = path.join(directory, entry.name);
		return entry.isDirectory()
			? collectMarkdownFiles(fullPath)
			: /\.(md|mdx)$/i.test(entry.name)
				? [fullPath]
				: [];
	});
}

function unquote(value = "") {
	return value.trim().replace(/^(["'])(.*)\1$/, "$2");
}

function parseTags(value = "") {
	const inner = value.trim().replace(/^\[/, "").replace(/\]$/, "");
	if (!inner) return [];
	return inner
		.split(",")
		.map((tag) => unquote(tag).trim())
		.filter(Boolean);
}

for (const filePath of collectMarkdownFiles(postsDirectory)) {
	const relativePath = path.relative(process.cwd(), filePath);
	const text = fs.readFileSync(filePath, "utf8").replace(/\r\n/g, "\n");
	const lines = text.split("\n");

	if (lines[0]?.trim() !== "---") {
		issues.push(`${relativePath}:1 front matter 必须以 --- 开始`);
		continue;
	}

	const closingIndex = lines.findIndex(
		(line, index) => index > 0 && line.trim() === "---",
	);
	if (closingIndex < 0) {
		issues.push(`${relativePath} front matter 缺少标准的 --- 结束线`);
		continue;
	}

	const frontMatter = new Map();
	for (const line of lines.slice(1, closingIndex)) {
		const match = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
		if (match) frontMatter.set(match[1], match[2]);
	}

	for (const required of [
		"title",
		"published",
		"description",
		"tags",
		"category",
		"draft",
	]) {
		if (!frontMatter.has(required)) {
			issues.push(`${relativePath} 缺少 ${required} 字段`);
		}
	}

	const title = unquote(frontMatter.get("title"));
	const description = unquote(frontMatter.get("description"));
	if (description.length < 20) {
		issues.push(`${relativePath} description 过短，至少写 20 个字符`);
	}

	if (titles.has(title)) {
		issues.push(`${relativePath} 与 ${titles.get(title)} 标题重复：${title}`);
	} else {
		titles.set(title, relativePath);
	}

	const published = new Date(unquote(frontMatter.get("published")));
	for (const field of ["updated", "lastVerified"]) {
		if (!frontMatter.has(field)) continue;
		const date = new Date(unquote(frontMatter.get(field)));
		if (Number.isNaN(date.getTime())) {
			issues.push(`${relativePath} 的 ${field} 不是有效日期`);
		} else if (!Number.isNaN(published.getTime()) && date < published) {
			issues.push(`${relativePath} 的 ${field} 不能早于 published`);
		}
	}

	const image = unquote(frontMatter.get("image"));
	if (image && !/^https?:\/\//i.test(image)) {
		const imagePath = path.resolve(path.dirname(filePath), image);
		if (!fs.existsSync(imagePath)) {
			issues.push(`${relativePath} 引用的封面不存在：${image}`);
		}
	}

	const series = unquote(frontMatter.get("series"));
	if (frontMatter.has("seriesOrder") && !series) {
		issues.push(`${relativePath} 设置了 seriesOrder，但没有 series`);
	}

	for (const tag of parseTags(frontMatter.get("tags"))) {
		const normalized = tag.toLocaleLowerCase("zh-CN");
		const spellings = tagSpellings.get(normalized) ?? new Set();
		spellings.add(tag);
		tagSpellings.set(normalized, spellings);
	}

	let insideFence = false;
	for (const line of lines.slice(closingIndex + 1)) {
		if (/^\s*(```|~~~)/.test(line)) {
			insideFence = !insideFence;
			continue;
		}
		if (
			!insideFence &&
			line.startsWith("# ") &&
			line.slice(2).trim() === title
		) {
			issues.push(`${relativePath} 正文重复一级标题；页面模板已经输出文章标题`);
		}
	}
}

for (const spellings of tagSpellings.values()) {
	if (spellings.size > 1) {
		issues.push(`标签大小写不一致：${[...spellings].join(" / ")}`);
	}
}

if (issues.length > 0) {
	console.error(`内容校验失败（${issues.length} 项）：`);
	for (const issue of issues) console.error(`- ${issue}`);
	process.exit(1);
}

console.log(
	`内容校验通过：${collectMarkdownFiles(postsDirectory).length} 篇文章`,
);
