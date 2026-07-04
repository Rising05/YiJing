import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDir, '../../..')
const androidManifestPaths = [
  'apps/mobile/android/app/src/main/AndroidManifest.xml',
  'apps/mobile/android/capacitor-cordova-android-plugins/src/main/AndroidManifest.xml',
]
const iosInfoPlistPaths = [
  'apps/mobile/ios/App/App/Info.plist',
]

const allowedAndroidPermissions = new Set([
  'android.permission.INTERNET',
])

const blockedAndroidPermissions = [
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.ACCESS_BACKGROUND_LOCATION',
  'android.permission.CAMERA',
  'android.permission.RECORD_AUDIO',
  'android.permission.READ_CONTACTS',
  'android.permission.WRITE_CONTACTS',
  'android.permission.GET_ACCOUNTS',
  'android.permission.READ_CALENDAR',
  'android.permission.WRITE_CALENDAR',
  'android.permission.READ_SMS',
  'android.permission.SEND_SMS',
  'android.permission.RECEIVE_SMS',
  'android.permission.CALL_PHONE',
  'android.permission.READ_PHONE_STATE',
  'android.permission.BLUETOOTH_SCAN',
  'android.permission.BLUETOOTH_CONNECT',
  'android.permission.NFC',
  'android.permission.POST_NOTIFICATIONS',
]

const blockedIosUsageKeys = [
  'NSLocationWhenInUseUsageDescription',
  'NSLocationAlwaysAndWhenInUseUsageDescription',
  'NSCameraUsageDescription',
  'NSMicrophoneUsageDescription',
  'NSContactsUsageDescription',
  'NSCalendarsUsageDescription',
  'NSPhotoLibraryUsageDescription',
  'NSPhotoLibraryAddUsageDescription',
  'NSUserTrackingUsageDescription',
  'NSBluetoothAlwaysUsageDescription',
  'NFCReaderUsageDescription',
]

const errors = []
const checkedFiles = []

for (const manifestPath of androidManifestPaths) {
  const absolutePath = resolve(repoRoot, manifestPath)
  if (!existsSync(absolutePath)) continue
  checkedFiles.push(manifestPath)
  const manifest = readFileSync(absolutePath, 'utf8')
  const permissions = Array.from(manifest.matchAll(/<uses-permission\b[^>]*android:name="([^"]+)"/g), (match) => match[1])
  for (const permission of permissions) {
    if (blockedAndroidPermissions.includes(permission)) {
      errors.push(`${manifestPath}: blocked sensitive permission ${permission}`)
    } else if (!allowedAndroidPermissions.has(permission)) {
      errors.push(`${manifestPath}: permission ${permission} is not in the MVP allowlist`)
    }
  }
}

for (const plistPath of iosInfoPlistPaths) {
  const absolutePath = resolve(repoRoot, plistPath)
  if (!existsSync(absolutePath)) continue
  checkedFiles.push(plistPath)
  const plist = readFileSync(absolutePath, 'utf8')
  for (const key of blockedIosUsageKeys) {
    if (plist.includes(`<key>${key}</key>`)) {
      errors.push(`${plistPath}: blocked sensitive iOS usage key ${key}`)
    }
  }
}

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`)
  process.exit(1)
}

console.log(`mobile-permissions: checked ${checkedFiles.length} file(s); no sensitive permissions found`)
