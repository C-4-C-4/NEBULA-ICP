# 🌌 NEBULA.ICP | Decentralized Filing System

![Style](https://img.shields.io/badge/Style-Neo--Brutalism-orange?style=for-the-badge&labelColor=000)
![Astro](https://img.shields.io/badge/Astro-4.0-BC52EE?style=for-the-badge&logo=astro&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages%20%2B%20D1-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)

> **"We are not filing domains; we are giving digital entities an identity."**
>
> 一个基于 Cloudflare D1 的去中心化、赛博朋克风格的数字实体档案库系统。无服务器架构，边缘秒级响应。

---

## 🏗️ 1. 项目介绍 (Introduction)

**NEBULA.ICP** 是一个极简主义、高可视化的模拟 ICP 备案系统。它不仅仅是一个表单，更是一个具有 **赛博朋克/黑客终端** 美学的数字档案馆。系统摒弃了传统后台的繁琐，采用“三要素验证”机制（域名+备案号+私钥）实现无账户的修改与注销。

### 👥 作者与维护
*   **Author**: [C-4-C-4](https://github.com/C-4-C-4)
*   **Repository**: [NEBULA-ICP](https://github.com/C-4-C-4/NEBULA-ICP)
*   **Role**: Architect / Operator

### 🛠️ 技术栈 (Tech Stack)
*   **核心框架**: [Astro (SSR Mode)](https://astro.build/) - 极致的渲染性能与服务端渲染能力。
*   **交互组件**: [React](https://react.dev/) - 处理复杂的后台管理、选号大厅、终端模拟动画。
*   **样式库**: [Tailwind CSS](https://tailwindcss.com/) - 快速构建工业机能风、新野兽派布局。
*   **数据库**: **Cloudflare D1 (SQLite)** - 运行在边缘节点的分布式 SQL 数据库。
*   **托管**: **Cloudflare Pages** - 全球 CDN 加速与自动化构建。
*   **鉴权**: **Admin Session (Cookie)** + **User Auth Code (Private Key)**。

---

## ✨ 2. 特色功能与实现原理 (Features)

### 🖥️ 沉浸式终端 UI (Immersive Terminal UI)
*   **终端模拟**: 申请过程包含 4 秒的系统自检与数据上链动画，拒绝生硬的表单提交。
*   **无感交互**: 全站移除原生弹窗 (`alert`)，采用自定义的 Toast 通知条与模态框。
*   **视觉反馈**: 按钮具备机械按压感、悬停光效；列表页支持随机洗牌动画。

### 🤖 自动化与智能化 (Automation)
*   **自动快照**: 集成 WordPress mShots 服务，提交域名即刻生成高清网站截图。
*   **智能 Logo**: 集成 Favicon.im / Iowen API，多级容错获取网站图标，防裂图处理。
*   **防重机制**: 内置域名查重、备案号防碰撞逻辑。

### 🔐 选号与安全系统 (Security & Selection)
*   **选号大厅**: 用户可在 `2025` 号段池中搜索心仪的靓号，或使用随机推荐。
*   **私钥验证**: 用户申请成功后获得唯一 8 位私钥 (`Auth Code`)，凭此码修改或注销，无需注册账户。
*   **安全风控**:
    *   **限流**: 单 IP 限制 1 小时内提交 6 次。
    *   **黑名单**: 后台可一键拉黑恶意域名，前台提交时自动拦截并提示申诉邮箱。

### ⚡ ROOT_CONSOLE 后台 (Admin Panel)
*   **功能**:
    *   **全局搜索**: 支持按域名或备案号实时检索。
    *   **批量操作**: 支持多选后一键隐藏、一键删除。
    *   **审核流**: 支持 `Pending` (待审核) 状态的通过与驳回。
    *   **即时编辑**: 在卡片内直接翻转编辑信息（含 Logo/快照/私钥）。

---

## 🚀 3. 部署指南 (Deployment)

本项目专为 **Cloudflare Pages** 设计。请严格按照以下步骤操作，**不需要**传统服务器。

### 第一步：Fork 仓库
点击右上角的 **Fork** 按钮，将本项目复制到你的 GitHub 账号下。

### 第二步：准备 Cloudflare D1 数据库
1.  安装 Wrangler CLI: `npm install -g wrangler`
2.  登录 Cloudflare: `wrangler login`
3.  创建数据库: `wrangler d1 create icp-db`
4.  **记录控制台输出的 `database_id`。**

### 第三步：配置 Cloudflare Pages
1.  登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create Application** -> **Pages** -> **Connect to Git**。
2.  选择你的仓库，配置如下：
    *   **Framework preset**: `Astro`
    *   **Build command**: `npm run build`
    *   **Output directory**: `dist`
3.  **设置环境变量 (Environment Variables)**:
    *   `ADMIN_PASSWORD`: 设置你的后台登录密码 (例如 `nebula-admin-888`)。

### 第四步：绑定数据库 & 初始化
1.  部署完成后（第一次可能会失败，不用管），进入项目 **Settings** -> **Functions**。
2.  找到 **D1 database bindings**。
3.  点击 **Add binding**：
    *   **Variable name**: `DB` (必须是大写 DB)
    *   **D1 database**: 选择你在命令行创建的 `icp-db`。
4.  **重新部署**: 进入 **Deployments** -> 找到最新一次 -> 点击 **Retry deployment**。
5.  **初始化表结构**: 在本地终端运行以下命令（将表结构推送到云端）：
    ```bash
    npx wrangler d1 execute icp-db --remote --file=./db/schema.sql
    ```

---

## 📖 4. 操作手册 (Operation Manual)

### 📝 用户端
*   **申请收录**: 访问首页 -> 填写信息 -> (可选)去选号大厅选号 -> 提交 -> 获取 HTML 代码与私钥。
*   **查询档案**: 访问 `/archives` -> 浏览或搜索。
*   **修改/注销**: 点击导航栏 `/// 修改` 或 `/// 注销` -> 输入域名、备案号、私钥 -> 验证通过后操作。

### 🛡️ 管理端
*   **登录**: 访问 `/admin` -> 输入环境变量中设置的密码。
*   **审核**: 在 `PENDING` 标签页查看待审核项目 -> 点击 `PASS` 或 `REJECT`。
*   **黑名单**: 在 `REJECTED` 标签页可点击 `UNBAN` 解除封禁。
*   **数据管理**: 可直接修改用户的 Logo、快照链接，甚至重置用户的私钥。

---

## 📊 5. 项目统计 (Statistics)

### ⭐ Stargazers over time
[![Stargazers over time](https://starchart.cc/C-4-C-4/NEBULA-ICP.svg?variant=adaptive)](https://starchart.cc/C-4-C-4/NEBULA-ICP)

### 🕵️ 访客统计 (Visitor Count)
<div align="center">
  <img src="https://count.getloli.com/get/@NEBULA-ICP?theme=rule34" alt="moe-counter" />
</div>

---

### ⚠️ 免责声明
本项目仅供学习与娱乐使用，生成的“备案号”无法律效力，请勿用于非法用途。美术风格致敬 Project Echo。

---

**SYSTEM.ADMIN // END_OF_FILE**