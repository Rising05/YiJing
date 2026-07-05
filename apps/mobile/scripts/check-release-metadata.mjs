import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(scriptDir, '..')

const expected = {
  appId: 'cn.memorypalace.yijing',
  appName: '忆境',
}

const packageJson = JSON.parse(read('package.json'))
const appVersion = packageJson.version
const errors = []

assertIncludes('capacitor.config.ts', `appId: '${expected.appId}'`, 'Capacitor appId must match release package id')
assertIncludes('capacitor.config.ts', `appName: '${expected.appName}'`, 'Capacitor appName must match current MVP app name')
assertIncludes('capacitor.config.ts', "webDir: 'dist'", 'Capacitor webDir must point to the production build output')
assertIncludes('capacitor.config.ts', "androidScheme: 'https'", 'Android scheme should stay https for Capacitor')
assertIncludes('capacitor.config.ts', "contentInset: 'automatic'", 'iOS content inset should keep safe-area adaptation')

assertIncludes('src/constants/app.ts', `APP_VERSION = '${appVersion}'`, 'frontend APP_VERSION must match apps/mobile/package.json version')
assertIncludes('android/app/build.gradle', `namespace "${expected.appId}"`, 'Android namespace must match release package id')
assertIncludes('android/app/build.gradle', `applicationId "${expected.appId}"`, 'Android applicationId must match release package id')
assertIncludes('android/app/build.gradle', `versionName "${appVersion}"`, 'Android versionName must match apps/mobile/package.json version')
assertRegex('android/app/build.gradle', /versionCode\s+[1-9]\d*/, 'Android versionCode must be a positive integer')

assertIncludes('android/app/src/main/res/values/strings.xml', `<string name="app_name">${expected.appName}</string>`, 'Android app_name must match current MVP app name')
assertIncludes('android/app/src/main/res/values/strings.xml', `<string name="title_activity_main">${expected.appName}</string>`, 'Android title_activity_main must match current MVP app name')
assertIncludes('android/app/src/main/res/values/strings.xml', `<string name="package_name">${expected.appId}</string>`, 'Android package_name string must match release package id')
assertIncludes('android/app/src/main/res/values/strings.xml', `<string name="custom_url_scheme">${expected.appId}</string>`, 'Android custom_url_scheme must match release package id')
assertIncludes('android/app/src/main/java/cn/memorypalace/yijing/MainActivity.java', `package ${expected.appId};`, 'MainActivity Java package must match release package id')
assertIncludes('android/app/src/main/AndroidManifest.xml', 'android:label="@string/app_name"', 'AndroidManifest application label must reference app_name')
assertIncludes('android/app/src/main/AndroidManifest.xml', 'android:roundIcon="@mipmap/ic_launcher_round"', 'AndroidManifest must keep the round launcher icon')

if (errors.length) {
  for (const error of errors) console.error(`release-metadata: ${error}`)
  process.exit(1)
}

console.log(`release-metadata: appId ${expected.appId}, appName ${expected.appName}, version ${appVersion} passed`)

function read(relativePath) {
  return readFileSync(resolve(mobileRoot, relativePath), 'utf8')
}

function assertIncludes(relativePath, fragment, message) {
  if (!read(relativePath).includes(fragment)) {
    errors.push(`${relativePath}: ${message}`)
  }
}

function assertRegex(relativePath, pattern, message) {
  if (!pattern.test(read(relativePath))) {
    errors.push(`${relativePath}: ${message}`)
  }
}
