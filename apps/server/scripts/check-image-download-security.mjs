import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { existsSync } from 'node:fs'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const require = createRequire(import.meta.url)
require('reflect-metadata')

let storageModule
for (const builtModulePath of [
  '../dist/apps/server/src/modules/image/storage.service.js',
  '../dist/modules/image/storage.service.js',
]) {
  try {
    storageModule = require(builtModulePath)
    break
  } catch {
    // Try the next TypeScript build layout.
  }
}

if (!storageModule) {
  console.error('image download security check requires a built server. Run `npm run build:server` first.')
  process.exit(1)
}

const { StorageService } = storageModule
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64',
)
const storageDir = await mkdtemp(join(tmpdir(), 'yijing-image-download-security-'))

const server = createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://localhost')
  if (url.pathname === '/image.png') {
    return send(response, 200, png, { 'Content-Type': 'image/png', 'Content-Length': String(png.length) })
  }
  if (url.pathname === '/fake.png') {
    return send(response, 200, Buffer.from('<html>not an image</html>'), { 'Content-Type': 'image/png' })
  }
  if (url.pathname === '/unsupported.svg') {
    return send(response, 200, Buffer.from('<svg></svg>'), { 'Content-Type': 'image/svg+xml' })
  }
  if (url.pathname === '/large.png') {
    return send(response, 200, Buffer.alloc(2048), { 'Content-Type': 'image/png', 'Content-Length': '2048' })
  }
  if (url.pathname === '/chunked-large.png') {
    response.writeHead(200, { 'Content-Type': 'image/png' })
    response.write(Buffer.concat([png, Buffer.alloc(600)]))
    response.end(Buffer.alloc(600))
    return
  }
  if (url.pathname === '/slow.png') {
    setTimeout(() => send(response, 200, png, { 'Content-Type': 'image/png' }), 120)
    return
  }
  if (url.pathname === '/redirect-private') {
    response.writeHead(302, { Location: `http://localhost:${server.address().port}/image.png` })
    response.end()
    return
  }
  send(response, 404, Buffer.from('not found'), { 'Content-Type': 'text/plain' })
})

await new Promise((resolve, reject) => {
  server.once('error', reject)
  server.listen(0, '127.0.0.1', resolve)
})

const address = server.address()
if (!address || typeof address === 'string') throw new Error('Failed to start image download security server')
const baseUrl = `http://127.0.0.1:${address.port}`

try {
  const blockedStorage = new StorageService(storageConfig())
  await expectStorageError(blockedStorage.saveRemoteImage(`${baseUrl}/image.png`), '不允许访问本机或私网')
  await expectStorageError(blockedStorage.saveRemoteImage('ftp://images.example.com/test.png'), '协议不安全')
  await expectStorageError(
    blockedStorage.saveRemoteImage(`http://user:password@127.0.0.1:${address.port}/image.png`),
    '协议不安全',
  )

  const allowedStorage = new StorageService(storageConfig({ IMAGE_DOWNLOAD_ALLOWED_HOSTS: '127.0.0.1' }))
  const savedUrl = await allowedStorage.saveRemoteImage(`${baseUrl}/image.png`)
  assert.match(savedUrl, /^http:\/\/localhost:3000\/api\/images\/[a-f0-9-]+\.png$/i)
  const fileName = savedUrl.split('/').pop()
  const filePath = allowedStorage.getLocalImagePath(fileName)
  assert.equal((await stat(filePath)).size, png.length)

  await expectStorageError(allowedStorage.saveRemoteImage(`${baseUrl}/fake.png`), '内容与声明格式不一致')
  await expectStorageError(allowedStorage.saveRemoteImage(`${baseUrl}/unsupported.svg`), '仅支持 PNG、JPEG 或 WebP')
  await expectStorageError(allowedStorage.saveRemoteImage(`${baseUrl}/redirect-private`), '不允许访问本机或私网')

  const sizeLimitedStorage = new StorageService(
    storageConfig({ IMAGE_DOWNLOAD_ALLOWED_HOSTS: '127.0.0.1', IMAGE_DOWNLOAD_MAX_BYTES: '1024' }),
  )
  await expectStorageError(sizeLimitedStorage.saveRemoteImage(`${baseUrl}/large.png`), '超过大小限制')
  await expectStorageError(sizeLimitedStorage.saveRemoteImage(`${baseUrl}/chunked-large.png`), '超过大小限制')

  const timeoutStorage = new StorageService(
    storageConfig({
      IMAGE_DOWNLOAD_ALLOWED_HOSTS: '127.0.0.1',
      IMAGE_STORAGE_REQUEST_TIMEOUT_MS: '20',
    }),
  )
  await expectStorageError(timeoutStorage.saveRemoteImage(`${baseUrl}/slow.png`), '图片下载超时')

  const deletion = await allowedStorage.deleteImage(savedUrl)
  assert.equal(deletion.status, 'deleted')
  assert.equal(existsSync(filePath), false)

  console.log('image-download-security: SSRF, redirect, type/signature, size, timeout, save, and delete checks passed')
} finally {
  server.closeAllConnections?.()
  await new Promise((resolve) => server.close(resolve))
  await rm(storageDir, { recursive: true, force: true })
}

function storageConfig(overrides = {}) {
  const values = {
    STORAGE_PROVIDER: 'local',
    LOCAL_STORAGE_DIR: storageDir,
    PUBLIC_BASE_URL: 'http://localhost:3000',
    IMAGE_STORAGE_REQUEST_TIMEOUT_MS: '500',
    IMAGE_DOWNLOAD_MAX_BYTES: '1048576',
    IMAGE_DOWNLOAD_ALLOWED_HOSTS: '',
    ...overrides,
  }
  return {
    get(key) {
      return values[key]
    },
  }
}

async function expectStorageError(promise, messagePart) {
  try {
    await promise
    assert.fail(`Expected IMAGE_STORAGE_FAILED containing ${messagePart}`)
  } catch (error) {
    if (error?.code === 'ERR_ASSERTION') throw error
    const payload = error?.getResponse?.()
    assert.equal(payload?.code, 'IMAGE_STORAGE_FAILED')
    assert.match(String(payload?.message ?? ''), new RegExp(messagePart))
  }
}

function send(response, status, body, headers) {
  if (response.destroyed) return
  response.writeHead(status, headers)
  response.end(body)
}
