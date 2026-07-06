# 中国大陆发布准备清单

本清单用于多个 agent 交接发布准备事项。它不是法律意见，正式上架前必须由运营主体、法务或合规顾问按最新监管要求复核。

状态枚举：`Done`、`Ready for QA`、`In Progress`、`Blocked`、`Open`。

## 1. 产品与品牌

| 项目 | 状态 | Owner | 证据/下一步 |
| --- | --- | --- | --- |
| 正式 App 名称 | Open | 用户/Agent-Release | 当前暂定为“忆境”，正式上架前需确认 |
| 正式 logo 与图标资产 | Open | 用户/Agent-Design/Release | Android 当前已有受控源图；正式品牌资产仍需确认 |
| 版本号 | Done | Agent-Release | 前端显示版本、Android `versionName` 当前统一为 `0.1.0` |
| 包名/App ID | Done | Agent-Release | 当前为 `cn.memorypalace.yijing` |

## 2. 账号与登录

| 项目 | 状态 | Owner | 证据/下一步 |
| --- | --- | --- | --- |
| MVP 测试登录 | Done | Agent-Backend/Frontend | 固定验证码测试登录可跑通生成流程 |
| 手机号短信登录 | Open | 用户/Agent-Backend | 需确认短信服务商并配置正式服务 |
| 微信移动 App 登录 | Open | 用户/Agent-Backend | 需配置微信开放平台移动应用信息 |
| 正式登录未配置拦截 | Done | Agent-Backend/QA | `check:auth-providers` 和 API smoke 覆盖 `FEATURE_NOT_CONFIGURED` |

## 3. 合规与用户权利

| 项目 | 状态 | Owner | 证据/下一步 |
| --- | --- | --- | --- |
| 隐私政策 MVP 草稿 | Done | Agent-Compliance/Frontend | `/privacy` 已展示，可被 `check:compliance-copy` 扫描 |
| 用户协议 MVP 草稿 | Done | Agent-Compliance/Frontend | `/terms` 已展示，可被 `check:compliance-copy` 扫描 |
| 正式法律审核 | Open | 用户/法务 | 正式发布前需补充运营主体、联系方式、争议处理、付费规则 |
| AI 学习辅助免责声明 | Done | Agent-Compliance/Frontend | 文本生成、单词生成、结果页、关于页均展示 |
| 删除账号入口 | Done | Agent-Frontend/Backend | 设置页二次确认，后端删除账号后旧 token 失效 |
| 清除缓存入口 | Done | Agent-Frontend | 设置页二次确认，UI smoke 覆盖 |
| 30 天图片保存策略 | Done | Agent-Backend/Frontend | 本地历史过期过滤、后端过期过滤、清理脚本已实现 |
| 内容安全规则 | Done | Agent-Backend/Compliance | 覆盖色情低俗、血腥暴力、自伤自杀、违法犯罪、宗教/政治符号、中国大陆合规风险 |
| 敏感权限最小化 | Done | Agent-Release/Compliance | `check:permissions` 禁止定位、相机、麦克风、通讯录、短信、通知、跟踪等权限 |
| 无广告/无追踪 SDK | Done | Agent-Compliance/QA | `check:tracking-sdk` 扫描依赖、lockfile 和原生配置 |

## 4. AI、图片与数据

| 项目 | 状态 | Owner | 证据/下一步 |
| --- | --- | --- | --- |
| LLM 接入代码 | In Progress | Agent-AI | OpenAI-compatible client、prompt、schema/anchor 校验和重试已完成 |
| 真实 LLM Key 验证 | Open | 用户/Agent-AI | 配置 `LLM_API_KEY` 后运行 `LIVE_AI_SMOKE=true npm run smoke:live-ai` 验证真实 JSON 生成和 usage log |
| 通义万相接入代码 | In Progress | Agent-AI/Backend | HTTP 同步调用入口、prompt 禁令、mock 和存储抽象已完成 |
| 真实通义万相验证 | Open | 用户/Agent-AI | 配置 `IMAGE_MOCK_MODE=false` 与 `WANX_API_KEY` 后运行 `LIVE_AI_SMOKE=true npm run smoke:live-ai` 验证真实生图和 usage log |
| 对象存储最终供应商 | Open | 用户/Agent-Backend | 需确认 OSS 或 S3-compatible 账号、公开域名和删除策略 |
| 生产脱敏 | Done | Agent-Backend/Compliance | `check:production-redaction` 防止生产保存完整 prompt 或原始响应 |

## 5. 云服务器、域名与备案

| 项目 | 状态 | Owner | 证据/下一步 |
| --- | --- | --- | --- |
| 生产 Docker 骨架 | Done | Agent-Backend/Release | `apps/server/Dockerfile` 与 `docker-compose.prod.example.yml` 已提供 |
| Nginx HTTPS 反向代理模板 | Done | Agent-Backend/Release | `deploy/nginx/yijing.conf.example` 已提供 |
| 正式云厂商 | Open | 用户/Agent-Release | 待确认 |
| 公网域名 | Open | 用户/Agent-Release | 待确认，并替换模板中的 `yijing.example.com` |
| HTTPS 证书 | Open | 用户/Agent-Release | 待确认，并替换模板证书路径 |
| ICP 备案 | Open | 用户/运营主体 | 待正式域名和主体信息确认 |
| App 备案 | Open | 用户/运营主体 | 待正式主体、包名、域名、隐私政策等资料确认 |
| 公安联网备案 | Open | 用户/运营主体 | 视正式部署与当地要求确认 |
| 软著 | Open | 用户/运营主体 | 视上架和商业计划确认 |

## 6. 原生打包

| 项目 | 状态 | Owner | 证据/下一步 |
| --- | --- | --- | --- |
| Android 工程 | Done | Agent-Release | `apps/mobile/android` 已生成 |
| Android APK/AAB 构建 | Blocked | 用户/Agent-Release | 当前缺 Java 与 Android SDK |
| iOS 工程 | Blocked | 用户/Agent-Release | 当前缺完整 Xcode 与 CocoaPods |
| 发布环境报告 | Done | Agent-Release/QA | `npm run check:release-env` 会报告本机阻塞项 |

## 7. 发布前建议验证命令

```bash
npm run check:mvp
npm run smoke:api
npm run smoke:live-ai
npm run smoke:ui
npm run check:release-env -w apps/mobile -- --strict
```

`check:mvp` 是静态门禁；`smoke:api` 需要 MySQL、migrate 和后端服务；`smoke:live-ai` 需要真实 AI Key、后端服务和显式 `LIVE_AI_SMOKE=true`；`smoke:ui` 需要前端 dev server；`check:release-env --strict` 需要真实本机 Android/iOS 打包环境。
