import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(scriptDir, '..')
const repoRoot = resolve(mobileRoot, '../..')

const bannedDependencyRules = [
  { label: 'Google AdMob / ads', pattern: /(?:^|[-/@])(?:admob|google-mobile-ads|play-services-ads)(?:$|[-/])/i },
  { label: 'Facebook ads / analytics', pattern: /(?:facebook|meta).*(?:ads|analytics|audience)/i },
  { label: 'ByteDance/Pangle ads', pattern: /(?:pangle|bytedance|toutiao|gromore|穿山甲)/i },
  { label: 'Unity/AppLovin/ironSource ads', pattern: /(?:unity-ads|applovin|ironsource|levelplay)/i },
  { label: 'Chinese ad network SDK', pattern: /(?:mintegral|mobads|gdt|youlianghui|sigmob|kuaishou|ksad|baidu.*ads?)/i },
  { label: 'attribution/tracking SDK', pattern: /(?:appsflyer|adjust|branch|kochava|singular|tenjin)/i },
  { label: 'analytics/tracking SDK', pattern: /(?:firebase-analytics|google-analytics|umeng|talkingdata|growingio|sensorsdata|mixpanel|amplitude|segment|matomo)/i },
]

const bannedNativeRules = [
  { label: 'Google ads native config', pattern: /com\.google\.android\.gms\.ads|GADApplicationIdentifier/i },
  { label: 'App Tracking Transparency prompt', pattern: /NSUserTrackingUsageDescription/i },
  { label: 'SKAdNetwork attribution config', pattern: /SKAdNetworkItems|SKAdNetworkIdentifier/i },
  { label: 'Facebook SDK native config', pattern: /FacebookAppID|FacebookClientToken|com\.facebook\.sdk/i },
  { label: 'analytics/tracking native config', pattern: /firebase_analytics|google_app_id|umeng|talkingdata|growingio|sensorsdata|appsflyer|adjust|branch/i },
  { label: 'ad network native config', pattern: /admob|pangle|gromore|applovin|ironsource|mintegral|mobads|youlianghui|sigmob|ksad/i },
]

const findings = [
  ...scanPackageJson(),
  ...scanPackageLock(),
  ...scanNativeFiles(),
]

if (findings.length) {
  console.error('tracking-sdk: found disallowed ad/tracking SDK references')
  for (const finding of findings) {
    console.error(`- ${finding.source}: ${finding.value} (${finding.label})`)
  }
  console.error('Remove ad, attribution, analytics, tracking, ATT, and SKAdNetwork references for the MVP release.')
  process.exit(1)
}

console.log('tracking-sdk: no ad or tracking SDK references found')

function scanPackageJson() {
  const packagePath = resolve(mobileRoot, 'package.json')
  if (!existsSync(packagePath)) return []
  const pkg = readJson(packagePath)
  const dependencies = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.optionalDependencies,
    ...pkg.peerDependencies,
  }
  return Object.keys(dependencies).flatMap((name) => matchDependency(name, relative(repoRoot, packagePath)))
}

function scanPackageLock() {
  const lockPath = resolve(repoRoot, 'package-lock.json')
  if (!existsSync(lockPath)) return []
  const lock = readJson(lockPath)
  const names = new Set()

  for (const key of Object.keys(lock.packages ?? {})) {
    if (!key.includes('node_modules/')) continue
    names.add(key.slice(key.lastIndexOf('node_modules/') + 'node_modules/'.length))
  }

  for (const section of [lock.dependencies, lock.devDependencies, lock.optionalDependencies]) {
    for (const name of Object.keys(section ?? {})) names.add(name)
  }

  return [...names].flatMap((name) => matchDependency(name, relative(repoRoot, lockPath)))
}

function scanNativeFiles() {
  const candidates = [
    resolve(mobileRoot, 'android/app/src/main/AndroidManifest.xml'),
    resolve(mobileRoot, 'android/app/build.gradle'),
    resolve(mobileRoot, 'android/build.gradle'),
    resolve(mobileRoot, 'android/variables.gradle'),
    resolve(mobileRoot, 'ios/App/App/Info.plist'),
    resolve(mobileRoot, 'ios/App/Podfile'),
  ]

  const findings = []
  for (const filePath of candidates) {
    if (!existsSync(filePath)) continue
    const content = readFileSync(filePath, 'utf8')
    for (const rule of bannedNativeRules) {
      if (rule.pattern.test(content)) {
        findings.push({
          source: relative(repoRoot, filePath),
          value: 'native config reference',
          label: rule.label,
        })
      }
    }
  }
  return findings
}

function matchDependency(name, source) {
  return bannedDependencyRules
    .filter((rule) => rule.pattern.test(name))
    .map((rule) => ({
      source,
      value: name,
      label: rule.label,
    }))
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}
