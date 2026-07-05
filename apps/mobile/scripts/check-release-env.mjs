import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(scriptDir, '..')
const repoRoot = resolve(mobileRoot, '../..')
const strict = process.argv.includes('--strict')

const checks = [
  checkNode(),
  checkNpm(),
  checkCapacitorConfig(),
  checkAndroidProject(),
  checkJava(),
  checkAndroidSdk(),
  checkIosProject(),
  checkXcode(),
  checkCocoaPods(),
]

const blockers = checks.filter((check) => check.status === 'fail')

for (const check of checks) {
  console.log(`${labelFor(check.status)} ${check.name}: ${check.message}`)
}

if (blockers.length) {
  console.log('')
  console.log(`release-env: ${blockers.length} blocker(s) found`)
  for (const blocker of blockers) {
    console.log(`- ${blocker.name}: ${blocker.fix}`)
  }
  if (strict) process.exit(1)
} else {
  console.log('')
  console.log('release-env: native release environment looks ready')
}

function checkNode() {
  return commandCheck({
    name: 'Node.js',
    command: 'node',
    args: ['--version'],
    fix: 'Install Node.js before building the web bundle.',
  })
}

function checkNpm() {
  return commandCheck({
    name: 'npm',
    command: 'npm',
    args: ['--version'],
    fix: 'Install npm before running workspace scripts.',
  })
}

function checkCapacitorConfig() {
  const configPath = resolve(mobileRoot, 'capacitor.config.ts')
  return existsSync(configPath)
    ? pass('Capacitor config', 'apps/mobile/capacitor.config.ts exists')
    : fail('Capacitor config', 'apps/mobile/capacitor.config.ts is missing', 'Restore the Capacitor config before native sync.')
}

function checkAndroidProject() {
  const gradlewPath = resolve(mobileRoot, 'android/gradlew')
  return existsSync(gradlewPath)
    ? pass('Android project', 'apps/mobile/android exists with Gradle wrapper')
    : fail('Android project', 'apps/mobile/android is missing', 'Run npm run cap:add:android -w apps/mobile after installing Capacitor dependencies.')
}

function checkJava() {
  const result = run('java', ['-version'])
  if (result.ok) return pass('Java', firstLine(result.output))
  return fail('Java', 'java is not available', 'Install a JDK compatible with Android Gradle Plugin before building APK/AAB.')
}

function checkAndroidSdk() {
  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT
  if (!sdkRoot) {
    return fail('Android SDK', 'ANDROID_HOME or ANDROID_SDK_ROOT is not set', 'Install Android Studio or command-line SDK tools, then set ANDROID_HOME.')
  }
  if (!existsSync(sdkRoot)) {
    return fail('Android SDK', `${sdkRoot} does not exist`, 'Point ANDROID_HOME or ANDROID_SDK_ROOT to the installed Android SDK directory.')
  }
  return pass('Android SDK', `${sdkRoot} exists`)
}

function checkIosProject() {
  if (process.platform !== 'darwin') {
    return warn('iOS project', 'iOS builds require macOS', 'Run iOS checks on a Mac with Xcode.')
  }
  const iosPath = resolve(mobileRoot, 'ios')
  return existsSync(iosPath)
    ? pass('iOS project', 'apps/mobile/ios exists')
    : fail('iOS project', 'apps/mobile/ios is missing', 'Install CocoaPods and full Xcode, then run npm run cap:add:ios -w apps/mobile.')
}

function checkXcode() {
  if (process.platform !== 'darwin') {
    return warn('Xcode', 'Xcode only applies on macOS', 'Run iOS checks on a Mac with Xcode.')
  }

  const select = run('xcode-select', ['-p'])
  if (!select.ok) return fail('Xcode', 'xcode-select is not available', 'Install full Xcode from the App Store or Apple Developer site.')

  const selectedPath = firstLine(select.output)
  const version = run('xcodebuild', ['-version'])
  if (!version.ok) return fail('Xcode', 'xcodebuild is not available', 'Install full Xcode and run sudo xcode-select -s /Applications/Xcode.app/Contents/Developer.')

  if (selectedPath.includes('CommandLineTools')) {
    return fail('Xcode', `selected path is ${selectedPath}`, 'Switch to full Xcode with sudo xcode-select -s /Applications/Xcode.app/Contents/Developer.')
  }

  return pass('Xcode', `${firstLine(version.output)} at ${selectedPath}`)
}

function checkCocoaPods() {
  if (process.platform !== 'darwin') {
    return warn('CocoaPods', 'CocoaPods only applies on macOS iOS builds', 'Run iOS checks on a Mac.')
  }
  return commandCheck({
    name: 'CocoaPods',
    command: 'pod',
    args: ['--version'],
    fix: 'Install CocoaPods before running npm run cap:add:ios -w apps/mobile.',
  })
}

function commandCheck({ name, command, args, fix }) {
  const result = run(command, args)
  return result.ok ? pass(name, firstLine(result.output)) : fail(name, `${command} is not available`, fix)
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
  })
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
  return { ok: result.status === 0, output }
}

function firstLine(output) {
  return output.split(/\r?\n/).find(Boolean) ?? 'available'
}

function pass(name, message) {
  return { status: 'pass', name, message, fix: '' }
}

function warn(name, message, fix) {
  return { status: 'warn', name, message, fix }
}

function fail(name, message, fix) {
  return { status: 'fail', name, message, fix }
}

function labelFor(status) {
  if (status === 'pass') return '[pass]'
  if (status === 'warn') return '[warn]'
  return '[fail]'
}
