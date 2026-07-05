import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface'

const wildcardOrigin = '*'

export function parseAllowedOrigins(raw?: string) {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function createCorsOptions(env: NodeJS.ProcessEnv = process.env): CorsOptions {
  const production = env.NODE_ENV === 'production'
  const origins = parseAllowedOrigins(env.ALLOWED_ORIGINS)

  if (!origins.length) {
    if (production) {
      throw new Error('ALLOWED_ORIGINS is required when NODE_ENV=production')
    }
    return { origin: true, credentials: true }
  }

  if (origins.includes(wildcardOrigin)) {
    if (production) {
      throw new Error('ALLOWED_ORIGINS must not include * when NODE_ENV=production')
    }
    return { origin: true, credentials: true }
  }

  return {
    origin: origins,
    credentials: true,
  }
}
