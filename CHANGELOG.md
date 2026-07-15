# Changelog

## [1.5.1](https://github.com/webkubor/typora-Bloom-theme/compare/v1.5.0...v1.5.1) (2026-07-15)


### Bug Fixes

* **theme:** paint page backgrounds with theme-owned --bg, not --bg-color ([aab9061](https://github.com/webkubor/typora-Bloom-theme/commit/aab906105762908896ae4a586822e840808bac8d))

## [1.5.0](https://github.com/webkubor/typora-Bloom-theme/compare/v1.4.0...v1.5.0) (2026-07-15)


### Features

* **theme:** add Ink, Amber, Lapis palettes (24 themes) + palette wall with GitHub voting ([eae97fc](https://github.com/webkubor/typora-Bloom-theme/commit/eae97fc3e8319d3380b0ad4f3b05ce5f7e3a6c4f))


### Bug Fixes

* **site:** refresh stale banner, remove dead netlify.toml copy in pages build ([692ca87](https://github.com/webkubor/typora-Bloom-theme/commit/692ca87ef585eb2f1b1be5e428ac35d24953f91b))

## [1.4.0](https://github.com/webkubor/typora-Bloom-theme/compare/v1.3.5...v1.4.0) (2026-07-15)


### Features

* **build:** compile oklch/color-mix to static sRGB for legacy Typora compatibility ([16eb07f](https://github.com/webkubor/typora-Bloom-theme/commit/16eb07fced37c6972d1e85117ab3660f19ea34d9))
* 代码块滚动、发版流程统一、更新日志补全 ([80f6ab2](https://github.com/webkubor/typora-Bloom-theme/commit/80f6ab2b8e2e3c5ee6d8304813ed19d01dfca77d))


### Bug Fixes

* **ci:** attach Bloom-theme.zip to release-please releases ([46ace46](https://github.com/webkubor/typora-Bloom-theme/commit/46ace4694a21234b927b644d28160b287e0306c9))
* **theme:** GitHub Alerts real DOM, mermaid sequence contrast, print cleanup ([64bee48](https://github.com/webkubor/typora-Bloom-theme/commit/64bee48c4a2e22c067fa27196fa4236244a7c9ff))

## v1.3.5 · 2026-04-30
- **[Feat] 新增麦穗 (Wheat) 主题**：新增浅色 `wheat` 和深色 `wheat-dark` 两套莫兰迪麦穗色主题，采用 OKLCH 色彩空间自动生成。
- **[Feat] 开发工具链增强**：新增 `dev-toolkit.js`（浏览器预览）、`dev-typora.js`（实机热重载）、`theme-vars.js`（变量提取）、`validate-theme-standard.js`（主题校验）等开发脚本。
- **[Fix] 标题栏适配重构**：移除旧的 `mac-seamless-mode` 标题栏 hack，改用 `#top-titlebar` 统一适配，修复深色模式标题栏对比度问题。
- **[Fix] 快速打开列表对比度**：修复深色主题下「快速打开」列表选中项文字对比度过低的问题 (#12)。
- **[Fix] 源码模式可读性**：修复深色主题下源码模式 (Source Mode) 文字不可见的问题 (#9)。
- **[Fix] 表格列调整**：移除 `overflow:hidden`，修复表格列宽拖拽时 UI 错位的问题 (#13)。
- **[Fix] HTML 块悬停**：修复深色模式下 HTML 块悬停时背景意外变白的问题。
- **[Fix] Pages 部署**：添加缺失的 `build-pages.sh`，修复 GitHub Pages 部署失败。
- **[Refactor] 深色主题变量统一**：全量重构深色主题变量定义，引入 `--page-depth-1/2` 页面深度渐变、`--shadow-sm/shadow/shadow-lg` 阴影层级，统一 `--bg-color` 引用。
- **[Refactor] 主题色微调**：丹红 (Cinnabar) 深色主题降低 accent 饱和度，提升背景亮度，改善阅读舒适度。
- **[Chore] 域名更新**：官网域名更新为 bloom.webkubor.online。
- **[Chore] 发版流程统一**：移除手动 `release.js` 脚本，统一使用 Release Please 自动发版。

## v1.3.4 · 2026-03-09
- **[Feat] 全量美学统合 (Unified Aesthetics)**：统合代码块、HTML 块、YAML Frontmatter 的视觉语言，统一采用 18px 圆角卡片、Mac 风格"红黄绿"装饰点及代码级背景色，彻底消除视觉碎裂感。
- **[Feat] GitHub 原生 Alerts 适配**：全量支持 GitHub 原生 `> [!NOTE]`、`> [!TIP]`、`> [!IMPORTANT]` 等五种警示框语法，并注入 Bloom 特有的 Glassmorphism (磨砂玻璃) 质感。
- **[Fix] Mermaid 深色模式重构**：修复 Mermaid 流程图/时序图在暗色主题下线条不可见及文字对比度过低的问题，注入原生暗色变量。
- **[Fix] macOS 标题栏适配**：修复深色模式下窗口标题栏对比度低及"无缝模式"下的视觉割裂感。
- **[Fix] HTML 嵌入对比度修复**：解决深色模式下嵌入 HTML 标签文字不可见及悬停时背景意外变白的问题。
- **[Chore] 源码精修**：全量重构 16 套主题的 `root-*.css` 格式，优化变量定义层级。

## v1.3.3 · 2026-01-29
- **[Fix] Mermaid 暗色模式重构**：弃用手动 SVG 覆盖，全面启用 Typora 原生 `--mermaid-theme: night` 变量，彻底解决时序图/流程图在暗色主题下的可见性与线条丢失问题。
- **[Fix] macOS 标题栏修复**：解决浅色主题下文件名文字不可见 (低对比度) 及深色主题无缝模式下的"透白条"问题。
- **[Polish] Spring Dark 背景调优**：将背景亮度从 18% 提升至 24% (`#3B3640`)，减轻视觉压抑感，阅读更从容。
- **[Chore] 清理 Demo 资源**：移除冗余的调试文件，保持发布包纯净。

## v1.3.2 · 2026-01-28
- **[Fix]** 修复 Mermaid 时序图在暗色主题下线条与文字可见性低的问题 (Issue #1)。
- **[Refactor]** 工程结构重构：将官网源码（HTML/CSS/JS/Assets）收敛至 `website/` 目录，根目录更清爽。
- **[Refactor]** 主题配置 SSOT：通过 `theme-list.js` 单一数据源控制全局默认主题，一键切换。
- **[Feat]** 官网预览页新增 Mermaid 图表实时渲染支持。
- **[Fix]** 修复 README.md 中的资源文件引用路径。

## v1.3.1 · 2026-01-07
- **Alert 系统重构**：从 GitHub 风格的硬朗色块全面进化为 **Bloom 磨砂质感**，拥有 12px 圆角、半透明背景与柔和边框。
- **语义化适配 (16/16)**：彻底重构 Alert 颜色逻辑，引入 `--important` 等语义变量，实现 Note/Tip/Warning/Caution/Important 五种提示框在 **全部 16 款主题** 下的 100% 自动色彩适配。
- **视觉优化**：修复了提示框在深色模式下过于刺眼的问题，通过 `color-mix` 动态计算背景深度，保证阅读舒适性。

## v1.3.0 · 2026-01-07
- **矩阵补完 (8+8)**：新增 **Ripple (涟漪/青碧)** 与 **Ink (水墨/朱砂)** 系列，达成 **8 浅 + 8 深 (共 16 套)** 的宏大莫兰迪主题库。
- **全系莫兰迪化**：对所有主题进行重构，采用更护眼、高级的 **Morandi (莫兰迪)** 低饱和色调。
- **新增 Amber (琥珀)**：全新 **琥珀橙 (Amber)** 配色，提供温暖且极客的橙色氛围。
- **新增 Spring & Stone Dark**：补全了薰衣草紫的浅色版与暖石的深色版。
- **命名规范化**：原 `Spring` 重命名为 `Spring Dark`；原 `Forest` 升级为 `Verdant Dark`。
- **视觉平衡**：调深所有深色模式的背景亮度（由 22% 降至 14%-20%），实现极致深邃感。
- **官网同步**：更新了官网首页与实时预览页，支持全系 16 款主题的实时切换预览。

## v1.1.1 · 2025-12-28
- **主题扩张**：新增三款 **莫兰迪色系 (Morandi)** —— 雾蓝 (Mist)、草木 (Verdant)、暖石 (Stone)，提供极高的高级感与长效阅读舒适度。
- **新增**：Spring (春季) 粉紫色主题变体，采用清冷柔美的薰衣草色调。
- **UI 重构**：全新**下拉式主题切换器**，支持分类展示八款主题，优化多主题下的导航体验。
- **全站同步**：首页与实时预览页 (Showcase) 交互逻辑全量对齐。
- **视觉迭代**：将蓝色主题进化为更有发光质感的"荧光蓝 (Cyber Blue)"，全面对齐深色模式下的顶级对比度与辨识度。
- **现代化架构**：全量迁移至 **OKLCH 色彩空间**，实现更科学、通透颜色感知与动态状态生成。
- **系统化布局**：引入基于 **8px 的原子间距系统** (`--space-`)，全站 UI 比例更趋完美。
- **视觉优化**：重构侧边栏图标逻辑，修复 Light 主题标题栏异常蓝色，优化全场动效性能。
- **交互增强**：全新"潜行式"专注模式 (Focus Mode)，提供极致沉浸的深夜写作环境。

## v1.0.4 · 2025-12-26
- 修复：代码块语言选择按钮无法点击的问题。
- 新增：侧边栏文件与文件夹图标替换为自定义样式。

## v1.0.3 · 2025-12-26
- 修复：Bloom Cyber 代码块背景偏绿，调整为更偏蓝的色调。

## v1.0.2 · 2025-12-24
- 新增：Bloom Forest / Bloom Cyber 深色系衍生主题色。
- 增强：预览页支持四种主题切换展示。

## v1.0.1 · 2025-12-19
- 优化：两侧大背景留白的氛围层次（浅色/深色）。
