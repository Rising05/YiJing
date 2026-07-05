import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { mkdtemp, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)

let storageModule
for (const builtModulePath of [
  '../dist/apps/server/src/modules/image/storage.service.js',
  '../dist/modules/image/storage.service.js',
]) {
  try {
    storageModule = require(builtModulePath)
    break
  } catch {
    // Try the next build layout.
  }
}

if (!storageModule) {
  console.error('image-storage check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

const { StorageService } = storageModule
const nativeFetch = globalThis.fetch
const localStorageDir = await mkdtemp(join(tmpdir(), 'yijing-local-storage-'))
const config = {
  get(key) {
    return {
      STORAGE_PROVIDER: 'local',
      LOCAL_STORAGE_DIR: localStorageDir,
      PUBLIC_BASE_URL: 'http://localhost:3000',
      PORT: '3000',
    }[key]
  },
}
const storage = new StorageService(config)
const url = await storage.saveRemoteImage(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
)

if (!url.startsWith('http://localhost:3000/api/images/')) {
  throw new Error(`Expected local image API URL, got ${url}`)
}

const fileName = url.split('/').pop()
const filePath = storage.getLocalImagePath(fileName)
const fileInfo = await stat(filePath)
if (!fileInfo.size) {
  throw new Error('Saved local image is empty')
}

const deletion = await storage.deleteImage(url)
if (deletion.status !== 'deleted') {
  throw new Error(`Expected deleted status, got ${JSON.stringify(deletion)}`)
}

if (existsSync(filePath)) {
  throw new Error('Local image still exists after deleteImage')
}

const ossRequests = []
globalThis.fetch = async (url, options = {}) => {
  if (String(url).startsWith('data:image/')) return nativeFetch(url, options)
  ossRequests.push({ url: String(url), method: options.method, headers: Object.fromEntries(new Headers(options.headers)) })
  return new Response('', { status: 200 })
}

try {
  const ossConfig = {
    get(key) {
      return {
        STORAGE_PROVIDER: 'oss',
        OSS_BUCKET: 'memory-palace-test',
        OSS_REGION: 'oss-cn-hangzhou',
        OSS_ACCESS_KEY_ID: 'test-access-key-id',
        OSS_ACCESS_KEY_SECRET: 'test-access-key-secret',
        OSS_OBJECT_PREFIX: 'generated-images',
      }[key]
    },
  }
  const ossStorage = new StorageService(ossConfig)
  const ossUrl = await ossStorage.saveRemoteImage(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  )

  if (!ossUrl.startsWith('https://memory-palace-test.oss-cn-hangzhou.aliyuncs.com/generated-images/')) {
    throw new Error(`Expected OSS public URL, got ${ossUrl}`)
  }

  const upload = ossRequests.at(-1)
  if (upload?.method !== 'PUT') {
    throw new Error(`Expected OSS PUT upload, got ${JSON.stringify(upload)}`)
  }
  if (!upload.headers.authorization?.startsWith('OSS test-access-key-id:')) {
    throw new Error('OSS upload request is missing Authorization signature')
  }
  if (upload.headers['content-type'] !== 'image/png') {
    throw new Error(`Expected image/png upload content type, got ${upload.headers['content-type']}`)
  }

  const ossDeletion = await ossStorage.deleteImage(ossUrl)
  if (ossDeletion.status !== 'deleted') {
    throw new Error(`Expected OSS deleted status, got ${JSON.stringify(ossDeletion)}`)
  }

  const deletion = ossRequests.at(-1)
  if (deletion?.method !== 'DELETE') {
    throw new Error(`Expected OSS DELETE request, got ${JSON.stringify(deletion)}`)
  }
  if (!deletion.headers.authorization?.startsWith('OSS test-access-key-id:')) {
    throw new Error('OSS delete request is missing Authorization signature')
  }
} finally {
  globalThis.fetch = nativeFetch
}

console.log('image-storage: local and oss save/delete checks passed')
