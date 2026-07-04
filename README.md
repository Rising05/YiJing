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

测试账号默认有 20 次生成额度。文本记忆宫殿、单词记忆卡片和重新生成都会消耗 1 次；真实后端不可用时，本地 mock 也会按同样规则扣减前端本地额度。

前端当前行为：

- 优先请求后端 mock API。
- 后端或数据库不可用时自动回退本地 mock。
- 生成结果保存到 localStorage。
- 结果页“重新生成”会调用后端重新生成接口；后端不可用时基于当前结果本地 mock 再生成。
- 结果页支持 Web Share 原生分享 PNG；当前环境不支持分享文件时自动下载保存。
- 历史列表和详情页支持收藏；真实后端可用时同步 MySQL，本地 mock 时写入 localStorage。
- 文本生成、单词生成、结果页和关于页都会展示 AI 学习辅助免责声明。
- PNG 导出在浏览器本地合成，不上传服务器。
- 后端校验错误会映射为稳定业务码，例如 `INPUT_TOO_LONG`、`TOO_MANY_WORDS`、`INVALID_INPUT`。
- 单词/短语在前端和后端都会 trim 并按大小写不敏感规则去重。
- 真实生图返回的背景图 URL 会同时保存到生成详情 JSON 和历史摘要字段。
- 历史详情页会展示文本记忆点详情，以及单词的中文释义、音标、例句、视觉物体和记忆提示。
- 清除缓存和删除账号都会先显示二次确认，减少误触风险。
- 删除单条历史记录前会在对应卡片内显示确认操作。
- Android launcher 图标已使用 `apps/mobile/src/assets/logo.png` 生成多密度资源。
- 前端显示版本和 Android `versionName` 当前统一为 `0.1.0`。
- `LiquidGlassCard` 继续封装 `liquid-glass-react`，并保留 CSS 降级层；首页入口卡片的圆角裁切、左右不被截断和无水平溢出已纳入 UI smoke。
- 前端生成流程使用 `@memory-palace/shared` 的统一错误码标签；`UNAUTHORIZED` 会重新弹出登录弹窗，其它已知错误码会显示稳定用户文案。

## 后端运行

复制环境变量：

```bash
cp apps/server/.env.example apps/server/.env
```

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
- JSON 解析失败会按配置重试。
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

后续接阿里云 OSS 时，在 `apps/server/src/modules/image/storage.service.ts` 内补充上传逻辑即可，不需要改 generation service 的调用接口。

历史单条删除和删除账号会调用 `StorageService.deleteImage()` 处理关联背景图。默认 `none/mock` 存储下没有服务端自有对象需要删除；`local` 模式会删除本地文件；接入 OSS 后只需要在 `StorageService` 内补充 vendor SDK 删除逻辑。

预留配置：

```env
OSS_BUCKET=""
OSS_REGION=""
OSS_ACCESS_KEY_ID=""
OSS_ACCESS_KEY_SECRET=""
```

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
npm run prisma:validate
npm run dev:mobile
npm run dev:server
npm run check:ai-templates
npm run check:content-safety
npm run check:config
npm run check:image-storage
npm run cleanup:expired-images
npm run smoke:api
npm run smoke:ui
```

`npm run check:ai-templates` 需要先执行 `npm run build:server`，用于验证后端 AI prompt/校验层使用的是 `packages/shared` 中的 10 个 canonical templates，避免真实 LLM 模式下模板数量和 SPEC 分叉。

`npm run check:content-safety` 需要先执行 `npm run build:server`，用于验证后端 MVP 内容安全规则：正常学习内容应放行，色情低俗、血腥暴力、自伤自杀、违法犯罪、宗教/政治符号和明显违反中国大陆法律法规的内容应返回 `CONTENT_BLOCKED`。

`npm run check:config` 会读取 `apps/server/.env`，不存在时回退 `apps/server/.env.example`，检查后端运行、真实 LLM、通义万相和对象存储配置是否齐全。脚本不会打印 API Key，只报告缺失项、mock 状态和发布前 warning；如需检查其他文件可设置 `ENV_FILE=path/to/.env`。

`npm run check:image-storage` 需要先执行 `npm run build:server`，用于验证 `STORAGE_PROVIDER=local` 的本地图片保存和删除闭环。

`npm run cleanup:expired-images` 会扫描已过 `expiresAt` 且仍保留背景图 URL 的生成记录，先走 `StorageService` 删除接口，再清空数据库摘要和结果 JSON 中的 `backgroundImageUrl`。检查模式可用 `npm run cleanup:expired-images -w apps/server -- --dry-run` 或 `IMAGE_CLEANUP_DRY_RUN=true npm run cleanup:expired-images`。

`npm run smoke:api` 会验证后端主流程：健康检查、测试登录、文本生成、单词生成、重新生成、历史列表、详情、收藏、删除历史和删除账号。运行前需要先启动 MySQL 并完成 Prisma migrate，然后启动后端服务。

`npm run smoke:ui` 使用本机 Chrome headless 跑前端主流程：首页、文本生成入口、未登录弹窗、测试账号登录、结果页、单词生成入口、单词超限错误提示和结果页。运行前需要先启动移动端 dev server，例如：`npm run dev -w apps/mobile -- --host 127.0.0.1`，如需指定地址可设置 `UI_BASE_URL=http://127.0.0.1:5173`。

## 后续 TODO

- 配置真实 LLM API Key 后验证真实 JSON 生成。
- 配置通义万相 API Key 后验证真实生图。
- 接入阿里云 OSS 或更合适的国内对象存储。
- 安装完整 Xcode + CocoaPods 后生成 iOS 工程。
- Android AAB/APK 打包。
- 正式登录：手机号短信 + 微信移动 App 登录。
- 正式合规文案与备案信息。
