# 孙琦个人网站 — 设计文档

> 版本: v1.0  
> 创建: 2026-04-22  
> 技术栈: 纯静态 HTML / CSS / JavaScript  
> 部署目标: GitHub Pages

---

## 1. 项目定位

个人品牌网站，三合一：
- **个人简介** — 一句话介绍 + 头像 + 社交链接
- **经历作品** — 工作经历时间轴 + 视频作品集
- **博客文章** — 技术/设计分享（预留扩展）

单页滚动网站（Full-page scroll），带导航锚点。

---

## 2. 设计风格

### 2.1 整体氛围
温暖、优雅、有设计感。参考「奶油色编辑风」——柔和渐变背景 + 精致排版 + 微动效。

### 2.2 配色系统（CSS 变量）
所有颜色必须通过 `:root` 变量引用，禁止硬编码。

| 变量名 | 色值 | 用途 |
|--------|------|------|
| `--cream` | `#FDF6F0` | 主背景色 |
| `--cream-deep` | `#F7EDE4` | 深色背景/区块区分 |
| `--blush` | `#E8788A` | 主强调色（按钮、高亮） |
| `--blush-soft` | `#FACDD5` | 柔和强调（边框、hover） |
| `--wisteria` | `#8E7CB8` | 辅助紫色（标签、装饰） |
| `--wisteria-soft` | `#D4CEE8` | 柔和紫色（渐变） |
| `--pistachio` | `#6AB893` | 辅助绿色（成功、技能） |
| `--pistachio-soft` | `#C5E9D5` | 柔和绿色 |
| `--honey` | `#D4A24C` | 点缀金色（标签、徽章） |
| `--ink` | `#2A1F32` | 主文字色 |
| `--ink-mid` | `#564560` | 次要文字 |
| `--ink-light` | `#857590` | 辅助文字 |
| `--ink-faint` | `#B3A5BE` | 极淡文字 |
| `--glass` | `rgba(253,246,240,0.6)` | 毛玻璃背景 |
| `--glass-border` | `rgba(255,255,255,0.65)` | 毛玻璃边框 |

### 2.3 字体系统
| 变量 | 字体 | 用途 |
|------|------|------|
| `--ff-display` | `'Playfair Display', 'Noto Sans SC', serif` | 大标题、装饰文字 |
| `--ff-body` | `'DM Sans', 'Noto Sans SC', sans-serif` | 正文、UI元素 |
| `--ff-mono` | `'JetBrains Mono', monospace` | 代码、标签 |

### 2.4 响应式断点
- 桌面端：默认
- 平板/小屏：`max-width: 700px`
- 短屏：`max-height: 700px`
- 超短屏：`max-height: 500px`（隐藏装饰元素）

---

## 3. 页面结构（单页 7 屏）

| 序号 | 区块 ID | 内容 | 备注 |
|------|---------|------|------|
| 01 | `#hero` | 首页封面 | 头像 + 姓名 + 简介 + 社交链接 |
| 02 | `#about` | 关于我 | 个人介绍 + 技能标签 |
| 03 | `#experience` | 工作经历 | 时间轴形式 |
| 04 | `#works` | 视频作品集 | **B站/YouTube 嵌入区域** |
| 05 | `#blog` | 博客文章 | 文章卡片列表（预留） |
| 06 | `#contact` | 联系方式 | GitHub + 邮箱 + 其他社媒 |
| — | — | 过渡页（可选） | 情绪过渡，减少信息密度 |

---

## 4. 核心交互

### 4.1 滚动系统
- `scroll-snap-type: y mandatory` — 整屏滚动吸附
- 进度条固定在顶部，随滚动推进
- 右侧导航点，点击跳转到对应区块

### 4.2 入场动画
- `.rv` — 从下方淡入
- `.rv-s` — 缩放淡入
- `.rv-l` / `.rv-r` — 左右滑入
- `.rv-b` — 模糊淡入
- 通过 `.visible` 类触发，配合 `transition-delay`（d1~d7）控制节奏

### 4.3 装饰动画
- 浮动 blob（背景渐变圆）
- 鼠标粉色拖尾（Canvas 粒子效果）
- 装饰性漂浮小图标

### 4.4 视频作品展示
- 作品以卡片网格展示
- 每张卡片：封面图 + 标题 + 简介 + 播放按钮
- 点击后：
  - 方案 A：弹层播放 B站嵌入 iframe
  - 方案 B：跳转到 B站视频页（更简单）
- 预留 `data-bvid` 属性，填入 B站 BV 号即可

---

## 5. 预留位说明

### 5.1 头像位（`#hero`）
```html
<img class="avatar" src="assets/images/avatar.jpg" alt="孙琦头像">
```
- 默认使用占位图（CSS 渐变圆）
- 用户替换 `assets/images/avatar.jpg` 即可

### 5.2 GitHub 链接位（`#contact` + `#hero`）
```html
<a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noopener">
```
- Hero 区：图标按钮形式
- Contact 区：大号链接 + 数据统计（仓库数/粉丝数）
- 通过 GitHub API 自动获取公开数据

### 5.3 视频作品位（`#works`）
```html
<div class="work-card" data-bvid="BVxxxxxx">
    <img class="work-cover" src="assets/images/works/cover-1.jpg">
    <h3>作品标题</h3>
    <p>作品简介...</p>
</div>
```
- 替换 `data-bvid` 为实际 B站视频号
- 替换封面图为视频截图

---

## 6. 文件结构

```
孙琦个人网站/
├── AGENTS.md               ← 本文件
├── index.html              ← 主页面（单页全屏滚动）
├── css/
│   ├── variables.css       ← 颜色/字体/尺寸变量
│   ├── style.css           ← 主布局与组件样式
│   └── animations.css      ← 动画与特效
├── js/
│   ├── main.js             ← 导航、交互、视频弹层
│   └── scroll-effects.js   ← 滚动检测、入场动画
├── assets/
│   ├── images/             ← 头像、作品封面、项目截图
│   └── videos/             ← 本地视频（如有）
└── reference/
    └── presence-layer-v2-portable(1).html  ← 原始参考文件
```

---

## 7. 待办 / 扩展计划

- [ ] 添加深色模式切换（`prefers-color-scheme` + 手动切换）
- [ ] 博客文章页：Markdown → HTML 编译流程
- [ ] 作品分类筛选（全部 / 视频 / 设计 / 开发）
- [ ] 多语言切换（中/英文）
- [ ] 页面加载动画
- [ ] SEO 优化（meta 标签、Open Graph）
- [ ] Google Analytics / 百度统计接入

---

## 8. 修改指南

### 改配色
编辑 `css/variables.css` 中 `:root` 的色值，全站自动生效。

### 改内容
编辑 `index.html` 中对应区块的文本。所有可替换内容用 `<!-- TODO: -->` 标记。

### 加新作品
在 `#works` 区块复制 `.work-card` 模板，修改标题、简介、`data-bvid` 和封面图路径。

### 部署上线
1. 注册 GitHub，创建仓库 `sunqi.github.io`
2. 把本文件夹所有文件 push 到仓库
3. 开启 GitHub Pages（Settings → Pages → Branch: main）
4. 访问 `https://sunqi.github.io`
