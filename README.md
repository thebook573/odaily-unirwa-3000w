# Odaily 快讯静态复刻

解压整个 `odaily-static` 目录后，双击 `index.html`。页面使用 HTML、CSS、原生 JavaScript；无需安装依赖或启动服务器。所有自动加载的脚本、样式、字体、Logo、图标和图片均为相对路径本地文件，数据通过普通 script 标签引入，没有 fetch、后台、数据库或 API。

本次继续修改原项目。页面视觉仍参考原 Odaily 快讯模板；当前正文已更新为 UniRwa 全球节点招募突破 3000 万美元的快讯，原文链接暂不配置。

## 手机修改

- 980px 及以下使用独立手机 Header：`#c6f283` 荧光浅绿背景，原站菜单、Bell、手机 Logo、描边搜索框及翻译图标。顺序为 Header → 黑色行情 → 正文，主体占满视口。
- 按原站手机 CSS 使用 vw 控制几何尺寸：375px 基准下 Header 高 46px、行情高 20px、正文宽 343px、左右各 16px。字体保持原站固定 px，未对整页缩放。
- 标题为 19px / 500 字重 / 2px 字距，移除标题圆点和描边；当前文章时间显示为 `2026-09-14 19:25`。
- 正文为 16px，行高为 26px@375，段落之间无额外空白。标题下方采用原站浅绿色至白色渐变；UniRwa 官网内链保留，原文入口在 `sourceUrl` 为空时不显示。
- 正文后显示“最热快讯”：原站标题字体、绿色圆点、火焰、红色时间胶囊和黑色时间轴。首条使用截图中的 Ark Invest 快讯及其真实 URL，后续内容取自参考页。
- 恢复原站猴子 App 下载浮窗和底部五按钮绿色导航。底栏高 51px@375，图标 40px@375；支持安全区域，并在内容末尾留出滚动空间。

## 桌面修改

保留原站左侧竖向导航和 1440px 页面基准：左栏 300px，正文 660px，右栏 310px，正文与右栏间距 30px。标题为 32px / 40px 行高、600 字重；正文为 16px / 32px 行高。校正标题字重，左侧导航改为可滚动区域，避免较矮窗口挤出底部登录入口。

推荐文章仍为原站当前显示的两列文字卡片；参考页这些卡片没有缩略图。推荐和 24 小时快讯已替换成原站标题与逐条对应的真实地址。手机 Header、最热快讯、App 浮窗和绿色底栏在桌面隐藏。

## Logo 与资源

| 用途 | 本地路径 | 官方来源 |
| --- | --- | --- |
| 桌面 Logo | `assets/brand/odaily-logo.svg` | `logo-banner.71275261.svg` |
| 桌面深色 Logo | `assets/brand/odaily-logo-dark.svg` | `logo-banner.42f135ab.svg` |
| 手机 Logo | `assets/brand/odaily-mobile-logo.svg` | `logo-title.6845dc46.svg` |
| favicon 原始标记 | `assets/brand/favicon.svg` | 官方 `/logo.svg` |
| 标签页兼容图标 | `assets/brand/favicon.ico` | 官方 SVG 转换，未重绘 |
| Apple 图标 | `assets/brand/apple-touch-icon.png` | 官方 SVG 转换，未重绘 |

旧的 `assets/logo-mark.svg` 已删除。完整资源 URL 见 `assets/sources.json`。MiSans Latin VF 用于手机西文字体，中文按原站方式使用系统字体回退；最热快讯标题使用原站 HuoShanHanShi 字体。

## 动画、底栏与真实链接

- 行情结构：`index.html` 中 `#market-list`；数据与两组相同内容由 `js/main.js` 更新。
- 行情动画：`css/style.css` 的 `.market-track` 与 `@keyframes market-scroll`，15 秒 linear infinite，从 0 移动至 -50%。每组尾部保留相同间距，循环连接；桌面无该动画。操作系统开启“减少动态效果”时停止动画。
- 移动底栏：`index.html` 的 `.mobile-bottom-bar`，CSS 对应同名选择器；下载、X、Discord、Telegram Group、Telegram Channel 均使用原站公开地址。
- 搜索：桌面表单使用原站实际 `/search?keywords=…` 格式；手机搜索入口进入原站手机搜索页。Bell 进入原站手机 `/zh-CN/push-message`。
- 语言：当前文章没有对应的 Odaily 多语言原文，因此各语言入口改为对应 locale 的快讯首页；导航、页脚、推荐、快讯及外链都有实际 href。外部新窗口链接均包含 `noopener noreferrer`。
- 登录：原站采用账户弹窗及认证接口，并不存在独立登录 href。静态版弹窗提供“前往 Odaily 官网”入口；点赞和收藏也引导至此，不伪造登录或账户成功状态。
- Android：原站桌面标签没有 href，本版链接到其已核实的官方 App 下载页。
- 菜单、语言弹层、设置、更多、主题、关闭、复制及封面预览使用本地交互。无需账户的分享入口为真实 X / Telegram 分享链接。

链接证据见 `checks/source-evidence.json`。

## 检查结果与尚未完成的验收

运行 `python3 tools/check-links.py` 可重复检查；Python 仅用于检查脚本，打开页面不需要 Python。加 `--write` 可更新 `checks/link-audit.json`。

| 链接统计 | 数量 |
| --- | ---: |
| HTML `<a>` 总数 | 99 |
| 有效 href | 99 |
| HTTPS 网页链接 | 97 |
| 有效正文锚点 | 1 |
| 本地封面下载 | 1 |
| 空 href、单独 #、javascript 占位链接 | 0 |

脚本同时核查本地资源、CSS 引用、重复 ID、JS 引用 ID 和内容数据 URL。两个 JS 文件通过语法检查。链接数量包含桌面、手机、语言菜单和弹窗；不是仅计当前屏幕可见项。以上是静态结构检查，并不等于所有目标网站可用性或浏览器点击测试。

**本地文件打开被预览浏览器 URL 安全策略阻止，因此本轮没有完成成品截图、交互点击及动态布局实测。不能将以下尺寸标为视觉验收通过，也没有生成或伪造本地页面截图。**

| 要求尺寸 | 代码规则 | 浏览器截图 / 溢出 / 遮挡 / 动画实测 |
| --- | --- | --- |
| 375 × 812 | 已按原站手机规则设置 | 未完成：本地文件访问受限 |
| 390 × 844 | 已按原站手机规则设置 | 未完成：本地文件访问受限 |
| 400 × 750 | 已按原站手机规则设置 | 未完成：同视口截图对比受限 |
| 430 × 932 | 已按原站手机规则设置 | 未完成：本地文件访问受限 |
| 1366 × 768 | 已按桌面三栏规则设置 | 未完成：本地文件访问受限 |
| 1440 × 900 | 已按原站桌面基准设置 | 未完成：同视口截图对比受限 |
| 1920 × 1080 | 已设置 1440px 内容居中 | 未完成：本地文件访问受限 |

本地双击兼容性依据是完整静态 HTML、相对资源、普通 defer 脚本和无本地数据请求；仍未完成本机浏览器双击实测。此版本提供已修改的代码，**尚未达到用户要求的最终截图验收**。

## 编辑与上线配置

文章、推荐、快讯和行情数据位于 `js/article-data.js`；样式位于 `css/style.css`；交互位于 `js/main.js`。HTML 中保留同一份完整内容用于无脚本显示，修改数据后也应同步 HTML 后备内容。

行情与快讯是参考时点快照，滚动不会更新价格。中文时间按 UTC+8 显示；当前文章时间点为 `2026-09-14T19:25:00+08:00`。

保留原任务要求的静态 SEO、Open Graph 与 Twitter Meta，以及 1200×630 本地分享封面。当前公开地址按现有部署配置为 `https://odaily-static.theblockbeats.workers.dev/`，`canonical`、`og:url`、分享按钮与 `article-data.js` 的 `publicUrl` 已同步；`sourceUrl` 与 `sourcePageUrl` 暂留空。若重新发布到其他域名，请统一替换这些公开地址。

Telegram、X 等平台抓取必须在公开 HTTPS 部署后验证，本轮没有部署。页面为静态复刻演示，原品牌和素材归各自权利人。
