# 海龟汤·境 — 关键词卡牌推理游戏

一款无需打字的情境推理解谜游戏。玩家通过组合"关键词卡牌"向 AI 主持人提问，逐步还原离奇事件的真相。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS |
| 游戏渲染 | Pixi.js 8 + GSAP |
| 状态管理 | Zustand |
| 后端 | Node.js + Express + TypeScript |
| AI | DeepSeek API (deepseek-chat) |

## 快速开始

### 1. 安装依赖

```bash
# 前端
cd client && npm install

# 后端
cd server && npm install
```

### 2. 配置环境变量

```bash
cd server
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key
```

### 3. 启动开发服务器

```bash
# 终端 1：启动后端（端口 3001）
cd server && npm run dev

# 终端 2：启动前端（端口 5173）
cd client && npm run dev
```

### 4. 打开浏览器

访问 http://localhost:5173

## 项目结构

```
situation-puzzle/
├── client/                  前端 React 应用
│   └── src/
│       ├── engine/          游戏引擎（状态管理、规则引擎、API）
│       ├── components/
│       │   ├── cards/       卡牌系统 UI
│       │   ├── dialogue/    对话系统（聊天区、问题预览、自由输入）
│       │   ├── board/       推理板（线索便签、红线连接、假说）
│       │   ├── reveal/      揭晓仪式 + 结案报告
│       │   └── ui/          通用 UI（首页、汤面展示、游戏主屏）
│       ├── systems/         引导系统、提示系统、评级系统
│       ├── data/            卡牌库、问句模板
│       └── types/           TypeScript 类型定义
├── server/                  后端 Express 服务
│   └── src/
│       ├── routes/          API 路由（judge、free-ask、puzzles）
│       ├── services/        DeepSeek LLM 服务、游戏会话管理
│       └── data/puzzles/    谜题 JSON 配置
└── docs/                    设计文档
```

## 核心功能

- **卡牌组合提问**：选择要素卡 + 动作卡，自动生成问句
- **AI 主持人**：基于 DeepSeek LLM 判定回答（是/否/不重要）
- **推理板**：线索便签拖拽、红线连接、假说记录
- **揭晓仪式**：动画揭晓 + 侦探评级（S/A/B/C）
- **自由输入**：支持文字自由提问
- **智能引导**：连续无效提问后自动提示

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/puzzles | 获取谜题列表 |
| GET | /api/puzzles/:id | 获取谜题详情（不含答案） |
| POST | /api/judge | 卡牌组合提问判定 |
| POST | /api/free-ask | 自由文字提问判定 |
