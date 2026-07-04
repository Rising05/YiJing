# Android Setup

当前项目已完成 Capacitor Android 工程生成。

## 已完成

- `@capacitor/android` 已加入依赖。
- `apps/mobile/android/` 已生成。
- `npm run cap:sync:android -w apps/mobile` 已预留。
- Web 构建产物已同步到 Android assets。

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

AAB/APK 输出将在 Android Studio 或 Gradle 环境可用后继续配置。
