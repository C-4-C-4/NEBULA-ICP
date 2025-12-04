# PROJECT NEBULA // ICP FILING SYSTEM

<div align="center">

![Project Status](https://img.shields.io/badge/STATUS-OPERATIONAL-success?style=for-the-badge)
![License](https://img.shields.io/badge/LICENSE-MIT-orange?style=for-the-badge)
![Version](https://img.shields.io/badge/VERSION-4.5-blue?style=for-the-badge)

<!-- 访客统计 -->
![Visitor Count](https://visitor-badge.laobi.icu/badge?page_id=C-4-C-4.NEBULA-ICP&left_color=black&right_color=orange)

**[ 🌌 星云协议 · 去中心化数字实体档案库 ]**

</div>

## /// SYSTEM.INTRO (项目简介)

**PROJECT NEBULA** 是一个极简主义、高可视化的模拟 ICP 备案系统。它不仅仅是一个表单，更是一个具有**赛博朋克/黑客终端**美学的数字档案馆。

本项目旨在构建一个“数字生命”的登记处。每一个被收录的网站都像是一个被观察的实体，拥有独立的编号、快照和身份标识。系统摒弃了传统后台的繁琐，采用“三要素验证”机制（域名+备案号+私钥）实现无账户的修改与注销。

### ✨ Core Features (核心功能)

*   **终端美学**：全站采用 Neo-Brutalism（新野兽派）与 ASCII/Terminal 风格设计。
*   **自动化收录**：自动抓取网站 Logo (Favicon.im) 和生成网站快照 (WordPress mShots)。
*   **智能交互**：
    *   **选号大厅**：支持搜索和筛选 2025 系列靓号。
    *   **无感验证**：通过私钥 (Auth Code) 进行修改和注销，无需注册账户。
    *   **沉浸体验**：申请过程包含终端模拟动画，拒绝生硬的表单提交。
*   **硬核后台**：
    *   内置 `ROOT_CONSOLE` 管理面板。
    *   支持批量删除、隐藏、审核（通过/驳回）。
    *   黑名单系统，防止恶意域名重复提交。
*   **边缘计算**：完全基于 Cloudflare 生态构建，全球边缘节点秒级响应。

---

## /// TECH_STACK (技术栈)

本项目基于 **Serverless** 架构构建，轻量、免费且高性能。

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Core Framework** | ![Astro](https://img.shields.io/badge/ASTRO-BC52EE?style=flat-square&logo=astro&logoColor=white) | SSR 模式，极致的渲染性能 |
| **UI Component** | ![React](https://img.shields.io/badge/REACT-61DAFB?style=flat-square&logo=react&logoColor=black) | 处理复杂的交互逻辑 (后台、选号) |
| **Styling** | ![Tailwind](https://img.shields.io/badge/TAILWIND-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white) | 快速构建响应式、原子化样式 |
| **Database** | ![Cloudflare D1](https://img.shields.io/badge/CLOUDFLARE_D1-F38020?style=flat-square&logo=cloudflare&logoColor=white) | 边缘 SQL 数据库 (SQLite) |
| **Hosting** | ![Cloudflare Pages](https://img.shields.io/badge/CF_PAGES-F38020?style=flat-square&logo=cloudflare&logoColor=white) | 全球 CDN 托管与构建 |
| **Runtime** | **Cloudflare Workers** | 后端 API 逻辑处理 |

---

## /// DEPLOYMENT_PROTOCOL (部署指南)

本项目专为 **Cloudflare Pages** 设计。请严格按照以下步骤操作，**不需要**服务器。

### 1. 环境准备
*   拥有一个 [Cloudflare](https://dash.cloudflare.com/) 账号。
*   本地安装 Node.js (v18+)。
*   安装 Wrangler CLI: `npm install -g wrangler`。

### 2. 本地开发 (Localhost)
```bash
# 克隆仓库
git clone https://github.com/C-4-C-4/NEBULA-ICP.git
cd NEBULA-ICP

# 安装依赖 (核心步骤：生成 package-lock.json)
npm install

# 初始化本地 D1 数据库
npx wrangler d1 create icp-db

# 应用数据库表结构
npx wrangler d1 execute icp-db --local --file=./db/schema.sql

# 启动开发服务器
npm run dev

3. 生产环境部署 (Production)
Step A: 推送代码到 GitHub
将你的代码推送到你的 GitHub 仓库（注意检查 .gitignore，不要上传 node_modules 和 .wrangler）。
Step B: Cloudflare Pages 设置
登录 Cloudflare Dashboard -> Workers & Pages -> Create Application -> Pages -> Connect to Git。
选择你的仓库，配置如下：
Framework preset: Astro
Build command: npm run build
Output directory: dist
设置环境变量 (Environment Variables):
ADMIN_PASSWORD: 设置你的后台登录密码 (例如 nebula-admin-888)。
Step C: 绑定 D1 数据库 (最关键!)
部署完成后（第一次可能会失败，不用管），进入项目 Settings -> Functions。
找到 D1 database bindings。
点击 Add binding：
Variable name: DB (必须是大写 DB)
D1 database: 选择你在命令行创建的 icp-db。
重新部署：进入 Deployments -> 找到最新一次 -> 点击 Retry deployment。
Step D: 初始化线上数据库
在你的本地终端运行以下命令，将表结构推送到 Cloudflare 云端：

# 注意：这将直接操作线上数据库
npx wrangler d1 execute icp-db --remote --file=./db/schema.sql

/// PROJECT_STATISTICS (项目统计)
<div align="center">
<!-- GitHub Stats -->
![alt text](https://img.shields.io/github/stars/C-4-C-4/NEBULA-ICP?style=social)

![alt text](https://img.shields.io/github/forks/C-4-C-4/NEBULA-ICP?style=social)

![alt text](https://img.shields.io/github/issues/C-4-C-4/NEBULA-ICP)

![alt text](https://img.shields.io/github/last-commit/C-4-C-4/NEBULA-ICP)
<!-- 代码语言分布 -->
![alt text](https://img.shields.io/github/languages/top/C-4-C-4/NEBULA-ICP)

![alt text](https://img.shields.io/github/repo-size/C-4-C-4/NEBULA-ICP)
</div>

/// AUTHOR & CREDITS (作者与致谢)
Architect: CCCC4444
Design Inspiration: Echo Log
Snapshot Service: WordPress mShots
Favicon Service: Favicon.im / Iowen API
"We are not filing domains; we are giving digital entities an identity."
—— PROJECT NEBULA