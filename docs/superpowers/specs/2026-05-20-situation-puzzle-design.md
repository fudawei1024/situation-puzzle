# 《海龟汤·境》Web 版技术设计规范

## 概述

基于设计文档《海龟汤·境交互革新版》，实现一个 Web 网页版的情境推理解谜游戏。玩家通过组合"关键词卡牌"向 AI 主持人提问，逐步还原离奇事件真相。

**目标**：完整 V1 版本，包含卡牌系统、对话区、推理板、揭晓仪式、自由输入模式、难度引导系统。

---

## 技术栈

| 层 | 技术 | 说明 |
|---|---|---|
| 前端框架 | React 18 + TypeScript | 应用骨架与状态管理 |
| 构建工具 | Vite | 开发/构建 |
| Canvas 渲染 | Pixi.js 8 + @pixi/react | 卡牌、推理板、动画 |
| 动画 | GSAP | 补间动画（光效、揭晓仪式） |
| 状态管理 | Zustand | 全局游戏状态 |
| DOM 样式 | Tailwind CSS | 对话区、输入框等 DOM 层 |
| 后端 | Node.js + Express + TypeScript | API 服务 |
| LLM | DeepSeek API（deepseek-chat） | 通过 openai npm 包调用 |

---

## 架构：混合渲染

Canvas（Pixi.js）处理游戏画面，DOM 处理文本密集区域。两层叠加。

```
┌───────────────────────────────────────┐
│  React App                            │
│  ┌─────────────────────────────────┐  │
│  │  Pixi.js Canvas Layer           │  │
│  │  - 主持人动画                    │  │
│  │  - 卡牌手牌区                    │  │
│  │  - 推理板（全屏模式）           │  │
│  │  - 揭晓仪式动画                 │  │
│  ├─────────────────────────────────┤  │
│  │  DOM Overlay Layer              │  │
│  │  - 对话聊天区                    │  │
│  │  - 问题预览 & 发送               │  │
│  │  - 自由输入框                    │  │
│  │  - 分类筛选标签                  │  │
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │  Express Backend                │  │
│  │  POST /api/judge     LLM 判定   │  │
│  │  POST /api/free-ask  自由提问   │  │
│  │  GET  /api/puzzles   谜题列表   │  │
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘
```

---

## 前端模块

### 1. 游戏引擎核心 `src/engine/`

- **GameState（Zustand store）**：全局状态机，管理阶段（首页→汤面展示→游戏进行→揭晓）、当前谜题、手牌、线索、对话历史、引导状态。
- **PuzzleManager**：加载谜题 JSON 配置。
- **CardRuleEngine**：卡牌组合 → 生成候选问句列表、判定兼容性（哪些动作卡可与当前要素卡组合）。

### 2. 卡牌系统 `src/components/cards/`

- **CardSprite**：Pixi.js 精灵。渲染卡牌正面：图标、名称文字、稀有度边框颜色（白/蓝/紫）、呼吸光效（GSAP 循环补间）。选中时金边亮起 + 放大上浮。
- **HandArea**：手牌区容器。横向排列 CardSprite，支持左右滑动（touch/mouse drag），当前选中卡片放大上浮。上方分类标签（全部/人物/物品/动机/行为）过滤显示。
- **QuestionSlot**：屏幕中下方的"问题槽"。左侧放要素卡、右侧放动作卡。接收点击或拖拽。两张卡牌就位后触发问句生成。
- **CardDeck（逻辑模块）**：手牌管理。初始发牌、回答"是"时解锁新卡牌、手牌上限（8-12）自动弃旧、动作卡冷却。

### 3. 对话系统 `src/components/dialogue/`

- **ChatArea**：DOM 渲染。聊天气泡列表，玩家问题右侧深色底，主持人回答左侧浅色底。"是"金色左标记、"否"灰色、"不重要"半透明。自动滚动到底部。
- **QuestionPreview**：DOM 条。实时显示当前卡牌组合生成的问句文字，右端发送按钮（纸飞机图标），左端撤销按钮。支持上下滑动切换同一组合的备选问句。
- **FreeInputMode**：点击键盘图标展开的 DOM 输入框 + 发送按钮。输入文字走后端 `/api/free-ask`。
- **HostCharacter**：Pixi.js 主持人半身像精灵。根据回答类型播放动画：点头（是）、摇头（否）、摊手（不重要）。背景图根据谜题氛围切换。

### 4. 推理板 `src/components/board/`

- **CorkBoard**：Pixi.js 全屏场景。深色软木板纹理 sprite 做背景。
- **ClueNote**：线索便签精灵。微黄方形，图钉装饰，手写体文字（使用位图字体或 Pixi.Text），随机倾斜角度。支持拖拽移动。两张拖到一起时自动形成虚线分组框。
- **RedString**：贝塞尔曲线 Graphics。从一个便签到另一个便签画红色棉线。点击线可删除。
- **HypothesisNote**：颜色不同的便签，玩家可输入简短推论文字（弹出 DOM 输入框）。
- **AutoLayout**：自动布局按钮，用力导向算法按时间/人物/因果链排列便签。
- **底部工具栏**：连线模式切换、新建假说、自动布局、删除、关闭按钮。

### 5. 揭晓仪式 `src/components/reveal/`

- **RevealCeremony**：全屏 Pixi.js 动画序列。画面渐黑 → 旧电影倒计时（精灵帧动画）→ 汤底文字打字机效果（逐字出现，关键句放大+重音音效）→ 背景微动画（粒子：雨/烛火/飘纸）。
- **DetectiveReport**：结案报告卡片。展示侦探评级（S/A/B/C）、提问次数、关键突破点。可截图分享。

### 6. 引导系统 `src/systems/`

- **DifficultyManager**：根据谜题难度配置初始手牌。简单→直接要素+稀有卡可见；困难→泛化要素、关键卡需解锁。
- **GuidanceSystem**：连续 3 次"不重要"→ 主持人追加引导语 + 卡牌高亮闪烁；重复相似提问→ 提醒换角度 + 已用卡牌置灰。
- **HintSystem**：卡牌提示（添加高价值稀有卡）、组合提示（预填高效组合）、线索揭示（自动生成线索便签）。MVP 阶段不做广告，直接提供按钮。

---

## 后端设计

### 目录结构

```
server/
├── index.ts                 Express 入口，CORS，端口 3001
├── routes/
│   ├── puzzle.ts            GET /api/puzzles, GET /api/puzzles/:id
│   ├── judge.ts             POST /api/judge
│   └── free-ask.ts          POST /api/free-ask
├── services/
│   ├── llm.ts               DeepSeek API 封装
│   └── game-session.ts      游戏会话管理（内存存储）
└── data/
    └── puzzles/             谜题 JSON 文件
```

### LLM 服务 (`server/services/llm.ts`)

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

interface JudgeResult {
  answer: 'yes' | 'no' | 'irrelevant';
  reply: string;        // 主持人性格化回复文案
  unlockCards?: string[]; // 解锁的新卡牌 ID
}
```

调用时组装 system prompt：包含汤面、汤底、已确认线索列表、主持人人设。要求 LLM 以 JSON 格式返回判定结果。

### POST /api/judge

请求体：`{ sessionId, puzzleId, cardCombo: [cardId1, cardId2], question: string }`

流程：
1. 从会话中取出谜题上下文和历史
2. 组装 prompt → 调用 DeepSeek
3. 解析返回的 JSON（answer + reply + unlockCards）
4. 更新会话历史
5. 返回结果

### POST /api/free-ask

请求体：`{ sessionId, puzzleId, question: string }`

流程同上，但 prompt 额外包含"将玩家自由文本理解为推理提问"的指令。

---

## 谜题数据结构

```typescript
interface Puzzle {
  id: string;
  name: string;
  surface: string;                // 汤面
  truth: string;                  // 汤底完整故事
  coreTruth: string;              // 核心谜底一句话
  atmosphere: string;             // 氛围背景 ID
  difficulty: 'easy' | 'medium' | 'hard';
  initialCards: string[];         // 初始手牌 ID 列表
  cardAnswerMap: Record<string, 'yes' | 'no' | 'irrelevant'>;
  unlockRules: Record<string, string[]>;
  distractors: string[];
  revealBgm?: string;
}
```

V1 内置 1-2 个示例谜题，验证全流程。

---

## 全局卡牌库

约 30-50 张通用卡牌（V1 精简版），分为要素卡和动作卡两大类：

- **要素卡**：死者、嫌疑人、发现者、目击者、朋友、家人、案发现场、附近、凶器、遗留物、信件、电话、衣物
- **动作卡**：认识？、亲密？、敌对？、做了什么？、计划？、掩盖？、金钱、情感、复仇、意外、保护、死亡原因、死亡方式、心理状态、谎言
- **特殊卡**：为什么（每局限 3 次）、验证猜想

每张卡牌包含：id、名称、大类、子类、稀有度、颜色、图标 key、问句模板列表。

---

## 项目目录结构

```
situation-puzzle/
├── client/                      前端
│   ├── src/
│   │   ├── main.tsx             入口
│   │   ├── App.tsx              根组件：路由 + Canvas/DOM 层叠
│   │   ├── engine/
│   │   │   ├── gameStore.ts     Zustand store
│   │   │   ├── puzzleManager.ts
│   │   │   └── cardRuleEngine.ts
│   │   ├── components/
│   │   │   ├── cards/
│   │   │   │   ├── CardSprite.tsx
│   │   │   │   ├── HandArea.tsx
│   │   │   │   └── QuestionSlot.tsx
│   │   │   ├── dialogue/
│   │   │   │   ├── ChatArea.tsx
│   │   │   │   ├── QuestionPreview.tsx
│   │   │   │   ├── FreeInputMode.tsx
│   │   │   │   └── HostCharacter.tsx
│   │   │   ├── board/
│   │   │   │   ├── CorkBoard.tsx
│   │   │   │   ├── ClueNote.tsx
│   │   │   │   ├── RedString.tsx
│   │   │   │   └── HypothesisNote.tsx
│   │   │   ├── reveal/
│   │   │   │   ├── RevealCeremony.tsx
│   │   │   │   └── DetectiveReport.tsx
│   │   │   └── ui/
│   │   │       ├── TopBar.tsx
│   │   │       └── GameScreen.tsx
│   │   ├── systems/
│   │   │   ├── difficultyManager.ts
│   │   │   ├── guidanceSystem.ts
│   │   │   └── hintSystem.ts
│   │   ├── data/
│   │   │   ├── cards.ts         卡牌库定义
│   │   │   └── cardTemplates.ts 问句模板
│   │   ├── types/
│   │   │   └── index.ts         共享类型
│   │   └── assets/              图片、字体、音效
│   ├── index.html
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── package.json
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── services/
│   │   └── data/puzzles/
│   ├── tsconfig.json
│   └── package.json
├── 海龟汤游戏设计.md
└── README.md
```

---

## 竖屏布局（主游戏界面）

以 375x812（iPhone X 比例）为基准设计：

| 区域 | 占比 | 渲染方式 |
|------|------|----------|
| 顶栏（谜题名+推理板入口） | 44px 固定 | DOM |
| 主持人形象 | 25% 屏高 | Pixi.js Canvas |
| 对话历史区 | 40% 屏高 | DOM（可滚动） |
| 问题预览条 | 40px 固定 | DOM |
| 卡牌手牌区 | 剩余空间（~100px） | Pixi.js Canvas |

---

## V1 不做的功能

- 广告/激励视频（提示系统保留按钮，但不接广告 SDK）
- 社交裂变（分享、好友对战、卡牌交易所）
- 沉浸式场景模式（高级谜题的可点击插画）
- 语音输入
- 多谜题商店/DLC
- 数据埋点上报

这些留到后续版本迭代。
