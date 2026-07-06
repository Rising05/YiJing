# 忆境 MemoryPalace

忆境 MemoryPalace 是一个面向中小学生和大学生的 AI 记忆辅助 App。用户输入背诵文本、古文诗词或英语单词/短语后，系统生成“文本记忆宫殿”或“单词记忆卡片”，帮助用户通过视觉结构复习和导出。

当前仓库按 `SPEC.md` 分阶段实现。已完成前端 mock 闭环、NestJS mock 后端、LLM 接入代码框架、通义万相生图代码框架、iOS/Android Capacitor 准备和生成次数扣减。

## 技术栈

前端：

- React 19
- TypeScript
- Vite
- Capacitor
- React Router
- Zustand
- Tailwind CSS
- Framer Motion
- `liquid-glass-react`
- `html-to-image`

后端：

- Node.js
- NestJS
- TypeScript
- Prisma
- MySQL
- OpenAI-compatible LLM client
- 通义万相 HTTP client

## 项目结构

```txt
.
├── apps/
│   ├── mobile/          # React + Vite + Capacitor 前端
│   └── server/          # NestJS + Prisma 后端
├── packages/
│   └── prompts/         # LLM 和生图 prompt 模板
├── SPEC.md              # 产品与工程规格、实时进度台账
├── docker-compose.yml   # MySQL 本地开发配置
├── package.json
└── README.md
```

## 本地环境

建议使用仓库已验证过的 Node 24 或稳定 LTS Node。当前开发中使用 npm workspaces。

安装依赖：

```bash
npm install --cache .npm-cache
```

如果系统 npm cache 权限异常，继续使用项目内 `.npm-cache`，不要强行修改全局缓存。

## 前端运行

```bash
npm run dev:mobile
```

默认地址：

```txt
http://localhost:5173/
```

构建：

```bash
npm run build:mobile
```

前端登录测试账号：

```txt
手机号：13800000000
验证码：123456
```

测试账号默认有 20 次生成额度；每次使用测试验证码登录都会恢复到 20 次，便于 MVP 反复验收。文本记忆宫殿、单词记忆卡片和重新生成都会消耗 1 次；真实后端不可用时，本地 mock 也会按同样规则扣减前端本地额度。

前端当前行为：

- 优先请求后端 mock API。
- 开发环境下，后端或数据库不可用时自动回退本地 mock；生产发布环境禁止本地 mock 登录、生成和重新生成回退，必须连接服务端后才能继续。
- 本地登录状态只持久化 `user` 和 `token`，不会跨刷新保存登录弹窗开关或待执行动作。
- 测试登录失败统一使用 `INVALID_INPUT` 错误码，避免出现后端私有错误码。
- 后端已预留正式短信和微信登录端点：`POST /api/auth/sms-code`、`POST /api/auth/sms-login`、`POST /api/auth/wechat-login`。在短信服务商和微信开放平台未配置前，这些端点统一返回 `FEATURE_NOT_CONFIGURED`，不会误发 token 或创建正式用户。
- 后端生产配置检查支持 `AUTH_FORMAL_PROVIDERS=none|sms|wechat|sms,wechat`：保持 `none` 时正式登录继续关闭；启用 `sms` 或 `wechat` 时必须补齐短信服务商或微信开放平台配置，否则 `check:config -- --production` 会失败。
- 后端测试登录会补齐 20 次生成额度；API smoke 会先临时耗尽额度，再重新登录验证额度恢复，并断言文本生成、单词生成和两次重新生成按 `20/0 -> 19/1 -> 18/2 -> 17/3 -> 16/4` 精确扣减。
- 额度耗尽统一使用 `QUOTA_EXCEEDED` 错误码；后端 API smoke 会临时置 0 测试用户额度并验证拒绝生成。
- 生成结果保存到 localStorage。
- 结果页“重新生成”会调用后端重新生成接口；后端不可用时基于当前结果本地 mock 再生成。
- 结果页支持 Web Share 原生分享 PNG；当前环境不支持分享文件时自动下载保存。
- 结果页导出 PNG 和分享/保存失败时会展示用户可见错误，并复用统一 `EXPORT_FAILED` 文案。
- 历史列表和详情页支持收藏；真实后端可用时同步 MySQL，本地 mock 时写入 localStorage。
- 历史读取、收藏、删除和删除账号失败时会展示用户可见错误；删除类后端操作失败时不会提前清除本地状态或退出账号。
- 本地历史缓存会按 `expiresAt` 自动过滤过期记录，避免 localStorage 无限保留超过 30 天的生成结果。
- 后端历史列表、详情、收藏、删除和重新生成都会过滤过期记录，过期内容对用户表现为不存在。
- 后端 JWT 守卫会校验用户仍存在且未删除；删除账号后旧 token 会稳定返回 `UNAUTHORIZED`。
- 文本生成、单词生成、结果页和关于页都会展示 AI 学习辅助免责声明。
- PNG 导出在浏览器本地合成，不上传服务器。
- 后端校验错误会映射为稳定业务码，例如 `INPUT_TOO_LONG`、`TOO_MANY_WORDS`、`INVALID_INPUT`。
- `npm run check:auth-providers` 会检查测试登录仍可用、正式短信/微信端点已预留且未配置时稳定返回 `FEATURE_NOT_CONFIGURED`。
- `npm run check:error-codes` 会扫描后端源码中抛出的业务错误码，并确认共享包和前端文案已覆盖。
- 单词/短语在前端和后端都会 trim 并按大小写不敏感规则去重。
- 单词记忆卡片支持高级卡片模式：场景记忆图、联想记忆图、简洁信息卡；简洁信息卡会优先使用 `blank_word_card_30` 空白词卡模板。
- 单词结果会保存 `cardMode`，重新生成时会延续原卡片模式；旧记录缺少该字段时会根据 `blank_word_card_30` 推断为简洁信息卡。
- 真实生图返回的背景图 URL 会同时保存到生成详情 JSON 和历史摘要字段。
- 历史详情页会展示文本记忆点详情，以及单词的中文释义、音标、例句、视觉物体和记忆提示。
- `npm run smoke:ui` 已覆盖历史列表、历史详情、收藏状态同步和单条历史删除确认。
- 清除缓存和删除账号都会先显示二次确认；`npm run smoke:ui` 已覆盖清缓存后历史为空、删除账号后退出登录。
- 删除单条历史记录前会在对应卡片内显示确认操作。
- 隐私政策和用户协议已补齐 MVP 草稿，覆盖数据收集、保存删除、权限、第三方服务、AI 辅助边界、未成年人提示和中国大陆内容合规要求；正式发布前仍需法律审核。
- `npm run check:compliance-copy` 会扫描隐私政策、用户协议、AI 免责声明、设置页入口和合规页面路由，防止 MVP 关键合规文案被误删。
- `npm run check:tracking-sdk` 会扫描移动端依赖、lockfile 和原生配置，防止广告、归因、统计追踪、ATT、SKAdNetwork 等无关 SDK 进入 MVP。
- Android launcher 图标已使用 `apps/mobile/src/assets/logo.png` 生成多密度资源。
- 前端显示版本和 Android `versionName` 当前统一为 `0.1.0`。
- `npm run check:release-metadata` 会校验 Capacitor appId/App 名、Android applicationId/namespace/strings、前端版本和 Android `versionName` 是否一致。
- `LiquidGlassCard` 继续封装 `liquid-glass-react`，但真实内容层已和库动效层解耦：库只负责绝对铺满的玻璃背景，我们自己的 `.glass-fallback` 负责圆角、边框、阴影和内容布局；首页入口卡片圆角裁切、左右不被截断、fallback 位于动效层之上、内容层本身圆角裁切、禁止 fallback 回到库内部 wrapper 和无水平溢出已纳入 390px/569px UI smoke。
- 前端生成流程使用 `@memory-palace/shared` 的统一错误码标签；`UNAUTHORIZED` 会重新弹出登录弹窗，其它已知错误码会显示稳定用户文案。
- `npm run check:frontend-secrets` 会扫描移动端源码、Vite/Capacitor 配置和前端 `.env*`，防止 LLM、通义万相、OSS/S3、JWT 等密钥被放进前端包。
- `npm run check:mobile-layout` 会检查移动端 safe area、44px 以上按钮触控高度、底部导航触控高度，以及 Liquid Glass 内容层/动效层/首页标注内容层布局约束。
- 移动端发布构建必须配置 `VITE_API_BASE_URL`，开发环境未配置时才会 fallback 到 `http://localhost:3000/api`；生产缺失时 API client 会返回明确的 `API_BASE_URL_MISSING` 错误。

## 后端运行

复制环境变量：

```bash
cp apps/server/.env.example apps/server/.env
```

生产部署前可从生产模板复制一份单独填写：

```bash
cp apps/server/.env.production.example apps/server/.env.production
ENV_FILE=apps/server/.env.production npm run check:config -w apps/server -- --production
```

生产检查会要求 `NODE_ENV=production`、真实 JWT Secret、`ALLOWED_ORIGINS` CORS 白名单、关闭 AI/生图 mock、配置 LLM/通义万相 Key，并确保图片有 30 天保留所需的持久化存储配置。正式短信/微信登录默认保持 `AUTH_FORMAL_PROVIDERS=none`；后续启用 `sms` 或 `wechat` 时必须补齐对应服务商配置。脚本只报告缺失项和风险，不会打印密钥值。

启动后端：

```bash
npm run dev:server
```

健康检查：

```bash
curl -s http://localhost:3000/api/health
```

构建：

```bash
npm run build:server
```

生产 Docker 部署骨架：

```bash
cp apps/server/.env.production.example apps/server/.env.production
npm run check:deploy-config
docker compose -f docker-compose.prod.example.yml build server
docker compose -f docker-compose.prod.example.yml up -d
```

`docker-compose.prod.example.yml` 提供 MySQL 8.4、后端容器、启动前 `prisma migrate deploy`、本地图片持久化卷和健康检查。`deploy/nginx/yijing.conf.example` 提供云服务器前置 Nginx HTTPS 反向代理模板，包含 HTTP 到 HTTPS 跳转、`/api/` 转发、`/healthz` 健康检查、HSTS 和 forwarded headers。真实发布时仍需把 `apps/server/.env.production` 中的域名、CORS、JWT、LLM、通义万相和对象存储配置替换为正式值，并把 Nginx 模板中的 `yijing.example.com`、证书路径和服务器端口替换为正式配置。

校验 Prisma schema：

```bash
npm run prisma:validate
```

## MySQL 与 Prisma

启动 MySQL。本仓库当前开发配置使用宿主机 `3307` 映射到容器 `3306`，避免和本机已有 MySQL 冲突：

```bash
docker compose up -d mysql
```

执行迁移：

```bash
npm run prisma:migrate
```

当前已验证状态：

- MySQL 容器名：`yijing-mysql`。
- 本地连接：`mysql://yijing:yijing@localhost:3307/yijing`。
- Prisma migration 已生成在 `apps/server/prisma/migrations/20260704033501_init/`。
- 后端 smoke test 已在 MySQL 可用时通过。

## Mock 模式

后端默认启用 mock：

```env
AI_MOCK_MODE="true"
IMAGE_MOCK_MODE="true"
```

在 mock 模式下：

- LLM 不会真实调用外部模型。
- 通义万相不会真实生图。
- 后端仍会走同一套 DTO、内容安全、结构校验和保存流程。

## 接入 LLM

后端支持 OpenAI-compatible API。配置：

```env
AI_MOCK_MODE="false"
LLM_BASE_URL="https://api.deepseek.com/v1"
LLM_API_KEY="your-api-key"
LLM_MODEL="deepseek-chat"
LLM_JSON_RETRY_COUNT=1
```

要求：

- API Key 只能放在 `apps/server/.env`。
- 前端不得直接请求 LLM。
- LLM 必须输出严格 JSON。
- JSON 解析失败、字段缺失、模板容量或 `anchorKey` 校验失败会按配置重试。
- 后端会校验 `anchorKey`、模板容量、字段完整性。

## 接入通义万相

配置：

```env
IMAGE_MOCK_MODE="false"
WANX_BASE_URL="https://dashscope.aliyuncs.com"
WANX_API_KEY="your-dashscope-api-key"
WANX_MODEL="wan2.6-t2i"
WANX_SIZE="960*1696"
```

当前实现：

- 使用通义万相 V2 HTTP 同步调用入口。
- 默认模型 `wan2.6-t2i`。
- 强制 `watermark:false`。
- negative prompt 禁止文字、数字、标签、水印、UI、宗教符号、政治符号。
- 真实生图 prompt 和后端 mock 保存的 `imagePrompt` 共用同一套中英文硬性禁令，可用 `npm run check:image-prompts` 验证。

## 图片存储

当前默认：

```env
STORAGE_PROVIDER="none"
```

这会直接返回模型图片 URL。开发阶段也可以启用本地持久化存储：

```env
STORAGE_PROVIDER="local"
LOCAL_STORAGE_DIR="uploads/generated-images"
PUBLIC_BASE_URL="http://localhost:3000"
```

`local` 模式会把通义万相返回的远程图片下载到 `apps/server/uploads/generated-images/`，并通过 `/api/images/:fileName` 只读访问。`cleanup:expired-images`、历史单条删除和删除账号都会删除对应本地文件。

也可以配置阿里云 OSS：

```env
STORAGE_PROVIDER="oss"
OSS_BUCKET="your-bucket"
OSS_REGION="oss-cn-hangzhou"
OSS_ENDPOINT=""
OSS_PUBLIC_BASE_URL=""
OSS_OBJECT_PREFIX="generated-images"
OSS_ACCESS_KEY_ID="..."
OSS_ACCESS_KEY_SECRET="..."
```

`oss` 模式会把通义万相返回的远程图片下载后用 OSS 签名 `PUT` 上传到 `OSS_OBJECT_PREFIX`，返回 OSS 公开访问 URL；历史单条删除、删除账号和过期清理会对同一 object key 发送签名 `DELETE`。如使用 CDN 或自定义域名，可配置 `OSS_PUBLIC_BASE_URL`；如使用非默认 endpoint，可配置 `OSS_ENDPOINT`。

也可配置 S3-compatible 国内对象存储：

```env
STORAGE_PROVIDER="s3-compatible"
S3_BUCKET="your-bucket"
S3_REGION="auto"
S3_ENDPOINT="https://s3.example.cn"
S3_PUBLIC_BASE_URL="https://cdn.example.cn/yijing"
S3_OBJECT_PREFIX="generated-images"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
```

`s3` / `s3-compatible` 模式会使用 path-style URL 和 AWS Signature V4 发起 `PUT` / `DELETE`，适合接入提供 S3 兼容 API 的国内对象存储或 CDN 回源方案。

历史单条删除和删除账号会调用 `StorageService.deleteImage()` 处理关联背景图。默认 `none/mock` 存储下没有服务端自有对象需要删除；`local` 模式会删除本地文件；`oss` 模式会删除 OSS 对象；`s3` / `s3-compatible` 模式会删除 S3 object。

## iOS 打包

已完成项目侧准备：

- `@capacitor/ios`
- `capacitor.config.ts`
- 图标/启动页占位源文件
- `apps/mobile/IOS_SETUP.md`

本机还需要：

- 完整 Xcode。
- CocoaPods。

安装好 iOS 环境后执行：

```bash
npm run build:mobile
npm run cap:add:ios -w apps/mobile
npm run cap:sync:ios -w apps/mobile
open apps/mobile/ios/App/App.xcworkspace
```

当前已知阻塞：

- `pod` 命令不存在。
- `xcodebuild` 当前指向 Command Line Tools，不是完整 Xcode。

## Android 打包

Android Capacitor 工程已生成在 `apps/mobile/android/`。本机仍需要 Android Studio、Android SDK 和 Java JDK 才能构建 APK/AAB。

```bash
npm run build:mobile
npm run cap:sync:android -w apps/mobile
open -a "Android Studio" apps/mobile/android
```

详见 `apps/mobile/ANDROID_SETUP.md`。Android AAB 输出会在 Android Studio/JDK 环境可用后继续配置。

当前 Android launcher 图标已生成到 `apps/mobile/android/app/src/main/res/mipmap-*`，源图保存在 `apps/mobile/src/assets/logo.png`。

Android `versionCode` 当前为 `1`，`versionName` 为 `0.1.0`，与前端设置页/关于页显示版本保持一致。

## 中国大陆发布注意事项

发布交接清单见 `docs/release/MAINLAND_RELEASE_CHECKLIST.md`，可用 `npm run check:mainland-release` 检查清单、README、SPEC 和脚本入口是否保持同步。

首版已预留：

- 隐私政策草稿。
- 用户协议草稿。
- 关于我们。
- AI 学习辅助免责声明。
- 删除账号入口。
- 清除缓存入口。
- 不默认申请定位、通讯录、麦克风权限。
- 不接入广告 SDK 或无关追踪 SDK。

后续发布前仍需准备：

- App 备案。
- ICP 备案。
- 公安联网备案视实际部署而定。
- 软著。
- 正式隐私政策和用户协议法律审核。
- 微信开放平台移动应用配置。
- 短信服务供应商。

## 常用命令

```bash
npm run build
npm run build:mobile
npm run build:server
npm run check:auth-providers
npm run check:mvp
npm run prisma:validate
npm run dev:mobile
npm run dev:server
npm run check:ai-templates
npm run check:ai-retry
npm run check:compliance-copy
npm run check:content-safety
npm run check:config
npm run check:cors-config
npm run check:deploy-config
npm run check:env-examples
npm run check:error-codes
npm run check:image-prompts
npm run check:image-storage
npm run check:mainland-release
npm run check:mobile-layout
npm run check:mobile-runtime-config
npm run check:production-config
npm run check:production-redaction
npm run check:permissions
npm run check:release-metadata
npm run check:release-env
npm run check:tracking-sdk
npm run cleanup:expired-images
npm run smoke:api
npm run smoke:live-ai
npm run smoke:ui
```

`npm run check:ai-templates` 需要先执行 `npm run build:server`，用于验证后端 AI prompt/校验层使用的是 `packages/shared` 中的 10 个 canonical templates，避免真实 LLM 模式下模板数量和 SPEC 分叉。

`npm run check:ai-retry` 需要先执行 `npm run build:server`，用于模拟真实 LLM 模式下第一次返回合法 JSON 但非法 `anchorKey`、第二次返回有效结构，确保解析和 schema/anchor 校验处于同一个重试闭环。

`npm run check:image-prompts` 需要先执行 `npm run build:server`，用于验证后端文本、单词、简洁词卡 mock 保存的 `imagePrompt` 和共享真实生图 prompt 均包含 no-text/no-symbol 中英文硬性要求。

`npm run check:mobile-layout` 会检查 `GlassButton`、底部导航、页面壳、登录弹窗和 Liquid Glass 卡片的关键移动端布局约束，覆盖 SPEC 技术验收中的按钮触控高度和 safe area 基线。

`npm run check:mobile-runtime-config` 会检查 `apps/mobile/.env.production.example` 中的 `VITE_API_BASE_URL` 必须是 HTTPS、不能指向 localhost，并确认移动端源码只在开发环境 fallback 到 `http://localhost:3000/api`；本地 mock 登录、生成和重新生成回退也必须受开发环境开关保护，生产发布包不能静默离线生成。

`npm run check:mvp` 会按安全顺序执行主要静态 MVP 门禁：server build、Prisma validate、后端配置/env 示例完整性/CORS 配置/登录渠道预留/错误码/内容安全/AI 模板/AI 重试/图片 prompt/图片存储/生产配置规则/生产脱敏/部署配置检查、大陆发布清单检查、mobile build、前端密钥/移动端布局/移动端运行配置/合规文案/权限/广告追踪 SDK/发布元数据检查，以及原生发布环境报告。它不启动 MySQL、后端服务或浏览器，因此不能替代 `smoke:api` 和 `smoke:ui`。

`npm run check:compliance-copy` 会扫描隐私政策、用户协议、AI 免责声明、设置页入口和合规页面路由，防止 MVP 关键合规文案被误删。

`npm run check:content-safety` 需要先执行 `npm run build:server`，用于验证后端 MVP 内容安全规则：正常学习内容应放行，色情低俗、血腥暴力、自伤自杀、违法犯罪、宗教/政治符号和明显违反中国大陆法律法规的内容应返回 `CONTENT_BLOCKED`。

`npm run check:config` 会读取 `apps/server/.env`，不存在时回退 `apps/server/.env.example`，检查后端运行、正式短信/微信登录开关、真实 LLM、通义万相和对象存储配置是否齐全。脚本不会打印 API Key，只报告缺失项、mock 状态和发布前 warning；如需检查其他文件可设置 `ENV_FILE=path/to/.env`。生产部署前使用 `ENV_FILE=apps/server/.env.production npm run check:config -w apps/server -- --production`，会额外禁止 mock、占位密钥、缺失 CORS 白名单和 localhost 图片公开地址；若 `AUTH_FORMAL_PROVIDERS` 启用 `sms` 或 `wechat`，也会要求对应短信/微信配置完整。

`npm run check:env-examples` 会检查 `apps/server/.env.example` 和 `apps/server/.env.production.example` 的运行时环境变量 key 是否完整、顺序一致、无重复或意外 key，并扫描后端源码中直接引用的环境变量，防止新增运行配置后遗漏模板。`API_BASE_URL`、`LIVE_AI_SMOKE` 等脚本临时变量不会被要求写入服务端运行模板。

`npm run check:cors-config` 需要先执行 `npm run build:server`，用于验证后端 CORS 行为：开发环境未配置 `ALLOWED_ORIGINS` 时允许本地调试，生产环境必须配置明确来源列表并拒绝 `*` 通配符。

`npm run check:auth-providers` 会检查后端 MVP 测试登录和正式登录预留接口：测试登录仍保留，短信验证码、短信登录和微信登录端点存在，但在未接入服务商前必须统一返回 `FEATURE_NOT_CONFIGURED`，避免客户端误认为正式登录已可用。

`npm run check:deploy-config` 会检查服务端 Dockerfile、`.dockerignore`、生产 compose 示例、Nginx HTTPS 反向代理模板、容器内 `prisma migrate deploy`、非 root 运行、健康检查和服务端 `start` 入口，防止生产部署骨架退化。

`npm run check:mainland-release` 会检查 `docs/release/MAINLAND_RELEASE_CHECKLIST.md` 是否覆盖正式名称/logo、短信/微信登录、隐私政策、用户协议、删除账号、30 天保存策略、内容安全、权限、无广告追踪、真实 AI/生图/对象存储、云服务器、域名、HTTPS、备案和原生打包阻塞项，并确认 README/SPEC 已引用该清单。

`npm run check:production-config` 会用临时 env 自测生产配置规则：正式登录关闭的安全生产配置必须通过，正式登录启用且配置齐全的生产配置必须通过，正式登录启用但缺配置、mock/占位/localhost 等不安全配置必须失败。这个检查不需要真实 API Key，也不会连接外部服务。

`npm run check:error-codes` 会扫描 `apps/server/src` 中显式返回或抛出的业务错误码，并确认每个码都在 `packages/shared` 的 `ErrorCode` 和 `ErrorLabels` 中覆盖，防止真实 LLM/生图错误变成前端未知私有码。

`npm run check:image-storage` 需要先执行 `npm run build:server`，用于验证 `STORAGE_PROVIDER=local` 的本地图片保存/删除闭环，以及 `STORAGE_PROVIDER=oss`、`STORAGE_PROVIDER=s3-compatible` 的签名上传/删除请求生成。

`npm run check:production-redaction` 会检查生成记录和 AI 使用日志的生产环境脱敏守卫，防止 `GenerationRecord.promptUsed`、`AiUsageLog.rawPrompt`、`AiUsageLog.rawResponse` 在生产环境直接保存完整 prompt 或模型原始 JSON。

`npm run check:permissions` 会扫描 Capacitor Android manifest 和已生成的 iOS Info.plist，确保 MVP 没有默认申请定位、相机、麦克风、通讯录、日历、短信、通知、跟踪等敏感权限。当前 Android 只允许 `android.permission.INTERNET`。

`npm run check:release-metadata` 会校验当前发布元数据：Capacitor `appId/appName/webDir`、iOS safe area 配置、Android `namespace/applicationId/versionName/versionCode`、Android strings、MainActivity 包名和 manifest launcher 配置。

`npm run check:release-env` 会检查本机原生打包环境，包括 Node/npm、Capacitor 配置、Android 工程、Java、Android SDK、iOS 工程、Xcode 和 CocoaPods。默认只报告阻塞项并返回成功；需要作为发布门禁时可运行 `npm run check:release-env -w apps/mobile -- --strict`。

`npm run check:tracking-sdk` 会扫描移动端 `package.json`、root `package-lock.json`、Android manifest/Gradle 文件和 iOS Info.plist/Podfile，发现广告、归因、统计追踪、ATT 或 SKAdNetwork 相关依赖和配置时失败，支撑 MVP “无广告 SDK / 无无关追踪 SDK”验收。

`npm run cleanup:expired-images` 会扫描已过 `expiresAt` 且仍保留背景图 URL 的生成记录，先走 `StorageService` 删除接口，再清空数据库摘要和结果 JSON 中的 `backgroundImageUrl`。检查模式可用 `npm run cleanup:expired-images -w apps/server -- --dry-run` 或 `IMAGE_CLEANUP_DRY_RUN=true npm run cleanup:expired-images`。

`npm run smoke:api` 会验证后端主流程和关键错误码：健康检查、未登录生成拦截、错误验证码登录拦截、正式短信/微信登录未配置拦截、测试登录、测试登录补齐额度、文本超长、单词超限、内容安全拦截、文本生成、单词生成、重新生成、历史列表、详情、收藏、删除历史、额度耗尽拒绝、删除账号和删除账号后旧 token 拒绝；同时断言四次成功生成后的额度精确变为 `19/1`、`18/2`、`17/3`、`16/4`。运行前需要先启动 MySQL 并完成 Prisma migrate，然后启动后端服务。

`npm run smoke:live-ai` 是真实 AI/生图联调入口，默认会跳过以避免误耗费真实模型或图片额度。启动 MySQL、migrate 和后端服务后，配置 `AI_MOCK_MODE=false`、`LLM_API_KEY`，再设置 `LIVE_AI_SMOKE=true npm run smoke:live-ai` 可通过后端 API 生成一条文本记忆宫殿，并查询数据库 usage log 确认 `openai-compatible` 调用成功。若还配置 `IMAGE_MOCK_MODE=false` 和 `WANX_API_KEY`，脚本会要求返回真实 `backgroundImageUrl` 并确认 `wanx` usage log；如需同时验证单词卡片，增加 `LIVE_AI_SMOKE_FULL=true`。

`npm run smoke:ui` 使用本机 Chrome headless 跑前端主流程：首页、文本生成入口、未登录弹窗、测试账号登录、结果页、导出比例切换、水印和 PNG 下载触发、单词生成入口、单词超限错误提示、单词结果页、历史列表、历史详情、收藏状态同步、单条历史删除确认、清除缓存和删除账号。运行前需要先启动移动端 dev server，例如：`npm run dev -w apps/mobile -- --host 127.0.0.1`，如需指定地址可设置 `UI_BASE_URL=http://127.0.0.1:5173`。

## 后续 TODO

- 配置真实 LLM API Key 后验证真实 JSON 生成。
- 配置通义万相 API Key 后验证真实生图。
- 配置真实 OSS 或 S3-compatible 对象存储账号后验证上传、公开 URL 访问和删除闭环。
- 确认正式云厂商、公网域名、HTTPS 证书，并将 `deploy/nginx/yijing.conf.example` 替换为线上 Nginx 或负载均衡配置。
- 安装完整 Xcode + CocoaPods 后生成 iOS 工程。
- Android AAB/APK 打包。
- 正式登录：手机号短信 + 微信移动 App 登录。
- 正式合规文案与备案信息。
