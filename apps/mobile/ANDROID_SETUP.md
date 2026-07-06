# Android Setup

当前项目已完成 Capacitor Android 工程生成。

## 已完成

- `@capacitor/android` 已加入依赖。
- `apps/mobile/android/` 已生成。
- `npm run cap:sync:android -w apps/mobile` 已预留。
- Web 构建产物已同步到 Android assets。
- Release 签名模板 `apps/mobile/android/keystore.properties.example` 已提供。
- `npm run check:android-release-config` 会检查签名模板、Gradle 接线和 keystore 防提交规则。

## 本机环境要求

要构建 APK/AAB 或在模拟器/真机运行，需要：

- Android Studio。
- Android SDK。
- Java JDK。
- `ANDROID_HOME` 或 Android Studio 自动配置。

当前机器检查结果：

- `java -version` 报错：Unable to locate a Java Runtime。
- `ANDROID_HOME` 为空。

## 后续命令

安装好 Android Studio 和 JDK 后执行：

```bash
cd /Users/rising/Desktop/YiJing
npm run build:mobile
npm run cap:sync:android -w apps/mobile
```

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

本机安装好 Java 与 Android SDK 后可运行：

```bash
npm run build:mobile
npm run cap:sync:android -w apps/mobile
npm run check:android-release-config
cd apps/mobile/android
./gradlew bundleRelease
./gradlew assembleRelease
```
