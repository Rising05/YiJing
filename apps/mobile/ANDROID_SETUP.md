# Android Setup

当前项目已完成 Capacitor Android 工程生成。

## 已完成

- `@capacitor/android` 已加入依赖。
- `apps/mobile/android/` 已生成。
- `npm run cap:sync:android -w apps/mobile` 已预留。
- Web 构建产物已同步到 Android assets。
- Release 签名模板 `apps/mobile/android/keystore.properties.example` 已提供。
- `npm run check:android-release-config` 会检查签名模板、Gradle 接线和 keystore 防提交规则。
- Debug APK、未签名 Release APK 与未签名 Release AAB 已通过 Gradle 构建验证。

## 本机环境要求

要构建 APK/AAB 或在模拟器/真机运行，需要：

- Android Studio。
- Android SDK。
- Java JDK。
- `ANDROID_HOME` 或 Android Studio 自动配置。

当前机器检查结果（2026-07-11）：

- OpenJDK 21.0.11。
- Android SDK：`/Users/rising/Library/Android/sdk`。
- `npm run check:release-env -w apps/mobile -- --strict` 通过。

## 后续命令

日常构建执行：

```bash
cd /Users/rising/Desktop/YiJing
npm run build:android:debug
npm run build:android:release
```

输出位置：

- Debug APK：`apps/mobile/android/app/build/outputs/apk/debug/app-debug.apk`（Android Debug 签名）。
- Release APK：`apps/mobile/android/app/build/outputs/apk/release/app-release-unsigned.apk`。
- Release AAB：`apps/mobile/android/app/build/outputs/bundle/release/app-release.aab`（未签名）。

打开 Android Studio：

```bash
open -a "Android Studio" apps/mobile/android
```

## Release 签名配置

生成正式包前，在安全位置生成或取得 release keystore，然后复制模板：

```bash
cp apps/mobile/android/keystore.properties.example apps/mobile/android/keystore.properties
```

填写真实值：

```properties
storeFile=/absolute/path/to/yijing-release.jks
storePassword=真实密码
keyAlias=yijing
keyPassword=真实密码
```

注意：

- `apps/mobile/android/keystore.properties` 和 `*.jks` / `*.keystore` 已加入 `.gitignore`，不要提交真实签名文件或密码。
- `storeFile` 建议使用绝对路径，keystore 文件放在仓库外的安全位置。
- 如果没有 `keystore.properties`，debug 构建不受影响；release 构建会保持未签名或由 Android Studio 本地配置处理。

配置真实 keystore 后可重新运行：

```bash
npm run check:android-release-config
npm run build:android:release
```

未配置 `keystore.properties` 时，`build:android:release` 只验证 Release 编译与打包并输出未签名产物，不能直接上架。正式发布前必须配置并安全保存真实 keystore，再验证签名证书和应用市场安装包。

该 npm 命令内部依次执行 Gradle `assembleRelease` 和 `bundleRelease`；保留这两个任务名，便于在 Android Studio/CI 中直接定位 APK 与 AAB 构建阶段。
