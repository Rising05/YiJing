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
| Phase 2 后端 Mock + MySQL | Ready for QA | Agent-Backend/QA | 2026-07-05 | MySQL migrate 完成，全部 19 项 smoke test 通过（health/unauthorized/invalid login/login/login quota restore/input validation/content safety/text-memory/word-card/regenerate/history/detail/favorite/delete history/quota exhausted/delete account/deleted token rejection） |
| Phase 3 LLM 接入 | In Progress | Agent-AI | 2026-07-05 | OpenAI-compatible LLM client、prompt 包、JSON 解析 + schema/anchor 校验重试已实现；真实调用待 API Key 验证 |
| Phase 4 通义万相 + 图片存储 | In Progress | Agent-AI/Backend | 2026-07-05 | ImageService、通义万相 wan2.6-t2i HTTP 同步调用入口、图片存储抽象、本地/OSS/S3-compatible provider、共享生图 prompt 禁令和静态检查已实现；真实万相和真实对象存储调用待 API Key/账号验证 |
| Phase 5 iOS 打包 | In Progress | Agent-Release | 2026-07-05 | Capacitor iOS/Android 依赖、脚本、配置、占位图标/启动页和发布元数据静态检查已完成；`cap add ios` 因 CocoaPods/完整 Xcode 缺失阻塞 |
| QA 回归验收 | Done | Agent-QA | 2026-07-05 | 静态检查通过；后端 API smoke 19 项通过；前端 Chrome headless UI smoke 通过 |

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
| 后端 API 负向错误码 Smoke | Agent-Backend/QA | Done | 后端 API smoke 新增 SPEC §15 负向路径覆盖：未登录生成必须返回 `UNAUTHORIZED`，文本超过 500 字返回 `INPUT_TOO_LONG`，单词超过 30 个返回 `TOO_MANY_WORDS`，内容安全拦截返回 `CONTENT_BLOCKED`；后续额度、登录失败和登录补齐额度补充后当前 smoke 共 19 项运行通过 | `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/smoke-api.mjs`; `npm run build:server`; `npm run prisma:validate`; `npm run smoke:api` | 2026-07-05 |
| 额度耗尽错误码统一与 Smoke | Agent-Backend/Frontend/QA | Done | 后端额度不足从旧 `INSUFFICIENT_CREDITS` 统一为 SPEC/共享包错误码 `QUOTA_EXCEEDED`；前端本地 mock 同步抛出 `QUOTA_EXCEEDED` 并保留旧码展示兼容；后端 API smoke 通过 Prisma 将测试用户额度临时置 0，再调用生成接口断言返回 `QUOTA_EXCEEDED` | `apps/server/src/modules/generation/generation.service.ts`, `apps/server/scripts/smoke-api.mjs`, `apps/mobile/src/pages/TextMemoryPage.tsx`, `apps/mobile/src/pages/WordCardPage.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/smoke-api.mjs`; `npm run build:server`; `npm run build:mobile`; `npm run smoke:api`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 生成额度精确扣减 Smoke | Agent-Backend/QA | Done | 后端 API smoke 在测试登录重置为 `20/0` 后，精确断言文本生成、单词生成、文本重新生成和单词重新生成依次返回 `19/1`、`18/2`、`17/3`、`16/4` 的 `credits.remaining/credits.used`，防止成功生成未扣减、重复扣减或只返回松散额度字段 | `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/smoke-api.mjs`; `npm run build:server`; `npm run smoke:api`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 测试登录失败错误码统一 | Agent-Backend/QA | Done | 测试登录手机号或验证码错误时不再返回私有码 `INVALID_TEST_CODE`，统一返回 SPEC/共享包错误码 `INVALID_INPUT`；后端 API smoke 新增错误验证码登录失败断言，当前 smoke 共 19 项运行通过 | `apps/server/src/modules/auth/auth.service.ts`, `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/smoke-api.mjs`; `npm run build:server`; `npm run smoke:api`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 测试登录额度补齐回归 | Agent-Backend/QA | Done | 后端测试登录在已有测试账号额度被耗尽时会重新补齐为 20 次，符合 MVP 反复验收需要；后端 API smoke 新增先置 0/20 再重新登录的断言，确认返回 `remainingCredits=20` 后继续主流程 | `apps/server/src/modules/auth/auth.service.ts`, `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/smoke-api.mjs`; `npm run build:server`; `npm run smoke:api`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
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
| 发布元数据静态检查 | Agent-Release/QA | Done | 新增 `check:release-metadata`，校验 Capacitor `appId/appName/webDir`、iOS safe area 配置、Android `namespace/applicationId/versionName/versionCode`、Android strings、MainActivity 包名和 manifest launcher 配置，确保暂定 App 名“忆境”、包名 `cn.memorypalace.yijing` 和版本 `0.1.0` 在前端与 Android 工程中保持一致 | `apps/mobile/scripts/check-release-metadata.mjs`, `apps/mobile/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-release-metadata.mjs`; `npm run check:release-metadata`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| Liquid Glass 封装修复 | Agent-Frontend | Done | 恢复 `LiquidGlassCard` 对 `liquid-glass-react` 的实际封装，同时保留 CSS fallback 的圆角和 overflow 修复，确保符合 SPEC 的 Liquid Glass 实现要求 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `README.md`, `SPEC.md` | `npm run build:mobile`; `rg \"LiquidGlass|liquid-glass-react\" apps/mobile/src apps/mobile/package.json` | 2026-07-04 |
| 首页 Liquid Glass 卡片裁切修复 | Agent-Frontend | Done | 修正 `LiquidGlassCard` 外层裁切策略，覆盖 `liquid-glass-react` 默认居中定位，降低玻璃位移强度，并让首页卡片链接与内部内容层稳定占满可用宽度；实际内容面板继续由 fallback 圆角层裁剪，解决首页主入口卡片左侧被切掉和直角边框可见问题 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `apps/mobile/src/pages/HomePage.tsx`, `SPEC.md` | `npm run build:mobile`; 首页浏览器手动检查 | 2026-07-04 |
| 首页 Liquid Glass 卡片二次裁切加固 | Agent-Frontend/QA | Done | 根据用户浏览器标注复查：首页卡片仍可能看到库中间包装层的直角边界，并存在移动端水平溢出风险；已将 `glass-shell`、`glass-liquid`、库生成 `.glass` 和内容包装层统一为 `24px` 圆角裁切，降低位移/色散强度，给首页入口卡片加 `min-w-0`，并把无水平溢出、左右不截断、圆角继承纳入 UI smoke 断言 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `apps/mobile/src/pages/HomePage.tsx`, `apps/mobile/scripts/smoke-ui.mjs`, `README.md`, `SPEC.md` | `npm run build:mobile`; `node --check apps/mobile/scripts/smoke-ui.mjs`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui`; 浏览器盒模型复查 `.glass-fallback` 为 `24px` 圆角 | 2026-07-04 |
| 首页 Liquid Glass 569px 标注复查 | Agent-Frontend/QA | Done | 根据用户在浏览器 569px 视口的标注复查首页主入口：入口链接自身新增 24px 圆角裁切，首页主入口降低 `liquid-glass-react` 位移、色散和弹性强度，SVG 滤镜层继承圆角并禁止越界；UI smoke 扩展到 390px 和 569px，逐层断言 link、shell、liquid、svg、glass、wrapper、fallback 均不左右裁切且保持圆角 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `apps/mobile/src/pages/HomePage.tsx`, `apps/mobile/scripts/smoke-ui.mjs`, `README.md`, `SPEC.md` | `npm run build:mobile`; `node --check apps/mobile/scripts/smoke-ui.mjs`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui` | 2026-07-05 |
| 首页 Liquid Glass 圆角视觉裁切复查 | Agent-Frontend/QA | Done | 根据用户最新浏览器标注继续加固：首页入口卡片所有 Liquid Glass 中间层增加 `clip-path: inset(0 round 24px)` 和 `background-clip`，并强制库 wrapper 清除 `position/inset/transform`，避免 `.transition-all.duration-150` 层将内容推到视口外或露出直角背景；UI smoke 新增主容器居中、卡片不贴视口边、wrapper 定位/transform 和 rounded clip-path 断言 | `apps/mobile/src/styles/globals.css`, `apps/mobile/scripts/smoke-ui.mjs`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/smoke-ui.mjs`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui`; 569x995 截图复查 | 2026-07-05 |
| 首页 Liquid Glass 标注 1 修复 | Agent-Frontend/QA | Done | 根据用户在浏览器对“文本记忆宫殿”首页入口的最新标注修复：`LiquidGlassCard` 传入稳定 `position/top/left/width/height`，CSS 将依赖库默认 `translate(-50%)` 主层改回文档流全宽块级布局，强制内部 `.glass` 取消 `inline-flex`、默认 padding 和 gap，并隐藏库额外装饰层，解决圆角卡片仍露直角边框以及左侧内容被裁切的问题；UI smoke 补充液态层与 shell 对齐、`.glass` block 布局、padding/gap 为 0 的断言 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `apps/mobile/scripts/smoke-ui.mjs`, `README.md`, `SPEC.md` | `npm run build:mobile`; `node --check apps/mobile/scripts/smoke-ui.mjs`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui` | 2026-07-05 |
| 首页 Liquid Glass 内容层解耦 | Agent-Frontend/QA | Done | 根据用户在浏览器标注 1 的复查结果继续修正：`liquid-glass-react` 内部仍会生成带 `translate(-50%)` 的动效层，导致选中的内容层可能露出直角边或在移动视口左侧被裁切；现已将库组件改为只渲染绝对铺满的玻璃背景层，真实内容移到自有 `.glass-fallback` 正常文档流层，并用 `z-index: 1` 位于动效层之上；UI smoke 更新为断言 fallback 与 shell 左上对齐、内容在 fallback 内、动效 wrapper 只作为 absolute 背景层 | `apps/mobile/src/components/LiquidGlassCard.tsx`, `apps/mobile/src/styles/globals.css`, `apps/mobile/scripts/smoke-ui.mjs`, `README.md`, `SPEC.md` | `npm run build:mobile`; `node --check apps/mobile/scripts/smoke-ui.mjs`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui`; `git diff --check` | 2026-07-05 |
| 后端运行配置自检 | Agent-Backend/QA | Done | 新增 `check:config` 脚本，读取 `apps/server/.env` 或指定 `ENV_FILE`，在不打印密钥的前提下检查核心运行变量、真实 LLM、通义万相和对象存储配置；mock 模式下明确说明 Key 非必需，真实模式缺 Key/URL/模型/尺寸会失败，OSS 配置不完整会失败并提示缺失项 | `apps/server/scripts/check-runtime-config.mjs`, `apps/server/package.json`, `package.json`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/check-runtime-config.mjs`; `npm run check:config`; `ENV_FILE=apps/server/.env.example npm run check:config` | 2026-07-04 |
| 生产配置规则自检 | Agent-Backend/Release/QA | Done | `check:config -- --production` 新增生产模式校验，要求 `NODE_ENV=production`、真实高强度 JWT Secret、关闭 AI/生图 mock、配置 LLM/通义万相真实 Key、图片存储能满足 30 天保留，并禁止本地图片公开 URL 仍指向 localhost；新增 `.env.production.example` 和 `check:production-config`，用临时 env 验证安全生产配置通过、mock/占位/localhost 配置失败 | `apps/server/scripts/check-runtime-config.mjs`, `apps/server/scripts/check-production-config-rules.mjs`, `apps/server/.env.production.example`, `apps/server/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/check-runtime-config.mjs`; `node --check apps/server/scripts/check-production-config-rules.mjs`; `npm run check:config`; `npm run check:production-config`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 后端 CORS 白名单配置 | Agent-Backend/Release/QA | Done | 后端 CORS 从固定 `origin: true` 改为 `ALLOWED_ORIGINS` 驱动：开发环境未配置时继续允许本地调试，生产环境启动和配置检查都要求显式来源列表并拒绝 `*` 通配符；新增 `check:cors-config` 覆盖开发 fallback、生产白名单、生产缺失和生产通配符拒绝 | `apps/server/src/common/cors.ts`, `apps/server/src/main.ts`, `apps/server/scripts/check-cors-config.mjs`, `apps/server/scripts/check-runtime-config.mjs`, `apps/server/.env.example`, `apps/server/.env.production.example`, `apps/server/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `npm run build:server`; `node --check apps/server/scripts/check-cors-config.mjs`; `npm run check:cors-config`; `npm run check:config`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 云服务器 Docker 部署骨架 | Agent-Backend/Release/QA | Done | 新增服务端多阶段 Dockerfile、生产 compose 示例和 `.dockerignore`：容器构建会 `npm ci`、生成 Prisma client、构建 server、裁剪 dev 依赖；运行层使用非 root `node` 用户、健康检查和真实编译入口；生产 compose 示例包含 MySQL 8.4、后端服务、启动前 `prisma migrate deploy`、本地图片持久化卷和必填数据库密码；修正 `apps/server` 的 `start` 脚本为实际 dist 入口，并新增 `check:deploy-config` 纳入 root `check:mvp` | `apps/server/Dockerfile`, `.dockerignore`, `docker-compose.prod.example.yml`, `apps/server/package.json`, `package-lock.json`, `scripts/check-deploy-config.mjs`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check scripts/check-deploy-config.mjs`; `npm run check:deploy-config`; `npm run build:server`; `PORT=3010 npm run start -w apps/server`; `npm run check:mvp`; `git diff --check` | 2026-07-06 |
| 移动端生产 API 地址检查 | Agent-Frontend/Release/QA | Done | 移动端 API 地址改为 `getApiBaseUrl()`：开发环境未配置 `VITE_API_BASE_URL` 时才 fallback 到 `http://localhost:3000/api`，生产缺失时返回明确 `API_BASE_URL_MISSING`，避免 iOS/Android 发布包误连设备自身 localhost；新增 `apps/mobile/.env.production.example` 和 `check:mobile-runtime-config`，要求发布 API 地址为 HTTPS、非 localhost，并包含 `/api` 前缀；已纳入 root `check:mvp` | `apps/mobile/src/services/api.ts`, `apps/mobile/scripts/check-mobile-runtime-config.mjs`, `apps/mobile/.env.production.example`, `apps/mobile/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-mobile-runtime-config.mjs`; `npm run build:mobile`; `npm run check:mobile-runtime-config`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 图片本地持久化存储 | Agent-Backend/Storage | Done | 新增 `STORAGE_PROVIDER=local` 模式，通义万相返回远程图片后可下载到 `apps/server/uploads/generated-images/`，通过 `/api/images/:fileName` 只读访问；`StorageService.deleteImage()` 和 `cleanup:expired-images` 支持删除本地文件；新增 `check:image-storage` 固化本地保存/删除验证 | `apps/server/src/modules/image/storage.service.ts`, `apps/server/src/modules/image/image.controller.ts`, `apps/server/src/modules/image/image.module.ts`, `apps/server/scripts/cleanup-expired-images.mjs`, `apps/server/scripts/check-image-storage.mjs`, `apps/server/scripts/check-runtime-config.mjs`, `apps/server/.env.example`, `.gitignore`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:image-storage`; `npm run check:config`; `node --check apps/server/scripts/cleanup-expired-images.mjs`; `npm run prisma:validate` | 2026-07-04 |
| 阿里云 OSS 图片存储接口 | Agent-Backend/Storage | Done | `STORAGE_PROVIDER=oss` 已接入阿里云 OSS V1 签名上传和删除：远程图片下载后生成 `OSS_OBJECT_PREFIX` 下的对象 key，使用签名 `PUT` 上传并返回 OSS/CDN 公开 URL；历史删除、账号删除和过期清理复用 `deleteImage()` 对同一 object key 发起签名 `DELETE`；配置检查新增 `OSS_ENDPOINT`、`OSS_PUBLIC_BASE_URL` 和 prefix 校验，`check:image-storage` 用 mock HTTP 验证 OSS 请求生成，无需真实账号 | `apps/server/src/modules/image/storage.service.ts`, `apps/server/scripts/check-image-storage.mjs`, `apps/server/scripts/check-runtime-config.mjs`, `apps/server/.env.example`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:image-storage`; `npm run check:config`; `ENV_FILE=apps/server/.env.example npm run check:config`; `git diff --check` | 2026-07-05 |
| S3-compatible 图片存储接口 | Agent-Backend/Storage | Done | `STORAGE_PROVIDER=s3` / `s3-compatible` 已接入 path-style URL 和 AWS Signature V4 上传删除：远程图片下载后生成 `S3_OBJECT_PREFIX` 下的 object key，使用签名 `PUT` 上传并返回 `S3_PUBLIC_BASE_URL` 或 endpoint/bucket 公开 URL；历史删除、账号删除和过期清理复用 `deleteImage()` 发起签名 `DELETE`；配置检查新增 S3 bucket、endpoint、key、public base 和 prefix 校验，`check:image-storage` 用 mock HTTP 验证 SigV4 请求生成，无需真实账号 | `apps/server/src/modules/image/storage.service.ts`, `apps/server/scripts/check-image-storage.mjs`, `apps/server/scripts/check-runtime-config.mjs`, `apps/server/.env.example`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:image-storage`; `npm run check:config`; `ENV_FILE=apps/server/.env.example npm run check:config`; `git diff --check` | 2026-07-05 |
| 生图 Prompt 禁令共享与检查 | Agent-AI/Backend/QA | Done | 将生图中英文硬性禁令抽为 `packages/prompts` 共享 helper，真实 LLM 生图 prompt 和后端 mock 保存的 `imagePrompt` 都包含 no text/no letters/no numbers/no labels/no watermark/no UI/no religious symbols/no political symbols 以及中文禁令；新增 `check:image-prompts` 覆盖文本、单词和简洁词卡 mock prompt，并静态确认 `buildImagePrompt()` 复用共享要求 | `packages/prompts/src/imagePrompt.ts`, `apps/server/src/modules/generation/mock-generator.ts`, `apps/server/scripts/check-image-prompts.mjs`, `apps/server/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/check-image-prompts.mjs`; `npm run build:server`; `npm run check:image-prompts`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 前端统一错误码展示 | Agent-Frontend/QA | Done | 前端新增 `getUserFacingErrorMessage()` 和 `shouldOpenAuthForError()`，生成/重新生成流程改为复用 `@memory-palace/shared` 的统一错误码标签；`UNAUTHORIZED` 会重新弹出登录弹窗，本地额度不足映射为 `QUOTA_EXCEEDED` 文案；UI smoke 新增单词超限错误提示断言 | `apps/mobile/src/utils/apiError.ts`, `apps/mobile/src/pages/TextMemoryPage.tsx`, `apps/mobile/src/pages/WordCardPage.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `apps/mobile/scripts/smoke-ui.mjs`, `apps/mobile/package.json`, `package-lock.json`, `README.md`, `SPEC.md` | `npm run build:mobile`; `node --check apps/mobile/scripts/smoke-ui.mjs`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui` | 2026-07-04 |
| 后端错误码共享覆盖检查 | Agent-Backend/Frontend/QA | Done | 补齐真实 LLM/生图/存储路径可能返回的共享错误码：`AI_SCHEMA_INVALID`、`AI_ANCHOR_INVALID`、`AI_ANCHOR_DUPLICATED`、`LLM_REQUEST_FAILED`、`LLM_EMPTY_RESPONSE`、`IMAGE_STORAGE_FAILED`；`HttpErrorFilter` 默认错误映射统一回 `INVALID_INPUT` / `INTERNAL_ERROR`；新增 `check:error-codes` 扫描后端源码显式业务码并确认 `packages/shared` 的 `ErrorCode` 与 `ErrorLabels` 已覆盖 | `packages/shared/src/errors.ts`, `apps/server/src/common/filters/http-error.filter.ts`, `apps/server/scripts/check-error-codes.mjs`, `apps/server/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/check-error-codes.mjs`; `npm run check:error-codes`; `npm run build:server`; `npm run build:mobile`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 移动端敏感权限静态检查 | Agent-Release/Compliance | Done | 新增 `check:permissions`，扫描 Android manifest 和已生成 iOS Info.plist，禁止定位、相机、麦克风、通讯录、日历、短信、电话、蓝牙、NFC、通知、跟踪等敏感权限/用途描述；当前 Android manifest 只允许 `android.permission.INTERNET`，符合 MVP 不默认申请敏感权限要求 | `apps/mobile/scripts/check-permissions.mjs`, `apps/mobile/package.json`, `package.json`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-permissions.mjs`; `npm run check:permissions`; `npm run build:mobile` | 2026-07-04 |
| MVP 内容安全规则增强 | Agent-Backend/Compliance | Done | 将生成接口内容安全从简单正则扩展为分类规则表，覆盖色情低俗、血腥暴力、自伤自杀、违法犯罪、宗教/政治符号和中国大陆合规风险；新增 `check:content-safety` 构建后验证脚本，确保统一返回 `CONTENT_BLOCKED` | `apps/server/src/modules/generation/content-safety.ts`, `apps/server/scripts/check-content-safety.mjs`, `apps/server/package.json`, `package.json`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:content-safety` | 2026-07-04 |
| 后端 AI 模板统一 | Agent-AI/Backend | Done | 后端 LLM prompt 和 schema/anchor 校验改为复用 `packages/shared` 的 10 个 canonical templates，替换原先独立维护的 5 模板列表，避免真实 LLM 模式与 SPEC 模板系统分叉；新增 `check:ai-templates` 构建后验证脚本 | `apps/server/src/modules/ai/memory-templates.ts`, `apps/server/scripts/check-ai-templates.mjs`, `apps/server/package.json`, `package.json`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:ai-templates`; `npm run check:content-safety`; `npm run build:mobile`; `npm run prisma:validate` | 2026-07-04 |
| LLM 结构校验重试闭环 | Agent-AI/QA | Done | 将真实 LLM 模式下的 JSON 解析、字段完整性、模板容量和 `anchorKey` 校验纳入同一个重试闭环；新增 `check:ai-retry`，模拟第一次返回合法 JSON 但非法 anchor、第二次返回有效结果，防止只重试解析错误而不重试结构错误 | `apps/server/src/modules/ai/ai.service.ts`, `apps/server/scripts/check-ai-retry.mjs`, `apps/server/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/server/scripts/check-ai-retry.mjs`; `npm run build:server`; `npm run check:ai-retry`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 生产环境 Prompt 与原始 JSON 脱敏 | Agent-Backend/Compliance | Done | 生成记录保存时开发环境继续保留完整 `promptUsed` 便于调试，生产环境改为保存 `[redacted:<hash>]` 标记；`AiUsageLog.rawPrompt` 和 `rawResponse` 统一通过 helper 在生产环境清空，避免保存完整 prompt 或模型原始 JSON；新增 `check:production-redaction` 并纳入 `check:mvp`，防止后续回退为直接持久化 | `apps/server/src/modules/generation/generation.service.ts`, `apps/server/scripts/check-production-redaction.mjs`, `apps/server/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:production-redaction`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 图片生命周期清理 | Agent-Backend/Storage | Done | 新增 `StorageService.deleteImage()` 删除入口；历史单条删除和账号删除会处理关联背景图；新增 `cleanup:expired-images` 脚本，扫描过期背景图并清空记录摘要和结果 JSON 中的 `backgroundImageUrl`，保留历史记录本身 | `apps/server/src/modules/image/storage.service.ts`, `apps/server/src/modules/image/image.module.ts`, `apps/server/src/modules/history/**`, `apps/server/src/modules/user/**`, `apps/server/scripts/cleanup-expired-images.mjs`, `apps/server/package.json`, `package.json`, `README.md`, `SPEC.md` | `npm run build:server`; `node --check apps/server/scripts/cleanup-expired-images.mjs`; `npm run cleanup:expired-images -w apps/server -- --dry-run`; `IMAGE_CLEANUP_DRY_RUN=true npm run cleanup:expired-images`; `npm run prisma:validate`; `npm run smoke:api` | 2026-07-04 |
| 前端主流程 Smoke Test | Agent-QA/Frontend | Done | 新增 Chrome headless UI smoke 脚本，使用稳定 `data-testid` 覆盖首页、文本入口、未登录登录弹窗、测试登录、文本结果页、单词入口、单词超限错误提示和单词结果页；并断言首页 Liquid Glass 卡片无水平溢出、无左右裁切、圆角继承正常，补齐 QA 回归验收中缺少的前端自动化主流程证据 | `apps/mobile/scripts/smoke-ui.mjs`, `apps/mobile/src/pages/HomePage.tsx`, `apps/mobile/src/pages/TextMemoryPage.tsx`, `apps/mobile/src/pages/WordCardPage.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `apps/mobile/src/components/AuthModal.tsx`, `apps/mobile/package.json`, `package.json`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/smoke-ui.mjs`; `npm run build:mobile`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui` | 2026-07-04 |
| 导出 PNG UI Smoke 加固 | Agent-QA/Frontend | Done | UI smoke 在文本结果页新增导出舞台检查：默认 `9:16` 比例、切换 `1:1` 后比例变更、水印文字为 `忆境 MemoryPalace`，并通过拦截下载锚点实际触发一次 `data:image/png` 导出，避免导出按钮、比例切换或水印后续退化但 smoke 仍只检查页面文字 | `apps/mobile/scripts/smoke-ui.mjs`, `apps/mobile/src/components/ExportImageButton.tsx`, `apps/mobile/src/components/MemoryPalaceCanvas.tsx`, `apps/mobile/src/components/WordMemoryCard.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/smoke-ui.mjs`; `npm run build:mobile`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui`; `git diff --check` | 2026-07-05 |
| 历史详情 UI Smoke 加固 | Agent-QA/Frontend | Done | UI smoke 新增历史链路覆盖：生成文本和单词后进入历史页，断言本地历史至少 2 条；收藏首条历史并进入详情页，确认详情页同步已收藏状态且展示模板/详情内容；返回历史后触发删除确认并验证列表数量减少，覆盖 SPEC 验收中的历史查看、详情、收藏和单条删除 | `apps/mobile/scripts/smoke-ui.mjs`, `apps/mobile/src/components/BottomTabBar.tsx`, `apps/mobile/src/pages/HistoryPage.tsx`, `apps/mobile/src/pages/DetailPage.tsx`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/smoke-ui.mjs`; `npm run build:mobile`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui`; `git diff --check` | 2026-07-05 |
| 设置页清缓存/删账号 UI Smoke | Agent-QA/Frontend | Done | UI smoke 新增设置页链路覆盖：确认登录账号状态，触发清除缓存二次确认并验证本地历史记录清空；返回历史页确认空状态；再触发删除账号二次确认，验证账号状态变为未登录且持久化 auth 中 user/token 为空，覆盖 SPEC 验收中的清除缓存和删除账号 | `apps/mobile/scripts/smoke-ui.mjs`, `apps/mobile/src/pages/SettingsPage.tsx`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/smoke-ui.mjs`; `npm run build:mobile`; `UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui`; `git diff --check` | 2026-07-05 |
| 前端密钥泄漏静态检查 | Agent-Frontend/Compliance | Done | 新增 `check:frontend-secrets`，扫描移动端源码、Vite/Capacitor 配置和前端 `.env*`，阻止 LLM、通义万相、OSS/S3、JWT、私钥块等服务端密钥进入前端包；报告只显示文件、行号和密钥类型，不打印疑似密钥值 | `apps/mobile/scripts/check-frontend-secrets.mjs`, `apps/mobile/package.json`, `package.json`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-frontend-secrets.mjs`; `npm run check:frontend-secrets`; `npm run build:mobile`; `git diff --check` | 2026-07-05 |
| 移动端布局静态检查 | Agent-Frontend/QA | Done | 新增 `check:mobile-layout`，覆盖 SPEC 技术验收中的移动端按钮和 safe area 基线：检查 `GlassButton` 至少 44px 触控高度、底部导航至少 48px 触控高度、App/PageShell/BottomTabBar/AuthModal 均保留 safe-area padding，并确认 Liquid Glass 卡片保持动效层绝对铺满、真实内容位于 fallback 层且圆角裁切不退化；已纳入 root `check:mvp` | `apps/mobile/scripts/check-mobile-layout.mjs`, `apps/mobile/package.json`, `package.json`, `scripts/check-mvp.mjs`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-mobile-layout.mjs`; `npm run check:mobile-layout`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 隐私政策与用户协议 MVP 草稿 | Agent-Compliance/Frontend | Done | 将隐私政策和用户协议从占位单段落扩展为可展示 MVP 草稿，覆盖数据收集、用途、30 天背景图保存、历史/账号删除、权限最小化、第三方服务、未成年人使用、AI 学习辅助边界和中国大陆内容合规要求；正式发布前仍需法律审核 | `apps/mobile/src/pages/PrivacyPage.tsx`, `apps/mobile/src/pages/TermsPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `git diff --check` | 2026-07-05 |
| 原生发布环境自检 | Agent-Release/QA | Done | 新增 `check:release-env`，检测 Node/npm、Capacitor 配置、Android 工程、Java、Android SDK、iOS 工程、Xcode 和 CocoaPods；默认报告当前阻塞项但不失败，`--strict` 可作为发布门禁失败，方便多个 agent 接手打包前快速定位环境缺口 | `apps/mobile/scripts/check-release-env.mjs`, `apps/mobile/package.json`, `package.json`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-release-env.mjs`; `npm run check:release-env`; `npm run build:mobile`; `git diff --check` | 2026-07-05 |
| 广告与追踪 SDK 静态检查 | Agent-Compliance/QA | Done | 新增 `check:tracking-sdk`，扫描移动端依赖、root lockfile、Android manifest/Gradle 和 iOS Info.plist/Podfile，发现广告、归因、统计追踪、ATT 或 SKAdNetwork 相关 SDK/配置时失败，支撑 MVP 无广告 SDK、无无关追踪 SDK、无无关 SDK 验收 | `apps/mobile/scripts/check-tracking-sdk.mjs`, `apps/mobile/package.json`, `package.json`, `README.md`, `SPEC.md` | `node --check apps/mobile/scripts/check-tracking-sdk.mjs`; `npm run check:tracking-sdk`; `npm run build:mobile`; `git diff --check` | 2026-07-05 |
| MVP 静态验收聚合命令 | Agent-QA | Done | 新增 root `check:mvp`，按顺序运行 server build、Prisma validate、配置/CORS 配置/错误码/内容安全/AI 模板/AI 重试/图片 prompt/图片存储/生产配置规则/生产脱敏/部署配置检查、mobile build、前端密钥/移动端布局/移动端运行配置/权限/广告追踪 SDK/发布元数据检查和发布环境报告；作为多个 agent 交接前的快速静态门禁，不替代需要运行服务的 `smoke:api` 与 `smoke:ui` | `scripts/check-mvp.mjs`, `package.json`, `README.md`, `SPEC.md` | `node --check scripts/check-mvp.mjs`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 单词卡片高级模式 | Agent-Frontend/Backend | Done | 单词生成页新增高级卡片模式选择，支持场景记忆图、联想记忆图和简洁信息卡；请求会携带 `cardMode`，移动端 mock 与后端 mock 在 `simple` 模式下优先使用 `blank_word_card_30` 空白词卡模板，UI smoke 覆盖高级选项展开和模式选择 | `apps/mobile/src/pages/WordCardPage.tsx`, `apps/mobile/src/mocks/wordMock.ts`, `apps/mobile/scripts/smoke-ui.mjs`, `apps/server/src/modules/generation/mock-generator.ts`, `apps/server/src/modules/ai/ai.service.ts`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run build:server`; `node --check apps/mobile/scripts/smoke-ui.mjs`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 单词卡片模式重新生成保持 | Agent-Frontend/Backend/QA | Done | 单词结果 JSON 新增保存 `cardMode`；结果页本地重新生成和后端 `POST /generation/:id/regenerate` 都会延续原卡片模式，旧记录缺字段时根据 `blank_word_card_30` 推断为 `simple`，否则回退 `scene`；后端 smoke 覆盖简洁信息卡生成与重新生成保持 | `apps/mobile/src/types/index.ts`, `packages/shared/src/types.ts`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `apps/mobile/src/mocks/wordMock.ts`, `apps/server/src/modules/generation/mock-generator.ts`, `apps/server/src/modules/ai/ai.service.ts`, `apps/server/src/modules/generation/generation.service.ts`, `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `npm run check:mvp`; `node --check apps/server/scripts/smoke-api.mjs`; `git diff --check` | 2026-07-05 |
| 历史与账号操作错误反馈 | Agent-Frontend | Done | 历史页和详情页的读取/收藏/删除操作改为展示用户可见错误；删除历史和删除账号在真实后端失败时不再静默清除本地状态或退出账号，避免用户误以为远端删除成功；设置页删除账号复用统一错误文案 | `apps/mobile/src/pages/HistoryPage.tsx`, `apps/mobile/src/pages/DetailPage.tsx`, `apps/mobile/src/pages/SettingsPage.tsx`, `README.md`, `SPEC.md` | `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 前端本地历史过期清理 | Agent-Frontend/Privacy | Done | `historyStore` 按 `expiresAt` 自动过滤 localStorage 中已过期的生成记录；持久化恢复、添加记录、收藏更新和单条读取都会清理过期项，无效日期保守保留，补齐前端本地缓存与 30 天保存策略的一致性 | `apps/mobile/src/stores/historyStore.ts`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 后端历史过期过滤 | Agent-Backend/Privacy | Done | 后端历史列表、详情、收藏、删除和重新生成统一只处理 `expiresAt > now` 且未删除的记录；过期记录对用户表现为不存在，避免 30 天保存策略被历史接口或重新生成接口绕过 | `apps/server/src/modules/history/history.service.ts`, `apps/server/src/modules/generation/generation.service.ts`, `README.md`, `SPEC.md` | `npm run build:server`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 导出与分享失败反馈 | Agent-Frontend | Done | 导出 PNG 和分享/保存按钮新增 `onError` 回调，结果页将导出渲染、下载或 Web Share 失败映射为统一 `EXPORT_FAILED` 用户文案；开始新导出/分享时清除旧错误，避免导出失败静默无反馈 | `apps/mobile/src/components/ExportImageButton.tsx`, `apps/mobile/src/components/ShareImageButton.tsx`, `apps/mobile/src/pages/GenerateResultPage.tsx`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 登录状态持久化收窄 | Agent-Frontend/Privacy | Done | `authStore` 持久化范围收窄为必要的 `user` 和 `token`，不再跨刷新保存登录弹窗开关或待执行动作；退出登录时同步清理弹窗状态和 pending action，降低 UI 临时状态残留风险 | `apps/mobile/src/stores/authStore.ts`, `README.md`, `SPEC.md` | `npm run build:mobile`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |
| 删除账号后旧 Token 失效 | Agent-Backend/QA | Done | `JwtAuthGuard` 在校验 JWT 签名后继续确认用户仍存在且 `deletedAt` 为空；删除账号后旧 token 调用受保护接口会稳定返回 `UNAUTHORIZED`，避免已删除账号继续访问或触发下游外键错误；后端 smoke 增加删除账号后旧 token 被拒绝断言 | `apps/server/src/modules/auth/jwt-auth.guard.ts`, `apps/server/scripts/smoke-api.mjs`, `README.md`, `SPEC.md` | `npm run build:server`; `node --check apps/server/scripts/smoke-api.mjs`; `npm run check:mvp`; `git diff --check` | 2026-07-05 |

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
| In Progress | Agent-AI | 2026-07-05 | LLM 接入代码、prompt、JSON 解析 + schema/anchor 校验重试链路已完成；真实 API 调用需配置 `LLM_API_KEY` 后验证 |

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
| In Progress | Agent-AI/Backend | 2026-07-05 | 通义万相调用入口、存储抽象、本地/OSS/S3-compatible provider、共享生图 prompt 禁令和 `check:image-prompts` 已完成；真实生图和真实对象存储需配置 Key/账号后验证 |

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
| In Progress | Agent-Release | 2026-07-05 | iOS 依赖、脚本、配置、占位资源和发布元数据静态检查已完成；`cap add ios` 因 CocoaPods 未安装而无法生成 Xcode 工程 |

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
| `AI_SCHEMA_INVALID` | LLM 字段缺失或非法 | 提示手动重试 |
| `AI_ANCHOR_INVALID` | LLM 返回非法点位 | 提示手动重试 |
| `AI_ANCHOR_DUPLICATED` | LLM 返回重复点位 | 提示手动重试 |
| `LLM_REQUEST_FAILED` | LLM 请求失败 | 提示稍后重试 |
| `LLM_EMPTY_RESPONSE` | LLM 返回为空 | 提示手动重试 |
| `IMAGE_GENERATION_FAILED` | 生图失败 | 提示手动重试 |
| `IMAGE_STORAGE_FAILED` | 图片保存失败 | 提示手动重试 |
| `EXPORT_FAILED` | 导出失败 | 提示重试 |
| `INVALID_INPUT` | 通用输入不合法 | 提示检查输入 |
| `QUOTA_EXCEEDED` | 生成次数用完 | 提示次数不足 |
| `NOT_FOUND` | 记录不存在或已过期 | 提示未找到 |
| `INTERNAL_ERROR` | 服务端内部错误 | 提示稍后重试 |

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
- 正式云厂商、公网域名、HTTPS 证书和反向代理配置。
- 软著、App 备案、ICP 备案、公网域名。
