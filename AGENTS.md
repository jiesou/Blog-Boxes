# AGENTS.md — Blog-Boxes

## 规则

- 代码保持简单，行内内联能完成的就不要拆分一个抽象层。内联实现是为了减少显式的变量名，命名是应该避免的
- 写代码前 **始终** 先 context7 查询文档。UI 库里有的组件就不要自己实现，默认值有的就不要自己写
- 不要过度工程！不要过度工程！不要过度工程！保持代码实现简短简单。如果可能，减少代码的更改
- 用户添加新需求或处理多个无关任务时，严禁批量完成，严禁中断流程随意插入。**始终** 先使用 `todowrite` 记录，然后逐个老老实实完成，不要想走捷径，捷径只会绕远路
- build pass 完全不能在任何程度上说明代码正确性，build **不是** 验证代码没问题的方式！尤其是样式更改，推敲样式、调用工具才是验证的唯一途径！

## 这是什么

一个使用 **Astro 6** + **Tailwind CSS 4** + **daisyUI** 构建的项目，从 `source/_posts/_boxes/`（位于 Blog-Source 仓库）的 `.md` 文件构建 `/boxes/` 项目卡片页。
`source/_posts/_boxes/` 软链接到了 `./boxes`

作为 Blog-Source 的 git 子模块使用。

源码仓库 → `https://github.com/jiesou/Blog-Boxes.git`

## 项目结构

| 路径 | 作用 |
| --- | --- |
| `src/pages/index.astro` | 首页 / 卡片网格，通过 `import.meta.glob` 读取 `source/_posts/_boxes/*.md` |
| `src/components/` | PostCard, HeroSection, PostsSection, ContributionStrip 等组件 |
| `src/styles/` | Tailwind 全局样式 |
| `src/data/` | 颜色配置等数据 |

## 构建

`npm run build` 使用 Astro 构建到 `dist/`。

在 Blog-Source 中通过 `npm run build` 的流程：
1. `hexo generate`
2. `cd boxes && npm run build`
3. `cp -r boxes/dist/* public/boxes/`

## 经验教训

### 写代码前先搜索现有方案

不要重新发明轮子。在实现任何功能（缓存、组件、API 集成）之前，先在 npm/GitHub 上搜索已有包。很可能已经有人解决了同样的问题。

### 用户抱怨样式时不要删除数据

如果用户说样式不好看，修复样式 — 而不是删除数据。删除功能或数据（尤其是在用户确认数据正确之后）既浪费时间又让用户沮丧。

### 缓存失效策略

缓存存储原始的 API 响应。所有后处理/转换必须在渲染时进行，从缓存的原始数据中读取。这样代码变更（例如在头像 URL 后追加 `?s=100`）就不需要手动清除缓存。
