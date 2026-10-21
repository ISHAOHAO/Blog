# Web 安全入门研究笔记

> 研究日期：2026-10-21
> 研究对象：[《Web安全学习笔记》中文索引](https://websec.readthedocs.io/zh/latest/index.html)
> 目的：为零基础 Web 安全教程整理一份事实与术语速查。本文只保留防御性、概念性内容，不复制作业环境之外的利用载荷、绕过步骤或攻击目标。

## 1. 阅读范围与取舍

指定笔记的目录覆盖 HTTP/TLS、信息收集、SQL 注入、XSS、CSRF、SSRF、文件与路径问题、配置安全、JWT/OAuth 以及安全开发等主题；它也包含 payload、WAF 绕过、内网利用和工具速查等进阶或操作性内容。入门教程应先建立浏览器—服务器—数据库的基本模型，再学习漏洞的成因和修复；OWASP 当前的 [Top 10:2025](https://top10.owasp.org/2025/) 可作为风险分类索引，而不是“所有漏洞”的完整清单。

## 2. 先建立 Web 的基本模型

- **HTTP 请求/响应**：浏览器发送请求，通常包含方法、目标、请求头和可选的请求体；服务器返回状态码、响应头和可选的响应体。理解这些组成部分，是阅读抓包、日志和安全响应头的基础。[MDN：HTTP 概览](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview)；规范见 [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110)。
- **HTTPS/TLS**：HTTPS 是在 HTTP 之上使用 TLS 的安全传输方式；TLS 的目标包括在通信双方之间提供机密性、完整性和身份认证。登录凭据和会话标识应只通过 TLS 传输。[OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)；[TLS 1.3（RFC 8446）](https://www.rfc-editor.org/rfc/rfc8446)。
- **源（origin）**：浏览器通常用“协议 + 主机名 + 端口”定义源；其中任一项不同就可能是跨源。同源策略限制一个源的脚本如何读取或操作另一个源的资源。[MDN：同源策略](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Same-origin_policy)。
- **CORS**：跨源资源共享是服务器通过 HTTP 响应头声明哪些跨源请求可以被浏览器脚本读取的机制；它不是绕过同源策略的客户端开关，带凭据的请求还需要更严格的服务端响应配置。[MDN：CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)。
- **Cookie 与会话**：HTTP 本身是无状态的，网站常用 Cookie 保存会话标识，让后续请求关联到已登录用户。Cookie 的 `Secure` 限制其通过 HTTPS 发送，`HttpOnly` 阻止 JavaScript 读取，`SameSite` 可限制跨站发送；这些属性不能替代服务端授权检查。[MDN：Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)；[RFC 6265](https://www.rfc-editor.org/rfc/rfc6265)。

## 3. 必须分清的身份概念

- **认证（authentication）**回答“你是谁”；**授权（authorization）**回答“你能做什么”。用户登录成功不等于可以读取或修改所有资源。授权检查应在每次请求执行，并默认拒绝、按最小权限授予访问。[OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)；[OWASP Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html)。
- **会话固定与会话管理**：会话标识是敏感凭据；登录或权限变化后应更新会话标识，退出登录或失效后服务端应拒绝旧标识。会话 Cookie 应设置合适的 `Secure`、`HttpOnly` 和 `SameSite` 属性。[OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)。
- **JWT**：JSON Web Token 是一种紧凑的、URL 安全的声明（claims）载体。JWT 的编码本身不等于加密；应用必须验证签名、算法、签发者、受众和有效期等约束，不能只解码后信任内容。[RFC 7519](https://www.rfc-editor.org/rfc/rfc7519)。
- **OAuth 2.0**：OAuth 2.0 是授权框架，用于让客户端获得对受保护资源的有限访问；它不应被简单等同为“登录协议”。[RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)。浏览器应用还应遵循当前 OAuth 安全最佳实践，并在适用时使用 PKCE。[RFC 9700](https://www.rfc-editor.org/rfc/rfc9700)；[RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)。

## 4. 常见漏洞术语与根因

### 4.1 注入与 SQL 注入

**注入**发生在应用把不可信输入拼接进另一种语言或解释器时，使输入改变了原本的语义。SQL 注入是输入改变数据库查询语句的含义；核心修复是使用预编译/参数化查询，让数据库区分“代码”和“数据”，而不是依赖手工转义。[OWASP SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)；[OWASP Top 10:2025 A05 Injection](https://top10.owasp.org/2025/A05_2025-Injection/)。

### 4.2 XSS（跨站脚本）

XSS 是不可信数据被浏览器当作 HTML、脚本、URL 或其他可执行内容解释，导致攻击者脚本在受害者浏览器中运行。常见术语包括反射型、存储型和 DOM 型；区别在于不可信数据的来源和到达浏览器执行位置。安全输出必须匹配上下文（HTML、属性、JavaScript、CSS、URL），需要允许用户编写 HTML 时则使用经过审查的 HTML 清理器。[OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)；[指定笔记：XSS 分类](https://websec.readthedocs.io/zh/latest/vuln/xss/index.html)。

`HttpOnly` 可以降低脚本直接窃取会话 Cookie 的风险，但不能修复 XSS 本身；CSP 是纵深防御机制，不能替代正确的上下文输出编码。[MDN：Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Cookies)；[MDN：Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)。

### 4.3 CSRF（跨站请求伪造）

CSRF 利用浏览器在跨站请求中自动携带身份凭据，使受害者在已登录状态下提交非本人意图的状态改变请求；它与 XSS 不同，CSRF 的核心问题是“网站把请求当成用户主动发起”。对有状态应用，服务端生成并验证 CSRF token 是常见防御；还应正确使用 Cookie 的 `SameSite`，并让改变状态的操作使用合适的 HTTP 方法和服务端授权检查。[指定笔记：CSRF](https://websec.readthedocs.io/zh/latest/vuln/csrf.html)；[OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)。

### 4.4 SSRF（服务端请求伪造）

SSRF 是应用服务器根据用户可控输入发起网络请求，攻击者借此让服务器访问原本对外不可达的内部服务、管理接口或本机资源。防御重点是尽量不接受完整任意 URL；确需访问时，使用明确的协议、主机和端口 allow-list，解析后校验目标，并限制网络出口和响应内容。deny-list 容易因解析差异、重定向或 DNS 变化而失效。[指定笔记：SSRF](https://websec.readthedocs.io/zh/latest/vuln/ssrf.html)；[OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)。

### 4.5 路径穿越、文件读取与文件上传

- **路径穿越（path traversal）**：文件名或路径输入使应用访问预期目录之外的文件，例如通过路径控制序列或绝对路径。修复应使用固定的存储根目录、规范化后再检查路径，并避免把用户输入直接当作文件系统路径。[指定笔记：目录穿越](https://websec.readthedocs.io/zh/latest/vuln/pathtraversal.html)；[CWE-22：Improper Limitation of a Pathname](https://cwe.mitre.org/data/definitions/22.html)。
- **不安全文件上传**：文件名、扩展名、MIME 类型和内容都可能被伪造；上传功能应只允许业务需要的类型和大小，重新生成文件名，限制访问权限，并尽量把文件存放在不可直接执行或不可直接访问的位置。[指定笔记：文件上传](https://websec.readthedocs.io/zh/latest/vuln/fileupload.html)；[OWASP File Upload Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)。

### 4.6 命令注入与其他解释器注入

命令注入是应用把不可信输入交给操作系统 shell 或命令解释器，导致输入改变了要执行的命令。优先使用不经过 shell 的库/API，并以固定参数和 allow-list 约束输入；“过滤几个危险字符”不是可靠边界。[指定笔记：命令注入](https://websec.readthedocs.io/zh/latest/vuln/cmdinjection.html)；[CWE-78：OS Command Injection](https://cwe.mitre.org/data/definitions/78.html)。同一思路也适用于模板、XPath、XML 外部实体等解释器：输入的语法边界必须由安全 API 控制，而不是由字符串拼接控制。[OWASP Top 10:2025 A05 Injection](https://top10.owasp.org/2025/A05_2025-Injection/)。

## 5. 安全开发的最小基线

- **输入验证**：验证是业务规则的一部分，应按类型、长度、范围、编码和允许集合检查；对复杂 URL、路径和文件类型，先规范化/解析，再按明确规则判断。输入验证不能替代输出编码、参数化查询或授权检查。[OWASP Input Validation Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)。
- **输出编码**：编码必须匹配输出上下文；HTML 中安全的编码方式不一定适用于 JavaScript、CSS 或 URL。框架的默认转义应保留，只有在明确理解上下文时才使用原始 HTML/脚本 API。[OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)。
- **错误处理**：对用户返回通用错误，详细堆栈、SQL 错误和内部路径只进入受保护的服务端日志；否则错误信息可能泄露实现细节。[OWASP Error Handling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html)。
- **日志与告警**：记录认证失败、权限拒绝、关键配置变化和异常请求等可用于检测与调查的事件，同时避免把密码、会话 token 和个人敏感数据写入日志。[OWASP Logging Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html)。
- **安全响应头**：HSTS 告诉浏览器后续连接必须使用 HTTPS；CSP 限制页面可加载和执行的资源；`X-Content-Type-Options: nosniff` 可阻止浏览器对部分响应进行 MIME 猜测。它们是纵深防御，不能替代代码级修复。[MDN：HSTS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security)；[MDN：CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)；[MDN：X-Content-Type-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Content-Type-Options)。
- **依赖与配置**：关闭不需要的调试端点和默认凭据，及时更新依赖，生产环境不暴露源码映射、详细错误和管理接口；配置安全在 OWASP 当前分类中单独列为安全风险。[OWASP Top 10:2025 A02 Security Misconfiguration](https://top10.owasp.org/2025/A02_2025-Security_Misconfiguration/)。

## 6. 推荐的零基础学习顺序

1. HTTP 请求/响应、URL、Cookie、会话、同源策略和 TLS。
2. 认证与授权的区别，以及“每次请求检查权限、默认拒绝”的服务端思维。
3. 输入验证、参数化查询、上下文相关输出编码和安全错误处理。
4. 依次理解 SQL 注入、XSS、CSRF、路径穿越、文件上传和 SSRF 的根因与修复。
5. 最后再学习 JWT/OAuth、CSP、日志告警、依赖安全和业务逻辑漏洞。

练习应只在本地实验环境或明确授权的目标上进行；课程示例优先展示请求、响应、日志和修复前后的差异，而不是面向真实目标的扫描、绕过或持久化操作。

## 7. 来源与核对记录

- 指定材料：[Web安全学习笔记首页](https://websec.readthedocs.io/zh/latest/index.html)、[SQL 注入索引](https://websec.readthedocs.io/zh/latest/vuln/sql/index.html)、[XSS 索引](https://websec.readthedocs.io/zh/latest/vuln/xss/index.html)、[CSRF](https://websec.readthedocs.io/zh/latest/vuln/csrf.html)、[SSRF](https://websec.readthedocs.io/zh/latest/vuln/ssrf.html)、[目录穿越](https://websec.readthedocs.io/zh/latest/vuln/pathtraversal.html)、[文件上传](https://websec.readthedocs.io/zh/latest/vuln/fileupload.html)。
- 一手安全指导：[OWASP Top 10:2025](https://top10.owasp.org/2025/)、[OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)、[OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)。
- Web 平台文档：[MDN HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP)、[MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)、[MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)。
- 标准与规范：[RFC 9110 HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)、[RFC 8446 TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)、[RFC 6265 Cookie](https://www.rfc-editor.org/rfc/rfc6265)、[RFC 6749 OAuth 2.0](https://www.rfc-editor.org/rfc/rfc6749)、[RFC 7519 JWT](https://www.rfc-editor.org/rfc/rfc7519)、[RFC 7636 PKCE](https://www.rfc-editor.org/rfc/rfc7636)、[RFC 9700 OAuth Security BCP](https://www.rfc-editor.org/rfc/rfc9700)。

> 注：上文中的 OWASP、MDN、IETF/RFC、MITRE CWE 链接用于支撑事实性表述；指定笔记用于确定中文术语范围与学习地图。文中未把指定笔记中的第三方博客、Payload 或绕过技巧当作事实依据。
