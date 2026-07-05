import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const errors = []

const files = {
  dockerignore: read('.dockerignore'),
  dockerfile: read('apps/server/Dockerfile'),
  compose: read('docker-compose.prod.example.yml'),
  serverPackage: JSON.parse(read('apps/server/package.json')),
}

checkServerStart()
checkDockerfile()
checkCompose()
checkDockerignore()

if (errors.length) {
  for (const error of errors) console.error(`deploy-config: ${error}`)
  process.exit(1)
}

console.log('deploy-config: server Dockerfile and production compose example checks passed')

function read(relativePath) {
  const filePath = resolve(repoRoot, relativePath)
  if (!existsSync(filePath)) {
    errors.push(`${relativePath} is required`)
    return ''
  }
  return readFileSync(filePath, 'utf8')
}

function checkServerStart() {
  if (files.serverPackage.scripts?.start !== 'node dist/apps/server/src/main.js') {
    errors.push('apps/server start script must point at dist/apps/server/src/main.js')
  }
  if (!files.serverPackage.dependencies?.prisma) {
    errors.push('apps/server must keep prisma as a production dependency for container migrate deploy')
  }
}

function checkDockerfile() {
  assertIncludes(files.dockerfile, 'FROM node:22-bookworm-slim AS build', 'Dockerfile must use a pinned Node 22 slim build stage')
  assertIncludes(files.dockerfile, 'RUN npm ci', 'Dockerfile must install from package-lock.json')
  assertIncludes(files.dockerfile, 'npm run prisma:generate -w apps/server', 'Dockerfile must generate Prisma client during build')
  assertIncludes(files.dockerfile, 'npm run build:server', 'Dockerfile must build the NestJS server')
  assertIncludes(files.dockerfile, 'npm prune --omit=dev', 'Dockerfile must prune dev dependencies for the runner image')
  assertIncludes(files.dockerfile, 'USER node', 'Dockerfile runner must use the non-root node user')
  assertIncludes(files.dockerfile, 'HEALTHCHECK', 'Dockerfile must define a healthcheck')
  assertIncludes(files.dockerfile, 'apps/server/dist/apps/server/src/main.js', 'Dockerfile must start the actual compiled server entry')
}

function checkCompose() {
  assertIncludes(files.compose, 'mysql:8.4', 'production compose example must pin MySQL 8.4')
  assertIncludes(files.compose, 'dockerfile: apps/server/Dockerfile', 'production compose example must build the server Dockerfile')
  assertIncludes(files.compose, 'env_file:', 'production compose example must load apps/server/.env.production')
  assertIncludes(files.compose, 'apps/server/.env.production', 'production compose example must reference the production env file')
  assertIncludes(files.compose, 'prisma migrate deploy', 'production compose example must run Prisma migrations before server start')
  assertIncludes(files.compose, 'condition: service_healthy', 'server must wait for MySQL health before starting')
  assertIncludes(files.compose, 'yijing_uploads:', 'production compose example must persist local generated images')
  assertIncludes(files.compose, '${MYSQL_PASSWORD:?set MYSQL_PASSWORD}', 'production compose example must require a real MySQL password')
  assertIncludes(files.compose, '${MYSQL_ROOT_PASSWORD:?set MYSQL_ROOT_PASSWORD}', 'production compose example must require a real MySQL root password')
}

function checkDockerignore() {
  for (const entry of ['node_modules', '.git', 'apps/server/.env.production', 'apps/server/uploads', 'logo.png']) {
    assertIncludes(files.dockerignore, entry, `.dockerignore must exclude ${entry}`)
  }
}

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) errors.push(message)
}
