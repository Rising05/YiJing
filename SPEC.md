# 忆境 MemoryPalace 产品与工程规格说明

版本：v0.1  
状态：需求访谈后初稿  
最后更新：2026-07-03  
项目路径：`/Users/rising/Documents/忆境`  

## 1. 项目摘要

忆境 MemoryPalace 是一个面向中小学生和大学生的 AI 记忆辅助 App。用户输入背诵文本、古文诗词或英语单词/短语后，系统自动生成适合记忆的结构化图像结果：文本记忆宫殿或单词记忆卡片。

本项目不是普通 AI 生图工具。它的核心价值是把学习内容拆解为可记忆、可复习、可导出的视觉结构。

核心流程：

1. 用户注册/登录。
2. 用户选择文本记忆宫殿或单词记忆卡片。
3. 用户输入内容。
4. 后端做基础内容安全检查。
5. LLM 拆分记忆点并输出严格 JSON。
6. 后端校验模板、锚点、字段和内容合法性。
7. 通义万相生成无文字背景图。
8. 前端叠加轻量编号/标记，详细解释放在下方或详情页。
9. 生成结果自动保存到历史。
10. 用户可导出带 App 小水印的 PNG。

## 2. 访谈结论

### 2.1 已确认

- 目标用户：中小学生、大学生。
- MVP 核心功能：文本背诵、古文诗词背诵、英语单词/短语记忆。
- 首页结构：两个主要入口，分别是“文本记忆宫殿”和“单词记忆卡片”。
- 项目名称：`忆境 MemoryPalace` 暂定。
- 第一版目标：完整主流程能跑通。
- 结果图导出 PNG：必须支持。
- 用户编辑生成结果：MVP 不做，但预留。
- AI 目标能力：LLM + 通义万相真实接入。
- 当前 API Key：暂无，因此开发阶段必须提供 mock/占位方案。
- 历史记录：后端数据库保存，使用 MySQL。
- 登录：产品要求手机号 + 微信登录；MVP 用测试手机号 + 固定验证码跑通。
- 未登录生成：弹出登录弹窗；必须登录后才能生成。
- 删除账号：首版需要真实删除测试账号和历史数据。
- 清除缓存：首版可用，清除本地缓存。
- 文本输入上限：500 字。
- 文本类型优先：古文诗词、现代文背诵。
- 记忆点数量：根据文本长度自动调整。
- 古文谐音联想：可以有趣一点，但要服务背诵。
- 单词一次最多 30 个，支持英文短语。
- 单词卡片图上必须显示：英文、词性。
- 视觉方向：iOS Liquid Glass 透明玻璃感。
- Liquid Glass 实现：优先直接安装并使用 `liquid-glass-react`。
- 深色模式：首版暂不做，预留。
- 导出比例：支持 `1:1` 和 `9:16`。
- 图片标注：尽量少遮挡画面，图上轻量标注，下方列表解释为主。
- 模板：保留 10 个通用空间模板。
- 文本场景：默认 AI 自动选择，高级选项可手动选择。
- 单词场景：AI 自动判断主题和模板。
- 超过模板容量：提示用户减少输入，不自动截断、不自动分页。
- 平台优先级：先 iOS。
- 合规页：首版不要求完整入口，但需要基础文案与预留位置。
- 合规文案：先写可替换草稿。
- AI 免责声明：必须有。
- 包管理器：npm。
- 前端技术：React + Vite + TypeScript + Tailwind CSS + Capacitor。
- 后端技术：NestJS + Prisma + MySQL。
- 生成次数/积分：预留。
- 重新生成：需要重新消耗次数。
- 生成失败：用户手动重试。
- 生成结果：自动保存历史。
- 导出图：加小水印或 App 名。
- 内容安全：MVP 做基础拦截。
- 图片限制：不要宗教/政治符号，不违反中国大陆法律法规。
- 背景图保存：默认保存 30 天，用户可手动删除。
- 导出 PNG：本地生成，分享/保存时生成，不上传服务器。
- Prompt/模型原始 JSON：开发环境保存，生产环境脱敏保存。
- 用户原始输入：保存数据库，方便历史查看。
- 第一版风格：简洁，主流程优先，不做复杂扩展。

### 2.2 第一版明确不做

- 不做社区、排行榜、公开分享广场。
- 不做复杂会员、支付、订阅。
- 不接广告 SDK。
- 不做聊天机器人。
- 不做真人头像生成。
- 不做结果手动编辑，但预留数据结构和入口。
- 不默认申请定位、通讯录、麦克风权限。
- 不在用户登录/同意前采集非必要设备信息。
- 不自动分页生成多张图。
- 不自动忽略超量内容。

## 3. 多 Agent 分工规范

本 SPEC 供多个 agent 协作使用。每个模块必须在提交时标注负责人和完成状态。

推荐提交标记：

```md
Owner: Agent-Frontend
Status: Not Started | In Progress | Blocked | Done
Evidence: 运行命令、截图、测试结果、关键文件路径
```

### 3.1 Agent 角色

| Agent | 责任范围 | 禁止事项 |
| --- | --- | --- |
| Agent-Product | 需求澄清、SPEC 维护、验收标准 | 不直接改核心业务代码 |
| Agent-Frontend | React/Vite/Capacitor、UI、导出、动效 | 不把 AI Key 写进前端 |
| Agent-Backend | NestJS、Prisma、MySQL、登录、历史、账号删除 | 不跳过 DTO 校验和统一错误 |
| Agent-AI | LLM Prompt、JSON schema、通义万相、内容安全、OSS | 不让生图模型生成文字 |
| Agent-QA | 主流程测试、移动端适配、导出验证、回归测试 | 不修改需求范围 |
| Agent-Release | iOS Capacitor、配置、图标、启动页、合规检查 | 不接入无关 SDK |

### 3.2 完成定义

每个功能完成必须同时满足：

1. 代码实现完成。
2. TypeScript 无明显类型错误。
3. 本地运行命令可执行。
4. 主流程不被破坏。
5. 有最小测试或手动验证记录。
6. 涉及用户数据时符合隐私和删除要求。
7. 涉及 AI 时经过结构化校验和错误处理。

## 4. 项目实时进度台账

本章节用于记录项目实时完成情况。任何 agent 完成一部分工作后，必须更新对应表格或追加日志。不要只在聊天里说完成，必须把结果写回本文档。

### 4.1 总体状态

| 项目 | 当前状态 | 当前负责人 | 最近更新时间 | 证据/备注 |
| --- | --- | --- | --- | --- |
| SPEC 文档 | Done | Agent-Product | 2026-07-03 | 初稿已创建，已补充进度台账 |
| Phase 1 前端 Mock 闭环 | Not Started | Agent-Frontend | - | - |
| Phase 2 后端 Mock + MySQL | Not Started | Agent-Backend | - | - |
| Phase 3 LLM 接入 | Not Started | Agent-AI | - | - |
| Phase 4 通义万相 + 图片存储 | Not Started | Agent-AI | - | - |
| Phase 5 iOS 优先打包 | Not Started | Agent-Release | - | - |
| QA 回归验收 | Not Started | Agent-QA | - | - |

状态枚举：

- `Not Started`：未开始。
- `In Progress`：正在做。
- `Blocked`：被外部依赖阻塞。
- `Ready for QA`：已实现，等待测试。
- `Done`：已通过验收。

### 4.2 模块完成记录

| 模块 | Owner | Status | 完成内容 | 变更文件 | 验证方式 | 更新时间 |
| --- | --- | --- | --- | --- | --- | --- |
| 需求访谈整理 | Agent-Product | Done | 整理用户访谈结论并写入 SPEC | `SPEC.md` | 人工检查 | 2026-07-03 |
| 进度台账 | Agent-Product | Done | 增加实时完成情况记录区 | `SPEC.md` | 人工检查 | 2026-07-03 |

追加记录模板：

```md
#### YYYY-MM-DD HH:mm - 模块名称

Owner: Agent-Name  
Status: Done | In Progress | Blocked | Ready for QA  
Changed Files:
- `path/to/file`

Verification:
- `npm run dev`
- `npm run build`
- 手动验证：说明具体操作和结果

Notes:
- 记录重要决策、遗留问题或下一步。
```

### 4.3 阻塞项

| 阻塞项 | 影响范围 | 需要谁处理 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 真实 AI API Key 暂无 | Phase 3、Phase 4 | 用户/Agent-AI | Open | 开发阶段必须保留 mock 模式 |
| 短信服务商未确定 | 真实手机号登录 | 用户/Agent-Backend | Open | MVP 用固定测试验证码 |
| 微信开放平台应用未配置 | 微信登录 | 用户/Agent-Backend | Open | MVP 只预留 |
| 正式 App 名称未确认 | iOS 发布、品牌资产 | 用户/Agent-Release | Open | 当前使用暂定名“忆境 MemoryPalace” |

### 4.4 决策记录

| 日期 | 决策 | 原因 | 影响 |
| --- | --- | --- | --- |
| 2026-07-03 | 单词空白模板从 `blank_word_card_20` 调整为 `blank_word_card_30` | 用户确认单次最多 30 个单词/短语 | 模板、校验和 UI 限制需一致 |
| 2026-07-03 | MVP 用测试手机号 + 固定验证码 | 暂无短信服务商和微信开放平台配置 | 可先跑通登录后生成流程 |
| 2026-07-03 | 导出 PNG 本地生成，不上传服务器 | 用户确认导出图只在分享/保存时生成 | 降低存储成本和隐私风险 |

## 5. MVP 阶段规划

### Phase 0：规格冻结

Owner: Agent-Product  
目标：完成本 `SPEC.md`，作为后续实现依据。  
本阶段不写业务代码。

交付物：

- `SPEC.md`

完成标准：

- 文档包含产品目标、功能范围、技术架构、数据结构、API、页面、验收标准、分工规则。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Done | Agent-Product | 2026-07-03 | `SPEC.md` 初稿已创建，进度台账已加入 |

### Phase 1：前端 Mock 闭环

Owner: Agent-Frontend  
目标：即使没有 API Key 和后端，也能跑通输入、生成中、结果、导出、历史详情的体验。

范围：

- 创建 monorepo 基础结构。
- 创建 `apps/mobile`。
- React + Vite + TypeScript + Tailwind + Capacitor。
- 安装并使用 `liquid-glass-react`。
- 首页两个入口。
- 文本记忆输入页。
- 单词卡片输入页。
- 登录弹窗，使用测试手机号 + 固定验证码模拟登录。
- 生成中页面/状态。
- mock 结果页。
- 轻量编号叠加。
- 下方详情列表。
- PNG 导出，支持 `1:1` 和 `9:16`。
- 导出图带小水印。
- localStorage 临时缓存。
- 清除缓存可用。

注意：Phase 1 可以暂时用 mock 历史，本地缓存只作为前端开发体验；最终历史以 MySQL 为准。

完成标准：

- `npm install` 成功。
- `npm run dev` 成功。
- 未登录点击生成弹出登录弹窗。
- 测试手机号和固定验证码登录后可以生成。
- 文本和单词两个功能都能进入结果页。
- 结果页可以导出 PNG。
- 导出 PNG 包含背景、轻量标注、水印。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Not Started | Agent-Frontend | - | - |

### Phase 2：后端 Mock + MySQL

Owner: Agent-Backend  
目标：实现真实后端结构、数据库保存、测试账号、历史记录、删除账号。

范围：

- 创建 `apps/server`。
- NestJS + TypeScript。
- Prisma + MySQL。
- CORS。
- DTO 校验。
- 统一错误格式。
- 测试手机号 + 固定验证码登录。
- JWT 或 session token。
- 生成接口返回 mock 结果。
- 生成结果保存 MySQL。
- 历史列表、详情、收藏、删除。
- 删除账号：删除用户、历史记录、相关生成记录。
- 图片过期字段：默认 30 天。

完成标准：

- 后端可本地启动。
- Prisma schema 可 migrate。
- 前端可请求后端 mock API。
- 登录后才能生成。
- 生成结果自动保存到数据库。
- 删除账号后该用户历史不可再查到。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Not Started | Agent-Backend | - | - |

### Phase 3：LLM 接入

Owner: Agent-AI  
目标：接入 OpenAI-compatible LLM，支持 Qwen / DeepSeek / OpenAI 兼容地址。

范围：

- 所有 API Key 仅在后端 `.env`。
- 前端不得直接请求模型。
- TextMemory Prompt。
- WordCard Prompt。
- 严格 JSON 输出。
- JSON 解析失败时允许重试。
- anchorKey 校验。
- 模板容量校验。
- 字段完整性校验。
- 基础内容安全拦截。
- 开发环境保存 prompt 和原始 JSON。
- 生产环境脱敏保存。

完成标准：

- 无 API Key 时后端可切换 mock。
- 有 API Key 时可生成真实结构化结果。
- 非 JSON 或 schema 错误不会导致服务崩溃。
- 超过模板容量时返回明确错误。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Not Started | Agent-AI | - | - |

### Phase 4：通义万相 + 图片存储

Owner: Agent-AI  
目标：根据结构化结果生成无文字背景图并保存。

范围：

- 通义万相作为默认生图服务。
- Prompt 明确禁止文字、数字、标签、水印、UI。
- 图片风格遵守中国大陆法律法规。
- 禁止宗教/政治符号。
- 保存背景图，默认有效期 30 天。
- 图片存储优先阿里云 OSS，也可根据成本改为兼容 S3 的国内对象存储。
- 数据库记录 `expiresAt`。

完成标准：

- 生图失败返回可重试错误。
- 生成图不承载文字信息。
- 前端叠加层仍由前端负责。
- 历史详情可查看背景图。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Not Started | Agent-AI | - | - |

### Phase 5：iOS 优先打包

Owner: Agent-Release  
目标：Capacitor iOS 可运行。

范围：

- Capacitor 初始化。
- iOS 项目生成。
- App 名称暂定“忆境”。
- 图标、启动页占位。
- Safe area 适配。
- Web 下载和系统分享/保存能力预留。
- App 版本号展示。

完成标准：

- iOS 模拟器可启动。
- 主流程可跑通。
- 页面底部不被系统手势遮挡。
- 不申请不必要权限。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Not Started | Agent-Release | - | - |

## 6. 产品信息架构

### 6.1 一级页面

| 页面 | 路由建议 | Owner | 说明 |
| --- | --- | --- | --- |
| 首页 | `/` | Agent-Frontend | 两个主入口，最近历史摘要 |
| 文本记忆宫殿 | `/text-memory` | Agent-Frontend | 文本输入与高级设置 |
| 单词记忆卡片 | `/word-card` | Agent-Frontend | 单词/短语输入 |
| 生成结果 | `/result/:id` | Agent-Frontend | 图片、标注、解释、导出 |
| 历史 | `/history` | Agent-Frontend | 登录用户历史记录 |
| 详情 | `/detail/:id` | Agent-Frontend | 单条历史详情 |
| 设置 | `/settings` | Agent-Frontend | 账号、缓存、协议、版本 |
| 隐私政策 | `/privacy` | Agent-Frontend | 可替换草稿 |
| 用户协议 | `/terms` | Agent-Frontend | 可替换草稿 |
| 关于我们 | `/about` | Agent-Frontend | App 信息和免责声明 |

### 6.2 首页

首页必须移动端优先，使用 Liquid Glass 风格。

内容：

- 顶部欢迎语：`今天要记什么？`
- 副标题：`把难背的内容变成一张能看懂的记忆图`
- 主入口 1：文本记忆宫殿
- 主入口 2：单词记忆卡片
- 最近生成历史摘要
- 登录状态入口

交互：

- 未登录点击任一生成入口可进入输入页。
- 未登录在输入页点击“生成”时弹出登录弹窗。
- 登录成功后继续当前生成操作。

### 6.3 文本记忆宫殿页

输入限制：

- 最大 500 字。
- 为空不能生成。
- 超过 500 字提示用户缩短。

内容类型：

- 自动判断
- 古文/诗词
- 现代文

高级设置：

- 默认收起。
- 场景偏好：
  - 自动选择
  - 书房
  - 教室
  - 古风小屋
  - 宫殿大厅
  - 街道路线
  - 博物馆展厅
- 记忆点数量：自动。

记忆点数量规则建议：

- 1-120 字：3-5 个点。
- 121-280 字：5-8 个点。
- 281-500 字：8-12 个点。

### 6.4 单词记忆卡片页

输入方式：

- 一行一个词。
- 逗号分隔。
- 支持短语，例如 `boarding gate`。
- 自动 trim。
- 自动去重，大小写不敏感。

限制：

- 最多 30 个单词/短语。
- 超过后阻止生成并提示减少输入。

图上显示：

- 英文。
- 词性。

详情显示：

- 英文。
- 词性。
- 中文释义。
- 音标。
- 简短例句。
- 记忆提示。
- 视觉物体。

### 6.5 生成结果页

结果页必须包含：

- 顶部图片区域。
- 背景图。
- 轻量编号或点位标记。
- 尽量不遮挡画面。
- 下方解释列表。
- 操作栏：
  - 导出 PNG
  - 重新生成
  - 分享/保存
  - 查看详情

导出要求：

- 支持 `1:1`。
- 支持 `9:16`。
- 带小水印：`忆境 MemoryPalace`。
- 导出图本地生成，不上传服务器。

### 6.6 登录弹窗

MVP 登录方式：

- 测试手机号。
- 固定验证码。

建议默认：

- 测试手机号：`13800000000`
- 固定验证码：`123456`

文案：

- 标题：`登录后开始生成`
- 说明：`生成结果会自动保存到你的历史记录。`

后续真实能力：

- 手机号短信登录。
- 微信移动 App 登录。

## 7. 视觉与交互规范

### 7.1 设计方向

整体采用 iOS Liquid Glass 透明玻璃感。界面应简洁、轻盈、学习工具导向，不做夸张营销页。

必须使用：

- `liquid-glass-react` 作为核心玻璃效果组件。
- Tailwind CSS 管理布局和常规样式。
- Framer Motion 做页面进入、卡片轻微动效。

注意：

- `liquid-glass-react` 在部分浏览器和 WebView 中可能有能力差异。必须预留 CSS 玻璃拟态降级样式。
- 移动端按钮高度不低于 44px。
- 适配 `safe-area-inset-bottom`。
- 深色模式首版不做，但颜色变量要预留。

### 7.2 标注原则

结果图上不要堆满文字。默认只显示：

- 小编号。
- 极短点位标记。
- 必要时显示轻量高亮。

详细解释放在图片下方列表或详情页。

### 7.3 禁止的视觉内容

- 不要宗教符号。
- 不要政治符号。
- 不要违反中国大陆法律法规的元素。
- 不要让生图模型生成中文、英文、数字、标签、水印或 UI。
- 不要生成恐怖、血腥、低俗内容。

## 8. 技术架构

### 8.1 Monorepo 结构

```txt
memory-palace-app/
├── apps/
│   ├── mobile/
│   └── server/
├── packages/
│   ├── shared/
│   └── prompts/
├── SPEC.md
├── README.md
├── docker-compose.yml
└── package.json
```

### 8.2 前端技术

- React
- TypeScript
- Vite
- Capacitor
- React Router
- Zustand
- Tailwind CSS
- Framer Motion
- liquid-glass-react
- html-to-image 或 dom-to-image-more

### 8.3 后端技术

- Node.js
- NestJS
- TypeScript
- Prisma
- MySQL
- OpenAI-compatible LLM client
- 通义万相 API client
- 阿里云 OSS 或兼容国内对象存储

### 8.4 配置原则

- API Key 只能放在后端 `.env`。
- 前端不得出现 LLM、生图、OSS 密钥。
- 所有环境变量都要在 `.env.example` 中列出。
- 无真实 Key 时必须支持 mock 模式。

## 9. 核心数据类型

Owner: Agent-Frontend + Agent-Backend + Agent-AI  
所有共享类型应放入 `packages/shared`，前后端共同引用或保持同构。

```ts
export type ContentType =
  | 'auto'
  | 'ancient_text'
  | 'modern_text'
  | 'vocabulary'

export type MemoryMethod =
  | 'meaning'
  | 'homophone'
  | 'glyph'
  | 'action'
  | 'emotion'
  | 'logic'
  | 'mixed'

export interface Anchor {
  key: string
  name: string
  description: string
  x: number
  y: number
}

export interface MemoryTemplate {
  id: string
  name: string
  category:
    | 'general'
    | 'ancient'
    | 'modern'
    | 'vocabulary'
    | 'academic'
    | 'process'
  scenePrompt: string
  bestFor: ContentType[]
  anchors: Anchor[]
  routePattern:
    | 'clockwise'
    | 'left_to_right'
    | 'top_to_bottom'
    | 'path'
    | 'center_out'
  maxPoints: number
}

export interface TextMemoryRequest {
  inputText: string
  contentType: 'auto' | 'ancient_text' | 'modern_text'
  scenePreference:
    | 'auto'
    | 'study_room'
    | 'classroom'
    | 'ancient_cottage'
    | 'palace_hall'
    | 'street_path'
    | 'museum_gallery'
}

export interface MemoryPoint {
  id: number
  originalText: string
  keyword: string
  memoryMethod: MemoryMethod
  visualObject: string
  reason: string
  anchorKey: string
  position: {
    x: number
    y: number
  }
  label: string
}

export interface MemoryPalaceResult {
  id: string
  title: string
  type: 'text-memory'
  contentType: 'ancient_text' | 'modern_text'
  templateId: string
  backgroundImageUrl: string
  points: MemoryPoint[]
  explanation: string
  recitationHint: string
  imagePrompt: string
  watermarkText: string
  createdAt: string
  expiresAt: string
}

export interface WordCardRequest {
  words: string[]
  theme: 'auto'
  cardMode: 'scene' | 'association' | 'simple'
}

export interface WordPoint {
  id: number
  word: string
  partOfSpeech: string
  phonetic?: string
  chinese?: string
  example?: string
  wordType: 'concrete' | 'abstract' | 'action' | 'emotion' | 'scene'
  visualObject: string
  memoryHint?: string
  anchorKey: string
  position: {
    x: number
    y: number
  }
}

export interface WordCardResult {
  id: string
  title: string
  type: 'word-card'
  templateId: string
  backgroundImageUrl: string
  words: WordPoint[]
  imagePrompt: string
  watermarkText: string
  createdAt: string
  expiresAt: string
}
```

## 10. 模板系统

Owner: Agent-Frontend + Agent-AI

模板只提供通用空间骨架，不为某篇课文或某组单词写死内容。

### 10.1 MVP 模板

| id | 名称 | 容量 | 适合 |
| --- | --- | --- | --- |
| `study_room_9` | 书房九点模板 | 9 | 现代文、学习内容 |
| `classroom_9` | 教室九点模板 | 9 | 学校内容、单词 |
| `ancient_cottage_9` | 古风小屋九点模板 | 9 | 古文、诗词 |
| `palace_hall_12` | 宫殿大厅十二点模板 | 12 | 长古文、正式内容 |
| `street_path_8` | 街道路线模板 | 8 | 顺序、故事、现代文 |
| `museum_gallery_12` | 博物馆展厅模板 | 12 | 分类、混合内容 |
| `airport_15` | 机场模板 | 15 | 机场、旅行单词 |
| `restaurant_12` | 餐厅模板 | 12 | 食物、生活单词 |
| `campus_12` | 校园模板 | 12 | 校园、学习单词 |
| `blank_word_card_30` | 空白信息卡模板 | 30 | 大量单词/短语 |

说明：原始提示词中是 `blank_word_card_20`。根据访谈确认单词最多 30 个，因此 MVP 应改为 `blank_word_card_30`，否则容量规则会冲突。

### 10.2 容量规则

- 文本记忆超过当前模板容量时，后端可自动选择更大模板。
- 单词数量超过 30 时，直接提示用户减少输入。
- 单词数量超过所选场景模板容量时：
  - AI 可选择 `blank_word_card_30`。
  - 如果用户强制某场景且容量不足，则提示减少输入。

### 10.3 Anchor 规则

- `anchorKey` 必须来自模板。
- 不允许重复使用 `anchorKey`。
- `position.x` 和 `position.y` 必须在 0 到 1。
- 相邻点位应尽量形成视觉路线。
- 前端只根据 `position` 渲染，不推断业务含义。

## 11. AI 规则

Owner: Agent-AI

### 11.1 文本记忆规则

文本记忆首版只覆盖：

- 古文/诗词
- 现代文背诵

古文/诗词：

- 可以使用有趣谐音。
- 优先服务背诵，不做无意义笑点。
- 可使用原意、谐音、字形、动作、情绪、逻辑、混合方法。

现代文：

- 提取人物、地点、景物、动作、情绪、主题、转折、顺序。
- 优先把句子变成画面线索。

### 11.2 单词规则

- 支持英文单词和短语。
- 图上只强制显示英文和词性。
- 中文、音标、例句、记忆提示放详情。
- 具体词优先画实物。
- 抽象词用动作、情绪、对比、场景表达。

### 11.3 生图 Prompt 禁令

每个生图 Prompt 必须包含：

```txt
no text, no Chinese characters, no English letters, no numbers, no labels, no watermark, no UI elements
```

中文约束：

```txt
不要出现文字、数字、标签、水印、界面元素、宗教符号、政治符号。
```

### 11.4 内容安全

MVP 必须做基础拦截：

- 色情低俗。
- 血腥暴力。
- 自伤自杀。
- 违法犯罪。
- 宗教政治符号生成请求。
- 明显违反中国大陆法律法规的内容。

拦截时返回统一错误：

```json
{
  "code": "CONTENT_BLOCKED",
  "message": "该内容暂不支持生成，请更换学习内容。"
}
```

## 12. 后端 API

Owner: Agent-Backend

所有生成接口必须登录后访问。

### 12.1 Auth

#### POST `/api/auth/test-login`

MVP 测试登录。

请求：

```json
{
  "phone": "13800000000",
  "code": "123456"
}
```

响应：

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "nickname": "测试用户",
    "phone": "13800000000"
  }
}
```

#### DELETE `/api/user/me`

删除账号和历史数据。

要求：

- 删除用户。
- 删除生成记录。
- 删除 AI 日志或脱敏保留。
- 图片对象可异步删除或标记删除。

### 12.2 Generation

#### POST `/api/generation/text-memory`

请求：

```json
{
  "inputText": "道可道，非常道；名可名，非常名。",
  "contentType": "auto",
  "scenePreference": "auto"
}
```

响应：`MemoryPalaceResult`

#### POST `/api/generation/word-card`

请求：

```json
{
  "words": ["passport", "boarding gate"],
  "theme": "auto",
  "cardMode": "scene"
}
```

响应：`WordCardResult`

#### POST `/api/generation/:id/regenerate`

重新生成。

要求：

- 需要登录。
- 需要消耗次数。
- 生成新记录，不覆盖旧记录。

### 12.3 History

#### GET `/api/history`

返回当前登录用户历史。

#### GET `/api/history/:id`

返回详情。

#### DELETE `/api/history/:id`

删除单条历史。

#### PATCH `/api/history/:id/favorite`

切换收藏。

### 12.4 Cache

清除缓存主要由前端清理本地缓存。后端不需要提供清缓存接口，除非后续加入服务端缓存。

## 13. 数据库设计

Owner: Agent-Backend

### 13.1 User

字段：

- `id`
- `nickname`
- `phone`
- `wechatOpenId`
- `wechatUnionId`
- `avatarUrl`
- `createdAt`
- `updatedAt`
- `deletedAt`

MVP：

- `phone` 使用测试手机号。
- 微信字段预留。

### 13.2 GenerationRecord

字段：

- `id`
- `userId`
- `type`: `text-memory` 或 `word-card`
- `title`
- `contentType`
- `inputText`
- `inputWords` JSON
- `templateId`
- `backgroundImageUrl`
- `resultJson` JSON
- `imagePrompt`
- `promptUsed`
- `isFavorite`
- `createdAt`
- `updatedAt`
- `expiresAt`
- `deletedAt`

规则：

- 必须属于用户。
- 默认 `expiresAt = createdAt + 30 days`。
- 用户手动删除时设置 `deletedAt` 或硬删除，具体由 Agent-Backend 决定，但删除账号必须不可再查到。

### 13.3 AiUsageLog

字段：

- `id`
- `userId`
- `recordId`
- `provider`
- `model`
- `inputTokens`
- `outputTokens`
- `imageCount`
- `costEstimate`
- `status`
- `errorMessage`
- `rawPrompt`
- `rawResponse`
- `createdAt`

规则：

- 开发环境可保存 `rawPrompt` 和 `rawResponse`。
- 生产环境必须脱敏或不保存敏感原文。

### 13.4 UserQuota

预留字段：

- `id`
- `userId`
- `remainingCredits`
- `usedCredits`
- `createdAt`
- `updatedAt`

MVP 可先不启用真实扣费，但重新生成应走同一扣减入口或预留服务。

## 14. 前端组件规格

Owner: Agent-Frontend

### 14.1 LiquidGlassCard

职责：

- 封装 `liquid-glass-react`。
- 提供 CSS 降级。

Props：

- `children`
- `className`
- `interactive`
- `opacity`
- `blur`

完成标准：

- iOS Safari/WebView 不支持部分效果时仍可读、可点。

### 14.2 GlassButton

Props：

- `children`
- `onClick`
- `loading`
- `disabled`
- `variant`: `primary | secondary | ghost`

要求：

- 高度不低于 44px。
- loading 防重复提交。

### 14.3 AuthModal

职责：

- 未登录生成时弹出。
- 测试手机号 + 固定验证码登录。

完成标准：

- 登录成功后关闭弹窗并继续原操作。

### 14.4 MemoryPalaceCanvas

职责：

- 渲染背景图。
- 渲染轻量点位。
- 不在图上显示长解释。
- 支持选中点位。
- 支持导出节点引用。

### 14.5 WordMemoryCard

职责：

- 渲染单词背景图。
- 图上显示英文 + 词性。
- 下方显示详情。

### 14.6 ExportImageButton

职责：

- 支持 `1:1` 和 `9:16`。
- 导出 PNG。
- 添加小水印。
- 移动 Web 可下载；Capacitor 保存相册后续预留。

## 15. 错误处理

Owner: Agent-Backend + Agent-Frontend

统一错误格式：

```json
{
  "code": "ERROR_CODE",
  "message": "用户可读错误信息",
  "details": {}
}
```

常见错误：

| code | 场景 | 前端处理 |
| --- | --- | --- |
| `UNAUTHORIZED` | 未登录 | 弹登录弹窗 |
| `INPUT_TOO_LONG` | 文本超过 500 字 | 提示缩短 |
| `TOO_MANY_WORDS` | 单词超过 30 个 | 提示减少 |
| `CONTENT_BLOCKED` | 内容安全拦截 | 展示合规提示 |
| `TEMPLATE_CAPACITY_EXCEEDED` | 模板容量不足 | 提示减少输入 |
| `AI_JSON_INVALID` | LLM JSON 不合法 | 提示手动重试 |
| `IMAGE_GENERATION_FAILED` | 生图失败 | 提示手动重试 |
| `EXPORT_FAILED` | 导出失败 | 提示重试 |

## 16. 合规与发布

Owner: Agent-Release + Agent-Product

### 16.1 首版要求

- 显示 AI 免责声明。
- 隐私政策草稿。
- 用户协议草稿。
- 关于我们。
- 清除缓存。
- 删除账号。
- 不接入不必要追踪 SDK。
- 不默认申请敏感权限。

### 16.2 免责声明建议

```txt
AI 生成内容仅供学习辅助，可能存在不准确或不完整的情况。请结合教材、课堂内容和权威资料自行核对。
```

### 16.3 iOS 优先

首版优先保证 iOS Capacitor 可运行。Android 结构预留，但不是第一优先验收目标。

## 17. 验收清单

### 17.1 产品验收

- 用户能理解首页两个入口。
- 未登录生成时会被要求登录。
- 登录后可以生成文本记忆宫殿。
- 登录后可以生成单词记忆卡片。
- 生成结果自动保存历史。
- 历史可查看详情。
- 用户可删除历史。
- 用户可删除账号。
- 用户可清除缓存。
- 导出 PNG 可用。

### 17.2 技术验收

- 前端无 API Key。
- 后端 `.env.example` 完整。
- MySQL 可 migrate。
- LLM 结果有 schema 校验。
- 生图 Prompt 禁止文字和 UI。
- 统一错误格式。
- 移动端按钮和 safe area 合格。
- 无无关 SDK。

### 17.3 AI 验收

- 古文可生成有趣但可解释的记忆点。
- 现代文可提取画面和情绪线索。
- 单词支持短语。
- 单词数量超过 30 会阻止生成。
- 图上文字由前端叠加。
- 生图模型不承担文字生成。

## 18. 后续待确认

以下事项暂不阻塞 MVP：

- 正式 App 名称。
- 正式 logo。
- 正式隐私政策与用户协议。
- 短信服务供应商。
- 微信开放平台应用信息。
- 真实 LLM 服务商优先级。
- 图片对象存储最终供应商。
- 国内云服务器部署方案。
- 软著、App 备案、ICP 备案、公网域名。
