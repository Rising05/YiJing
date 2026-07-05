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

const storageRequests = []
globalThis.fetch = async (url, options = {}) => {
  if (String(url).startsWith('data:image/')) return nativeFetch(url, options)
  storageRequests.push({ url: String(url), method: options.method, headers: Object.fromEntries(new Headers(options.headers)) })
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

  const upload = storageRequests.at(-1)
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

  const deletion = storageRequests.at(-1)
  if (deletion?.method !== 'DELETE') {
    throw new Error(`Expected OSS DELETE request, got ${JSON.stringify(deletion)}`)
  }
  if (!deletion.headers.authorization?.startsWith('OSS test-access-key-id:')) {
    throw new Error('OSS delete request is missing Authorization signature')
  }

  const s3Config = {
    get(key) {
      return {
        STORAGE_PROVIDER: 's3-compatible',
        S3_BUCKET: 'memory-palace-test',
        S3_REGION: 'auto',
        S3_ENDPOINT: 'https://s3.example.cn',
        S3_PUBLIC_BASE_URL: 'https://cdn.example.cn/yijing',
        S3_ACCESS_KEY_ID: 'test-s3-access-key-id',
        S3_SECRET_ACCESS_KEY: 'test-s3-secret-access-key',
        S3_OBJECT_PREFIX: 'generated-images',
      }[key]
    },
  }
  const s3Storage = new StorageService(s3Config)
  const s3Url = await s3Storage.saveRemoteImage(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  )

  if (!s3Url.startsWith('https://cdn.example.cn/yijing/generated-images/')) {
    throw new Error(`Expected S3 public URL, got ${s3Url}`)
  }

  const s3Upload = storageRequests.at(-1)
  if (s3Upload?.method !== 'PUT') {
    throw new Error(`Expected S3 PUT upload, got ${JSON.stringify(s3Upload)}`)
  }
  if (!s3Upload.url.startsWith('https://s3.example.cn/memory-palace-test/generated-images/')) {
    throw new Error(`Expected S3 path-style upload URL, got ${s3Upload.url}`)
  }
  if (!s3Upload.headers.authorization?.startsWith('AWS4-HMAC-SHA256 Credential=test-s3-access-key-id/')) {
    throw new Error('S3 upload request is missing SigV4 Authorization header')
  }
  if (!s3Upload.headers['x-amz-content-sha256'] || !s3Upload.headers['x-amz-date']) {
    throw new Error('S3 upload request is missing required x-amz headers')
  }

  const s3Deletion = await s3Storage.deleteImage(s3Url)
  if (s3Deletion.status !== 'deleted') {
    throw new Error(`Expected S3 deleted status, got ${JSON.stringify(s3Deletion)}`)
  }

  const s3DeleteRequest = storageRequests.at(-1)
  if (s3DeleteRequest?.method !== 'DELETE') {
    throw new Error(`Expected S3 DELETE request, got ${JSON.stringify(s3DeleteRequest)}`)
  }
  if (!s3DeleteRequest.headers.authorization?.startsWith('AWS4-HMAC-SHA256 Credential=test-s3-access-key-id/')) {
    throw new Error('S3 delete request is missing SigV4 Authorization header')
  }
} finally {
  globalThis.fetch = nativeFetch
}

console.log('image-storage: local, oss, and s3-compatible save/delete checks passed')
