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

console.log('image-storage: local save/delete passed')
