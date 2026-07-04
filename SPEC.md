# 忆境 MemoryPalace 产品与工程规格说明

版本：v0.1  
状态：需求访谈初稿  
最后更新：2026-07-03  
目标项目目录：`/Users/rising/Desktop/YiJing`

## 1. 项目摘要

忆境 MemoryPalace 是一个面向中小学生和大学生的 AI 记忆辅助 App。用户输入背诵文本、古文诗词或英语单词/短语后，系统生成“文本记忆宫殿”或“单词记忆卡片”。

本项目不是普通 AI 生图工具。核心价值是把学习内容拆解为可记忆、可复习、可导出的视觉结构。

主流程：

1. 用户注册/登录。
2. 用户选择“文本记忆宫殿”或“单词记忆卡片”。
3. 用户输入学习内容。
4. 后端做基础内容安全检查。
5. LLM 输出严格 JSON 记忆结构。
6. 后端校验模板、锚点、字段和容量。
7. 通义万相生成无文字背景图。
8. 前端叠加轻量编号、英文、词性、水印等文字信息。
9. 生成结果自动保存到历史。
10. 用户导出 PNG，支持 `1:1` 和 `9:16`。

## 2. 已确认需求

- 目标用户：中小学生、大学生。
- MVP 核心功能：文本背诵、古文诗词背诵、英语单词/短语记忆。
- 首页结构：两个主入口，分别为“文本记忆宫殿”和“单词记忆卡片”。
- 项目名称：`忆境 MemoryPalace` 暂定。
- 第一版目标：完整主流程能跑通。
- 结果图导出 PNG：必须支持。
- 用户编辑生成结果：MVP 不做，但预留。
- AI 目标能力：真实 LLM + 通义万相。
- 当前 API Key：暂无，因此开发期必须支持 mock 模式。
- 历史记录：后端数据库保存，使用 MySQL。
- 登录：产品目标为手机号 + 微信登录；MVP 用测试手机号 + 固定验证码。
- 未登录生成：弹出登录弹窗，必须登录后才能生成。
- 删除账号：首版需要真实删除测试账号和历史数据。
- 清除缓存：首版可用，清除本地缓存。
- 文本输入上限：500 字。
- 文本类型优先：古文诗词、现代文背诵。
- 记忆点数量：根据文本长度自动调整。
- 古文谐音联想：可以有趣一点，但必须服务背诵。
- 单词一次最多 30 个，支持英文短语。
- 单词卡片图上必须显示：英文、词性。
- 视觉方向：iOS Liquid Glass 透明玻璃感。
- Liquid Glass 实现：优先直接安装并使用 `liquid-glass-react`。
- 深色模式：首版暂不做，预留。
- 图片标注：尽量少遮挡画面，详细解释放在下方或详情页。
- 模板：保留 10 个通用空间模板。
- 文本场景：默认 AI 自动选择，高级选项可手动选择。
- 单词场景：AI 自动判断主题和模板。
- 超过模板容量：提示用户减少输入，不自动截断、不自动分页。
- 平台优先级：先 iOS。
- 合规文案：先写可替换草稿。
- AI 免责声明：必须有。
- 包管理器：npm。
- 前端技术：React + Vite + TypeScript + Tailwind CSS + Capacitor。
- 后端技术：NestJS + Prisma + MySQL。
- 生成次数/积分：MVP 默认测试账号 20 次；文本生成、单词生成、重新生成每次成功消耗 1 次。
- 重新生成：需要重新消耗次数。
- 生成失败：用户手动重试。
- 生成结果：自动保存历史。
- 导出图：加小水印或 App 名。
- 内容安全：MVP 做基础拦截。
- 图片限制：不要宗教/政治符号，不违反中国大陆法律法规。
- 背景图保存：默认 30 天，用户可手动删除。
- 导出 PNG：本地生成，不上传服务器。
- Prompt/模型原始 JSON：开发环境保存，生产环境脱敏保存。
- 用户原始输入：保存数据库，方便历史查看。

## 3. 第一版明确不做

- 不做社区、排行榜、公开分享广场。
- 不做复杂会员、支付、订阅。
- 不接广告 SDK。
- 不做聊天机器人。
- 不做真人头像生成。
- 不做结果手动编辑，只预留。
- 不默认申请定位、通讯录、麦克风权限。
- 不在用户登录/同意前采集非必要设备信息。
- 不自动分页生成多张图。
- 不自动忽略超量内容。

## 4. 项目实时进度台账

任何 agent 完成一部分工作后，必须更新本章节。不要只在聊天里说完成，必须写回本文档。

### 4.1 总体状态

| 项目 | 当前状态 | 当前负责人 | 最近更新时间 | 证据/备注 |
| --- | --- | --- | --- | --- |
| SPEC 文档 | Done | Agent-Product | 2026-07-03 | 需求访谈结论已整理 |
| Phase 1 前端 Mock 闭环 | Ready for QA | Agent-Frontend | 2026-07-03 | `npm install --cache .npm-cache`、`npm run build`、`npm run dev`、`curl -I http://localhost:5173/` 均通过 |
| Phase 2 后端 Mock + MySQL | Ready for QA | Agent-Backend | 2026-07-04 | MySQL migrate 完成，全部 10 项 smoke test 通过（health/login/text-memory/word-card/regenerate/history/detail/favorite/delete history/delete account）
| Phase 3 LLM 接入 | In Progress | Agent-AI | 2026-07-03 | OpenAI-compatible LLM client、prompt 包、JSON 重试解析、schema/anchor 校验已实现；真实调用待 API Key 验证 |
| Phase 4 通义万相 + 图片存储 | In Progress | Agent-AI | 2026-07-03 | ImageService、通义万相 wan2.6-t2i HTTP 同步调用入口、图片存储抽象已实现；真实调用待 API Key/OSS 配置验证 |
| Phase 5 iOS 打包 | In Progress | Agent-Release | 2026-07-03 | Capacitor iOS 依赖、脚本、配置和占位图标/启动页已完成；`cap add ios` 因 CocoaPods/完整 Xcode 缺失阻塞 |
| QA 回归验收 | In Progress | Agent-QA | 2026-07-04 | 静态检查通过；smoke test 10/10 通过；待完整前端 E2E 验证 |

状态枚举：`Not Started`、`In Progress`、`Blocked`、`Ready for QA`、`Done`。

### 4.2 模块完成记录

| 模块 | Owner | Status | 完成内容 | 变更文件 | 验证方式 | 更新时间 |
| --- | --- | --- | --- | --- | --- | --- |
| 需求访谈整理 | Agent-Product | Done | 整理用户访谈结论并写入 SPEC | `SPEC.md` | 人工检查 | 2026-07-03 |
| Phase 1 前端 Mock 闭环 | Agent-Frontend | Ready for QA | 搭建 React/Vite/Capacitor 前端，完成登录弹窗、文本/单词 mock 生成、历史、本地导出 PNG、Liquid Glass UI | `package.json`, `apps/mobile/**`, `SPEC.md` | `npm install --cache .npm-cache`; `npm run build`; `npm run dev`; `curl -I http://localhost:5173/` | 2026-07-03 |
| Phase 2 后端基础与 Prisma schema | Agent-Backend | Done | 新增 NestJS server、JWT 测试登录、生成 mock API、历史 API、账号删除 API、Prisma MySQL schema 和 docker-compose | `apps/server/**`, `docker-compose.yml`, `package.json`, `package-lock.json`, `SPEC.md` | `npm install --cache .npm-cache`; `npm run prisma:generate -w apps/server`; `npm run prisma:validate`; `npm run build:server`; `curl -s http://localhost:3000/api/health` | 2026-07-03 |
| 前端 API 联调适配 | Agent-Frontend | Done | 新增统一 API client；登录和文本/单词生成优先请求后端 mock API，后端或数据库不可用时回退本地 mock | `apps/mobile/src/services/api.ts`, `apps/mobile/src/stores/authStore.ts`, `apps/mobile/src/pages/TextMemoryPage.tsx`, `apps/mobile/src/pages/WordCardPage.tsx` | `npm run build:mobile`; `npm run build:server` | 2026-07-03 |
| Phase 3 LLM 接入代码框架 | Agent-AI | Done | 新增 prompts 包、OpenAI-compatible chat completions client、JSON 解析重试、文本/单词 schema 校验、anchor 合法性与容量校验，并接入生成服务；无 Key 时默认 mock | `packages/prompts/**`, `apps/server/src/modules/ai/**`, `apps/server/src/modules/generation/**`, `apps/server/.env.example` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate` | 2026-07-03 |
| Phase 4 生图服务代码框架 | Agent-AI | Done | 新增 ImageService 和 StorageService；默认 mock，配置 `IMAGE_MOCK_MODE=false` 与 `WANX_API_KEY` 后调用通义万相 `wan2.6-t2i`，强制无文字/无水印参数并记录图片生成日志 | `apps/server/src/modules/image/**`, `apps/server/src/modules/generation/**`, `apps/server/.env.example`, `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate` | 2026-07-03 |
| Phase 5 iOS 项目准备 | Agent-Release | Done | 加入 `@capacitor/ios`、iOS 同步脚本、Capacitor iOS 配置、图标/启动页 SVG 占位和 iOS 环境说明；Xcode 工程生成因本机环境缺口待执行 | `apps/mobile/package.json`, `apps/mobile/capacitor.config.ts`, `apps/mobile/IOS_SETUP.md`, `apps/mobile/src/assets/**`, `.gitignore`, `SPEC.md` | `npm run build:mobile`; `npm run cap:add:ios -w apps/mobile` 返回 CocoaPods 缺失错误 | 2026-07-03 |
| README 使用文档 | Agent-Product | Done | 新增项目介绍、技术栈、本地运行、mock 模式、LLM/万相接入、iOS/Android 打包和大陆发布注意事项 | `README.md`, `SPEC.md` | 人工检查；`npm run build:mobile`; `npm run build:server`; `npm run prisma:validate` | 2026-07-03 |
| 历史与账号 API 联调适配 | Agent-Frontend | Done | 历史列表、历史详情、删除历史和删除账号优先请求后端 API，后端不可用时回退本地缓存 | `apps/mobile/src/pages/HistoryPage.tsx`, `apps/mobile/src/pages/DetailPage.tsx`, `apps/mobile/src/pages/SettingsPage.tsx`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate` | 2026-07-03 |
| 后端 API Smoke Test | Agent-QA | Done | 新增后端主流程 smoke 脚本，覆盖健康检查、测试登录、文本生成、单词生成、历史、收藏、删除历史和删除账号 | `apps/server/scripts/smoke-api.mjs`, `package.json`, `apps/server/package.json`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/smoke-api.mjs`; `npm run build:server`; `npm run prisma:validate` | 2026-07-04 |
| Android Capacitor 工程准备 | Agent-Release | Done | 加入 `@capacitor/android`、Android 同步脚本并生成 `apps/mobile/android` 工程；AAB/APK 构建待 Android Studio/JDK 环境 | `apps/mobile/android/**`, `apps/mobile/package.json`, `apps/mobile/ANDROID_SETUP.md`, `.gitignore`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run cap:add:android -w apps/mobile` | 2026-07-04 |
| 生成次数/额度扣减 | Agent-Backend/Frontend | Done | 后端测试登录自动创建/补齐 20 次额度；生成记录保存事务内扣减 1 次并返回剩余额度；前端首页/我的展示剩余次数，本地 mock 路径同步扣减，业务错误不再被 mock 回退绕过 | `apps/server/src/modules/auth/auth.service.ts`, `apps/server/src/modules/generation/generation.service.ts`, `apps/mobile/src/stores/authStore.ts`, `apps/mobile/src/pages/TextMemoryPage.tsx`, `apps/mobile/src/pages/WordCardPage.tsx`, `apps/mobile/src/pages/HomePage.tsx`, `apps/mobile/src/pages/SettingsPage.tsx`, `apps/mobile/src/types/index.ts`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate` | 2026-07-04 |
| 结果页重新生成联调 | Agent-Frontend/QA | Done | 前端结果页接入后端 `POST /generation/:id/regenerate`，成功后写入当前结果和历史；后端不可用时用当前结果本地 mock 再生成；smoke test 覆盖重新生成和额度返回 | `apps/mobile/src/services/api.ts`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 历史收藏前端联调 | Agent-Frontend | Done | 历史列表和详情页新增收藏/取消收藏操作；真实后端可用时调用 `PATCH /history/:id/favorite`，本地 mock 时写入 localStorage；前端类型和历史 store 支持 `isFavorite` | `apps/mobile/src/services/api.ts`, `apps/mobile/src/stores/historyStore.ts`, `apps/mobile/src/types/index.ts`, `apps/mobile/src/pages/HistoryPage.tsx`, `apps/mobile/src/pages/DetailPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 结果页分享/保存操作 | Agent-Frontend | Done | 结果页新增“分享/保存”和“查看详情”操作；分享使用 Web Share API 分享 PNG 文件，环境不支持时自动下载；导出渲染服务拆分为可复用渲染、下载和分享函数 | `apps/mobile/src/services/exportImage.ts`, `apps/mobile/src/components/ShareImageButton.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| AI 免责声明主流程展示 | Agent-Frontend/Compliance | Done | 新增复用 `AiDisclaimer` 组件，并在文本生成、单词生成、结果页和关于页展示学习辅助免责声明，满足首版合规展示要求 | `apps/mobile/src/components/AiDisclaimer.tsx`, `apps/mobile/src/pages/TextMemoryPage.tsx`, `apps/mobile/src/pages/WordCardPage.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `apps/mobile/src/pages/AboutPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 后端校验错误码映射 | Agent-Backend | Done | 新增 ValidationPipe exceptionFactory，将 DTO 校验错误映射为 SPEC 定义的 `INPUT_TOO_LONG`、`TOO_MANY_WORDS` 和通用 `INVALID_INPUT`，并保留统一错误响应的 details | `apps/server/src/common/validation-error.ts`, `apps/server/src/main.ts`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 后端单词大小写不敏感去重 | Agent-Backend | Done | 后端单词卡片生成服务新增标准化流程，对单词/短语执行 trim、过滤空值和大小写不敏感去重，保持与前端 `parseWords` 行为一致 | `apps/server/src/modules/generation/generation.service.ts`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 背景图 URL 历史摘要保存 | Agent-Backend/Frontend | Done | 修正生成记录保存逻辑，将 ImageService 返回的 `backgroundImageUrl` 写入 `GenerationRecord.backgroundImageUrl`，并补齐前端历史 API 类型，保证真实生图后历史摘要可读取背景图 URL | `apps/server/src/modules/generation/generation.service.ts`, `apps/mobile/src/services/api.ts`, `apps/mobile/src/pages/HistoryPage.tsx`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 历史详情结构化展示 | Agent-Frontend | Done | 历史详情页补全文本记忆点详情和单词详情；单词详情展示中文释义、音标、例句、视觉物体和记忆提示，满足单词卡片详情规格 | `apps/mobile/src/pages/DetailPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 设置页危险操作确认 | Agent-Frontend | Done | 清除缓存和删除账号操作新增页面内二次确认面板；删除账号确认时显示影响范围并保留加载状态，降低误触风险 | `apps/mobile/src/pages/SettingsPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 历史单条删除确认 | Agent-Frontend | Done | 历史列表每条记录删除前新增卡片内二次确认；取消不会影响收藏或详情入口，确认后继续调用后端删除并移除本地缓存 | `apps/mobile/src/pages/HistoryPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| 共享类型包 `packages/shared` | Agent-AI | Done | 新增 `packages/shared/`，集中管理 SPEC §9 类型定义、§10 模板常量、§15 错误码；通过 root workspace 自动链接，前后端可复用 | `packages/shared/**`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `npm run prisma:validate`; `ls packages/shared/src/` | 2026-07-04 |
| QA 静态回归验证 | Agent-QA | Done | 全量构建（server + mobile）、Prisma schema 校验、smoke 脚本语法检查通过；运行时 smoke 因 Docker/MySQL 未就绪待验证 | `SPEC.md` | `npm run build:server`; `npm run build:mobile`; `npm run prisma:validate`; `node --check apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| Phase 2 MySQL migrate + smoke 全流程 | Agent-QA | Done | 启动 MySQL 容器、Prisma migrate 建表、启动 NestJS server、运行 smoke test 全部 10 项通过；修复 packages ESM/CJS 冲突；端口 3306 冲突改为 3307 | `docker-compose.yml`, `apps/server/.env`, `apps/server/.env.example`, `packages/prompts/package.json`, `packages/shared/package.json`, `SPEC.md` | `docker compose up -d mysql`; `npm run prisma:migrate -w apps/server -- --name init`; `npm run dev -w apps/server`; `node apps/server/scripts/smoke-api.mjs` | 2026-07-04 |
| README MySQL/Smoke 状态校准 | Agent-Docs | Done | README 移除 Docker/MySQL 旧阻塞说明，补充 3307 端口、migration 路径、smoke 已验证状态，并将 Android TODO 收敛为 AAB/APK 打包 | `README.md`, `SPEC.md` | `docker ps`; `ls apps/server/prisma/migrations`; 人工检查 README | 2026-07-04 |
| Android launcher 图标接入 | Agent-Release | Done | 将提供的 1024x1024 PNG 复制为受控源图 `apps/mobile/src/assets/logo.png`，并生成 Android `mipmap-*` 多密度 launcher/round/foreground 图标资源；根目录原始 `logo.png` 保留未跟踪 | `apps/mobile/src/assets/logo.png`, `apps/mobile/android/app/src/main/res/mipmap-*/ic_launcher*.png`, `README.md`, `SPEC.md` | `file apps/mobile/src/assets/logo.png`; `file apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`; `npm run build:mobile` | 2026-07-04 |
| App 版本号一致性 | Agent-Release/Frontend | Done | 新增前端 `APP_VERSION` 常量，设置页和关于页统一显示 `v0.1.0`；Android `versionName` 从默认 `1.0` 调整为 `0.1.0` | `apps/mobile/src/constants/app.ts`, `apps/mobile/src/pages/SettingsPage.tsx`, `apps/mobile/src/pages/AboutPage.tsx`, `apps/mobile/android/app/build.gradle`, `README.md`, `SPEC.md` | `npm run build:mobile`; `rg \"versionName|APP_VERSION|v0.1.0\" apps/mobile` | 2026-07-04 |
| Liquid Glass 封装修复 | Agent-Frontend | Done | 恢复 `LiquidGlassCard` 对 `liquid-glass-react` 的实际封装，同时保留 CSS fallback 的圆角和 overflow 修复，确保符合 SPEC 的 Liquid Glass 实现要求 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `README.md`, `SPEC.md` | `npm run build:mobile`; `rg \"LiquidGlass|liquid-glass-react\" apps/mobile/src apps/mobile/package.json` | 2026-07-04 |

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
- 重要决策、遗留问题或下一步。
```

### 4.3 阻塞项

| 阻塞项 | 影响范围 | 需要谁处理 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| 真实 AI API Key 暂无 | Phase 3、Phase 4 | 用户/Agent-AI | Open | 开发阶段保留 mock 模式 |
| 短信服务商未确定 | 真实手机号登录 | 用户/Agent-Backend | Open | MVP 用固定测试验证码 |
| 微信开放平台应用未配置 | 微信登录 | 用户/Agent-Backend | Open | MVP 只预留 |
| 正式 App 名称未确认 | iOS 发布、品牌资产 | 用户/Agent-Release | Open | 当前使用暂定名 |
| Docker daemon 未运行 | Phase 2 MySQL migrate | 用户/Agent-Backend | Resolved | ✅ Docker 已启动，MySQL 容器正常运行，migrate 已完成 |
| CocoaPods 未安装 | Phase 5 iOS 工程生成 | 用户/Agent-Release | Open | `cap add ios` 报错：CocoaPods is not installed |
| 完整 Xcode 未配置 | Phase 5 iOS 构建/模拟器运行 | 用户/Agent-Release | Open | `xcodebuild` 当前指向 Command Line Tools，不是完整 Xcode |
| Java/Android SDK 未配置 | Android APK/AAB 构建 | 用户/Agent-Release | Open | `java -version` 报错且 `ANDROID_HOME` 为空；Android 工程已生成但无法本机构建 |

### 4.4 决策记录

| 日期 | 决策 | 原因 | 影响 |
| --- | --- | --- | --- |
| 2026-07-03 | 单词空白模板使用 `blank_word_card_30` | 用户确认单次最多 30 个单词/短语 | 模板、校验和 UI 限制需一致 |
| 2026-07-03 | MVP 用测试手机号 + 固定验证码 | 暂无短信和微信配置 | 可先跑通登录后生成流程 |
| 2026-07-03 | 导出 PNG 本地生成，不上传服务器 | 降低成本和隐私风险 | 前端负责合成与保存 |

## 5. 阶段规划

### Phase 1：前端 Mock 闭环

Owner: Agent-Frontend  
目标：没有 API Key 和后端时，也能跑通输入、登录弹窗、生成中、结果、导出、历史详情。

范围：

- 创建 monorepo 基础结构。
- 创建 `apps/mobile`。
- React + Vite + TypeScript + Tailwind + Capacitor。
- 安装并使用 `liquid-glass-react`。
- 首页两个入口。
- 文本记忆输入页。
- 单词卡片输入页。
- 登录弹窗，测试手机号 + 固定验证码。
- 生成中状态。
- mock 结果页。
- 轻量编号叠加。
- 下方详情列表。
- PNG 导出，支持 `1:1` 和 `9:16`。
- 导出图带小水印。
- localStorage 临时缓存。
- 清除缓存可用。

完成标准：

- `npm install` 成功。
- `npm run dev` 成功。
- 未登录点击生成弹出登录弹窗。
- 登录后文本和单词功能都能进入结果页。
- 结果页可以导出 PNG。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| Ready for QA | Agent-Frontend | 2026-07-03 | 前端 mock 闭环已实现；构建通过；Vite dev server 已在 `http://localhost:5173/` 返回 200 |

### Phase 2：后端 Mock + MySQL

Owner: Agent-Backend  
目标：实现真实后端结构、数据库保存、测试账号、历史记录、账号删除。

范围：

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
- 删除账号：删除用户、历史记录、生成记录。
- 图片过期字段：默认 30 天。

完成标准：

- 后端可本地启动。
- Prisma schema 可 migrate。
- 登录后才能生成。
- 生成结果自动保存数据库。
- 删除账号后该用户历史不可再查到。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| In Progress | Agent-Backend | 2026-07-03 | 后端代码、Prisma schema、构建和 health 启动验证已完成；MySQL migrate 因 Docker daemon 未运行待验证 |

### Phase 3：LLM 接入

Owner: Agent-AI  
目标：接入 OpenAI-compatible LLM，支持 Qwen / DeepSeek / OpenAI 兼容地址。

要求：

- 所有 API Key 只在后端 `.env`。
- 前端不得直接请求模型。
- LLM 必须输出严格 JSON。
- JSON 解析失败时允许重试。
- 校验 `anchorKey` 合法性。
- 校验模板容量。
- 校验字段完整性。
- 基础内容安全拦截。
- 开发环境保存 prompt 和原始 JSON。
- 生产环境脱敏保存。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| In Progress | Agent-AI | 2026-07-03 | LLM 接入代码、prompt、JSON 重试和校验链路已完成；真实 API 调用需配置 `LLM_API_KEY` 后验证 |

### Phase 4：通义万相 + 图片存储

Owner: Agent-AI  
目标：根据结构化结果生成无文字背景图并保存。

要求：

- 默认使用通义万相。
- Prompt 明确禁止文字、数字、标签、水印、UI。
- 不生成宗教/政治符号。
- 图片默认保存 30 天。
- 存储优先阿里云 OSS，也可替换为兼容 S3 的国内对象存储。
- 数据库记录 `expiresAt`。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| In Progress | Agent-AI | 2026-07-03 | 通义万相调用入口和存储抽象已完成；真实生图和 OSS 上传需配置 Key、Workspace Endpoint 和存储参数后验证 |

### Phase 5：iOS 优先打包

Owner: Agent-Release  
目标：Capacitor iOS 可运行。

要求：

- Capacitor 初始化。
- iOS 项目生成。
- App 名称暂定“忆境”。
- 图标、启动页占位。
- Safe area 适配。
- App 版本号展示。
- 不申请不必要权限。

Progress Log:

| Status | Owner | 更新时间 | 证据/备注 |
| --- | --- | --- | --- |
| In Progress | Agent-Release | 2026-07-03 | iOS 依赖、脚本、配置和占位资源已完成；`cap add ios` 因 CocoaPods 未安装而无法生成 Xcode 工程 |

## 6. 产品信息架构

| 页面 | 路由建议 | 说明 |
| --- | --- | --- |
| 首页 | `/` | 两个主入口，最近历史摘要 |
| 文本记忆宫殿 | `/text-memory` | 文本输入与高级设置 |
| 单词记忆卡片 | `/word-card` | 单词/短语输入 |
| 生成结果 | `/result/:id` | 图片、轻量标注、解释、导出 |
| 历史 | `/history` | 登录用户历史 |
| 详情 | `/detail/:id` | 单条历史详情 |
| 设置 | `/settings` | 账号、缓存、协议、版本 |
| 隐私政策 | `/privacy` | 可替换草稿 |
| 用户协议 | `/terms` | 可替换草稿 |
| 关于我们 | `/about` | App 信息和免责声明 |

## 7. 核心功能规格

### 7.1 首页

- 顶部欢迎语：`今天要记什么？`
- 副标题：`把难背的内容变成一张能看懂的记忆图`
- 主入口：文本记忆宫殿。
- 主入口：单词记忆卡片。
- 最近生成历史摘要。
- 登录状态入口。

### 7.2 文本记忆宫殿

- 输入最大 500 字。
- 内容类型：自动判断、古文/诗词、现代文。
- 高级设置默认收起。
- 场景偏好：自动、书房、教室、古风小屋、宫殿大厅、街道路线、博物馆展厅。
- 记忆点数量自动：
  - 1-120 字：3-5 个点。
  - 121-280 字：5-8 个点。
  - 281-500 字：8-12 个点。

### 7.3 单词记忆卡片

- 一行一个词或逗号分隔。
- 支持短语。
- 自动 trim。
- 自动去重，大小写不敏感。
- 最多 30 个。
- 图上显示英文和词性。
- 详情显示中文释义、音标、例句、记忆提示、视觉物体。

### 7.4 生成结果

- 顶部图片区域。
- 背景图。
- 轻量编号或点位。
- 下方解释列表。
- 操作：导出 PNG、重新生成、分享/保存、查看详情。
- 导出支持 `1:1` 和 `9:16`。
- 导出图带小水印：`忆境 MemoryPalace`。

## 8. 技术架构

### 8.1 Monorepo

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

### 8.2 前端

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

### 8.3 后端

- Node.js
- NestJS
- TypeScript
- Prisma
- MySQL
- OpenAI-compatible LLM client
- 通义万相 API client
- 阿里云 OSS 或兼容国内对象存储

## 9. 核心数据类型

```ts
export type ContentType = 'auto' | 'ancient_text' | 'modern_text' | 'vocabulary'

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
  category: 'general' | 'ancient' | 'modern' | 'vocabulary' | 'academic' | 'process'
  scenePrompt: string
  bestFor: ContentType[]
  anchors: Anchor[]
  routePattern: 'clockwise' | 'left_to_right' | 'top_to_bottom' | 'path' | 'center_out'
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
  position: { x: number; y: number }
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
  position: { x: number; y: number }
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

规则：

- `anchorKey` 必须来自模板。
- 不允许重复使用 `anchorKey`。
- `position.x` 和 `position.y` 必须在 0 到 1。
- 单词数量超过 30 时直接提示减少输入。

## 11. AI 规则

### 11.1 文本记忆

- 古文允许有趣谐音，但不能无意义。
- 现代文提取人物、地点、景物、动作、情绪、主题、转折、顺序。
- 每个记忆点需要有解释，但默认放下方列表或详情页。

### 11.2 单词记忆

- 支持英文单词和短语。
- 图上只强制显示英文和词性。
- 具体词优先画实物。
- 抽象词用动作、情绪、对比、场景表达。

### 11.3 生图禁令

每个生图 Prompt 必须包含：

```txt
no text, no Chinese characters, no English letters, no numbers, no labels, no watermark, no UI elements
```

同时必须加入中文约束：

```txt
不要出现文字、数字、标签、水印、界面元素、宗教符号、政治符号。
```

### 11.4 内容安全

MVP 基础拦截：

- 色情低俗。
- 血腥暴力。
- 自伤自杀。
- 违法犯罪。
- 宗教政治符号生成请求。
- 明显违反中国大陆法律法规的内容。

统一返回：

```json
{
  "code": "CONTENT_BLOCKED",
  "message": "该内容暂不支持生成，请更换学习内容。"
}
```

## 12. 后端 API

所有生成接口必须登录后访问。

### 12.1 登录

`POST /api/auth/test-login`

```json
{
  "phone": "13800000000",
  "code": "123456"
}
```

### 12.2 删除账号

`DELETE /api/user/me`

要求删除用户、生成记录、历史数据，并处理或标记删除相关图片。

### 12.3 生成

- `POST /api/generation/text-memory`
- `POST /api/generation/word-card`
- `POST /api/generation/:id/regenerate`

重新生成需要重新消耗次数，生成新记录，不覆盖旧记录。

### 12.4 历史

- `GET /api/history`
- `GET /api/history/:id`
- `DELETE /api/history/:id`
- `PATCH /api/history/:id/favorite`

## 13. 数据库设计

### 13.1 User

- `id`
- `nickname`
- `phone`
- `wechatOpenId`
- `wechatUnionId`
- `avatarUrl`
- `createdAt`
- `updatedAt`
- `deletedAt`

### 13.2 GenerationRecord

- `id`
- `userId`
- `type`
- `title`
- `contentType`
- `inputText`
- `inputWords`
- `templateId`
- `backgroundImageUrl`
- `resultJson`
- `imagePrompt`
- `promptUsed`
- `isFavorite`
- `createdAt`
- `updatedAt`
- `expiresAt`
- `deletedAt`

### 13.3 AiUsageLog

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

### 13.4 UserQuota

预留：

- `id`
- `userId`
- `remainingCredits`
- `usedCredits`
- `createdAt`
- `updatedAt`

## 14. 前端组件

- `LiquidGlassCard`：封装 `liquid-glass-react`，提供 CSS 降级。
- `GlassButton`：移动端按钮，高度不低于 44px。
- `AuthModal`：测试手机号 + 固定验证码登录。
- `MemoryPalaceCanvas`：渲染背景图和轻量点位。
- `WordMemoryCard`：图上显示英文 + 词性，下方显示详情。
- `ExportImageButton`：导出 `1:1` 和 `9:16` PNG，添加水印。
- `BottomTabBar`：底部导航，适配 safe area。
- `LoadingGenerate`：生成中状态。

## 15. 错误处理

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

首版要求：

- 显示 AI 免责声明。
- 隐私政策草稿。
- 用户协议草稿。
- 关于我们。
- 清除缓存。
- 删除账号。
- 不接入不必要追踪 SDK。
- 不默认申请敏感权限。

免责声明：

```txt
AI 生成内容仅供学习辅助，可能存在不准确或不完整的情况。请结合教材、课堂内容和权威资料自行核对。
```

## 17. 验收清单

产品验收：

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

技术验收：

- 前端无 API Key。
- 后端 `.env.example` 完整。
- MySQL 可 migrate。
- LLM 结果有 schema 校验。
- 生图 Prompt 禁止文字和 UI。
- 统一错误格式。
- 移动端按钮和 safe area 合格。
- 无无关 SDK。

## 18. 后续待确认

- 正式 App 名称。
- 正式 logo。
- 正式隐私政策与用户协议。
- 短信服务供应商。
- 微信开放平台应用信息。
- 真实 LLM 服务商优先级。
- 图片对象存储最终供应商。
- 国内云服务器部署方案。
- 软著、App 备案、ICP 备案、公网域名。
