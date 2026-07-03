# iOS Setup

当前项目已完成 Capacitor iOS 侧的项目配置和依赖准备。

## 已完成

- `@capacitor/ios` 已加入依赖。
- `capacitor.config.ts` 已配置：
  - `appId`: `cn.memorypalace.yijing`
  - `appName`: `忆境`
  - `webDir`: `dist`
  - iOS `contentInset: automatic`
- 预留 App 图标和启动页源文件：
  - `src/assets/app-icon.svg`
  - `src/assets/splash.svg`

## 本机环境要求

要生成并运行 iOS Xcode 工程，本机需要：

- 完整 Xcode，而不是仅 Command Line Tools。
- CocoaPods。

当前机器检查结果：

- `xcodebuild` 指向 Command Line Tools，缺完整 Xcode。
- `pod` 命令不存在，CocoaPods 未安装。

## 后续命令

安装好 Xcode 和 CocoaPods 后执行：

```bash
cd /Users/rising/Desktop/YiJing
npm run build:mobile
npm run cap:add:ios -w apps/mobile
npm run cap:sync:ios -w apps/mobile
```

然后用 Xcode 打开：

```bash
open apps/mobile/ios/App/App.xcworkspace
```
