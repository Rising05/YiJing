# 生产发布资料表

本文件用于正式发布前集中填写运营、合规、云服务和应用商店资料。当前是模板，不代表已经具备正式上架条件。

状态枚举：`TODO`、`Ready for QA`、`Done`、`Blocked`。

## 1. 运营主体

| 项目 | 状态 | 当前值 | 说明 |
| --- | --- | --- | --- |
| 运营主体名称 | TODO | 待填写 | 与备案、隐私政策、应用商店主体保持一致 |
| 统一社会信用代码 | TODO | 待填写 | 企业或个体工商户主体信息 |
| 联系邮箱 | TODO | 待填写 | 隐私政策、用户协议和应用商店支持邮箱 |
| 联系电话 | TODO | 待填写 | 应用商店、备案或用户支持电话 |
| 联系地址 | TODO | 待填写 | 隐私政策和应用商店后台可能要求 |

## 2. 品牌与应用信息

| 项目 | 状态 | 当前值 | 说明 |
| --- | --- | --- | --- |
| 正式 App 名称 | TODO | 忆境 | 当前为暂定名，正式上架前需确认 |
| 副标题/一句话介绍 | TODO | AI 记忆辅助 App | 用于应用商店和官网 |
| 正式 logo 源文件 | TODO | `apps/mobile/src/assets/logo.png` | 当前已有 Android 图标源图，正式品牌资产仍需确认 |
| 包名/App ID | Done | `cn.memorypalace.yijing` | 已写入 Capacitor 和 Android 工程 |
| 首版版本号 | Done | `0.1.0` | 前端显示版本与 Android `versionName` 已一致 |

## 3. 域名、服务器与备案

| 项目 | 状态 | 当前值 | 说明 |
| --- | --- | --- | --- |
| 云服务器厂商 | TODO | 待确认 | 例如阿里云、腾讯云或其他国内可备案云厂商 |
| 部署区域 | TODO | 待确认 | 影响备案、延迟和合规材料 |
| API 域名 | TODO | `api.example.com` | 需替换 `.env.production` 与 Nginx 模板 |
| 官网/落地页域名 | TODO | 待确认 | 隐私政策、用户协议和应用商店可访问 URL |
| HTTPS 证书方案 | TODO | Let's Encrypt 或云厂商证书 | 需记录证书路径或托管方式 |
| ICP 备案号 | TODO | 待备案 | 中国大陆域名上线前必须确认 |
| 公安联网备案号 | TODO | 待确认 | 视正式部署和当地要求确认 |
| App 备案资料 | TODO | 待准备 | 需主体、包名、域名、隐私政策等材料 |

## 4. 外部服务商

| 项目 | 状态 | 当前值 | 说明 |
| --- | --- | --- | --- |
| LLM 服务商 | TODO | OpenAI-compatible | 配置 `LLM_BASE_URL`、`LLM_API_KEY`、`LLM_MODEL` 后运行 live smoke |
| 生图服务商 | TODO | 通义万相 DashScope | 配置 `WANX_API_KEY` 后运行 live smoke |
| 图片对象存储 | TODO | local / OSS / S3-compatible | 正式发布建议确认公开域名、生命周期和删除策略 |
| 短信服务商 | TODO | 待确认 | 启用 `AUTH_FORMAL_PROVIDERS=sms` 前必须配置 |
| 微信开放平台移动应用 | TODO | 待确认 | 启用 `AUTH_FORMAL_PROVIDERS=wechat` 前必须配置 |

## 5. 法务与合规文本

| 项目 | 状态 | 当前值 | 说明 |
| --- | --- | --- | --- |
| 隐私政策正式版 | TODO | MVP 草稿 | 正式发布前需法律审核并补充运营主体、联系方式和第三方服务 |
| 用户协议正式版 | TODO | MVP 草稿 | 正式发布前需法律审核并补充争议处理、付费规则和责任边界 |
| AI 学习辅助免责声明 | Done | 已在主流程展示 | 仍需和正式法务文本保持一致 |
| 未成年人提示 | Ready for QA | 已在隐私政策草稿中展示 | 正式文本需复核 |
| 数据保存与删除策略 | Ready for QA | 生成结果 30 天保存，可手动删除 | 需和隐私政策、服务端清理策略一致 |
| 内容安全规则 | Ready for QA | 已覆盖中国大陆合规风险 | 正式发布前需结合运营审核规则复核 |

## 6. 应用商店与签名

| 项目 | 状态 | 当前值 | 说明 |
| --- | --- | --- | --- |
| Android 签名证书 | TODO | 待生成 | 不要提交 keystore；只记录保管位置和负责人 |
| Android 应用市场 | TODO | 待确认 | 例如应用宝、华为、小米、OPPO、vivo 等 |
| Apple Developer Team | TODO | 待确认 | iOS 上架前需要 |
| iOS Bundle ID | Done | `cn.memorypalace.yijing` | 需和 Apple Developer 后台一致 |
| 应用商店截图 | TODO | 待制作 | 需真实功能截图，不使用误导性素材 |

## 7. 发布前必须验证

```bash
npm run check:mvp
npm run smoke:api
LIVE_AI_SMOKE=true npm run smoke:live-ai
UI_BASE_URL=http://127.0.0.1:5173 npm run smoke:ui
npm run check:release-env -w apps/mobile -- --strict
```

发布前还需要人工确认：

- `.env.production` 不包含占位值、mock 模式、localhost 或通配 CORS。
- `deploy/nginx/yijing.conf.example` 已替换为正式域名、证书路径和上游地址。
- 隐私政策、用户协议、应用商店资料、备案资料中的主体和联系方式一致。
- Android/iOS 签名证书、API Key、对象存储密钥和微信/短信密钥只保存在安全位置，不进入前端包和 Git 仓库。
