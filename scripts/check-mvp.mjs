import { spawnSync } from 'node:child_process'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const steps = [
  ['build:server', ['run', 'build:server']],
  ['prisma:validate', ['run', 'prisma:validate']],
  ['check:config', ['run', 'check:config']],
  ['check:error-codes', ['run', 'check:error-codes']],
  ['check:content-safety', ['run', 'check:content-safety']],
  ['check:ai-templates', ['run', 'check:ai-templates']],
  ['check:ai-retry', ['run', 'check:ai-retry']],
  ['check:image-prompts', ['run', 'check:image-prompts']],
  ['check:image-storage', ['run', 'check:image-storage']],
  ['check:production-config', ['run', 'check:production-config']],
  ['check:production-redaction', ['run', 'check:production-redaction']],
  ['build:mobile', ['run', 'build:mobile']],
  ['check:frontend-secrets', ['run', 'check:frontend-secrets']],
  ['check:permissions', ['run', 'check:permissions']],
  ['check:tracking-sdk', ['run', 'check:tracking-sdk']],
  ['check:release-metadata', ['run', 'check:release-metadata']],
  ['check:release-env', ['run', 'check:release-env']],
]

const startedAt = Date.now()

for (const [name, args] of steps) {
  console.log(`\ncheck-mvp: running ${name}`)
  const result = spawnSync('npm', args, {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  })

  if (result.status !== 0) {
    console.error(`\ncheck-mvp: failed at ${name}`)
    process.exit(result.status ?? 1)
  }
}

const elapsedSeconds = ((Date.now() - startedAt) / 1000).toFixed(1)
console.log(`\ncheck-mvp: all ${steps.length} static gates passed in ${elapsedSeconds}s`)
