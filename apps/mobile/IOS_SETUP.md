# iOS Setup

当前项目已生成 Capacitor iOS 工程，并通过 iOS Simulator Debug 构建与启动验证。

## 已完成

- `@capacitor/ios` 已加入依赖。
- `apps/mobile/ios` Xcode 工程与 CocoaPods lockfile 已生成。
- `capacitor.config.ts` 已配置：
  - `appId`: `cn.memorypalace.yijing`
  - `appName`: `忆境`
  - `webDir`: `dist`
  - iOS `contentInset: automatic`
- 预留 App 图标和启动页源文件：
  - `src/assets/app-icon.svg`
  - `src/assets/splash.svg`
- `@capacitor/share` 已同步到 iOS 原生工程。
- App 已在 iPhone 17 Pro / iOS 26.4 模拟器安装并成功启动。

## 本机环境要求

要同步并运行 iOS Xcode 工程，本机需要：

- 完整 Xcode，而不是仅 Command Line Tools。
- CocoaPods。

当前机器检查结果（2026-07-11）：

- Xcode 26.4，`xcode-select` 指向 `/Applications/Xcode.app/Contents/Developer`。
- CocoaPods 1.16.2。
- `npm run check:release-env -w apps/mobile -- --strict` 通过。

## 后续命令

日常同步后执行：

```bash
cd /Users/rising/Desktop/YiJing
npm run build:mobile
npm run cap:sync:ios -w apps/mobile
npm run build:ios:simulator
```

首次生成工程时才需要 `npm run cap:add:ios -w apps/mobile`，不要在已有工程上重复执行。

然后用 Xcode 打开：

```bash
open apps/mobile/ios/App/App.xcworkspace
```

`npm run build:ios:simulator` 会先构建 Web 包、同步 Capacitor/CocoaPods，再以无签名 iOS Simulator Debug 目标执行 Xcode 构建。真机运行、Archive 和 App Store 发布仍需在 Xcode 中选择 Apple Developer Team 并配置签名。
