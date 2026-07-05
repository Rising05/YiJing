import { spawn } from 'node:child_process'
import { existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const baseUrl = process.env.UI_BASE_URL ?? 'http://localhost:5173'
const chromePath = process.env.CHROME_PATH || findChromePath()
const debugPort = Number(process.env.CHROME_DEBUG_PORT ?? 9300 + Math.floor(Math.random() * 500))
const userDataDir = join(tmpdir(), `yijing-ui-smoke-${process.pid}`)

if (!chromePath) {
  console.error('Chrome was not found. Set CHROME_PATH to run UI smoke tests.')
  process.exit(1)
}

await assertTargetAvailable()

const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${userDataDir}`,
  '--window-size=390,844',
  'about:blank',
], { stdio: 'ignore' })

try {
  const page = await openPage()
  await page.send('Page.enable')
  await page.send('Runtime.enable')
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })

  await page.navigate(baseUrl)
  await page.evaluate('localStorage.clear(); sessionStorage.clear();')
  await page.send('Page.reload')
  await page.waitFor(() => document.body.innerText.includes('今天要记什么？'))
  await assertHomeCardLayout(page, 390)
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 569,
    height: 995,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await page.send('Page.reload')
  await page.waitFor(() => document.body.innerText.includes('今天要记什么？'))
  await assertHomeCardLayout(page, 569)
  await page.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  })
  await page.send('Page.reload')
  await page.waitFor(() => document.body.innerText.includes('今天要记什么？'))

  await page.click('[data-testid="home-text-memory-link"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="text-memory-page"]')))
  await page.click('[data-testid="text-memory-generate"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="auth-modal"]')))
  await page.click('[data-testid="auth-login-submit"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="result-page"]')) && location.pathname.startsWith('/result/'), 8000)
  await page.waitFor(() => document.body.innerText.includes('导出 PNG') && document.body.innerText.includes('重新生成'))

  await page.navigate(baseUrl)
  await page.waitFor(() => document.body.innerText.includes('今天要记什么？'))
  await page.click('[data-testid="home-word-card-link"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="word-card-page"]')))
  await page.click('[data-testid="word-card-advanced-toggle"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="word-card-mode"]')))
  await page.evaluate(`(() => {
    const select = document.querySelector('[data-testid="word-card-mode"]');
    select.value = 'simple';
    select.dispatchEvent(new Event('change', { bubbles: true }));
  })()`)
  await page.evaluate(`(() => {
    const input = document.querySelector('textarea');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(input, Array.from({ length: 31 }, (_, index) => 'word' + index).join('\\n'));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`)
  await page.click('[data-testid="word-card-generate"]')
  await page.waitFor(() => document.querySelector('[data-testid="word-card-error"]')?.textContent?.includes('一次最多 30 个单词或短语'))
  await page.evaluate(`(() => {
    const input = document.querySelector('textarea');
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(input, 'counter\\nluggage\\npassport\\nboarding gate\\nsecurity officer');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  })()`)
  await page.click('[data-testid="word-card-generate"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="result-page"]')) && location.pathname.startsWith('/result/'), 8000)
  await page.waitFor(() => document.body.innerText.includes('单词') && document.body.innerText.includes('导出 PNG'))

  console.log(`ui-smoke: passed against ${baseUrl}`)
} finally {
  chrome.kill('SIGTERM')
  await waitForProcessExit(chrome)
  rmSync(userDataDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}

function findChromePath() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ]
  return candidates.find((candidate) => existsSync(candidate)) ?? ''
}

async function assertTargetAvailable() {
  try {
    const response = await fetch(baseUrl)
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  } catch (error) {
    throw new Error(`UI target is not available at ${baseUrl}. Start the mobile dev server first. ${error.message}`)
  }
}

async function openPage() {
  const version = await waitForJson(`http://127.0.0.1:${debugPort}/json/version`)
  const target = await fetch(`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent(baseUrl)}`, { method: 'PUT' })
    .then((response) => response.json())
    .catch(async () => {
      const pages = await fetch(`http://127.0.0.1:${debugPort}/json`).then((response) => response.json())
      return pages.find((item) => item.type === 'page')
    })

  const ws = new WebSocket(target?.webSocketDebuggerUrl ?? version.webSocketDebuggerUrl)
  const pending = new Map()
  let callId = 0
  ws.onmessage = (event) => {
    const message = JSON.parse(event.data)
    if (!message.id || !pending.has(message.id)) return
    const { resolve, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolve(message)
  }
  await new Promise((resolve) => {
    ws.onopen = resolve
  })

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++callId
      pending.set(id, { resolve, reject })
      ws.send(JSON.stringify({ id, method, params }))
    })
  }

  async function evaluate(expression) {
    const response = await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
    if (response.result.exceptionDetails) {
      throw new Error(response.result.exceptionDetails.text ?? 'Runtime.evaluate failed')
    }
    return response.result.result.value
  }

  return {
    send,
    evaluate,
    async navigate(url) {
      await send('Page.navigate', { url })
      await this.waitFor(() => document.readyState === 'complete')
    },
    async click(selector) {
      await evaluate(`(() => {
        const element = document.querySelector(${JSON.stringify(selector)});
        if (!element) throw new Error('Missing selector: ${selector}');
        element.click();
      })()`)
    },
    async waitFor(predicate, timeoutMs = 5000) {
      const startedAt = Date.now()
      const source = `(${predicate.toString()})()`
      while (Date.now() - startedAt < timeoutMs) {
        if (await evaluate(source).catch(() => false)) return
        await sleep(120)
      }
      throw new Error(`Timed out waiting for ${predicate.toString()}`)
    },
  }
}

async function assertHomeCardLayout(page, expectedViewportWidth) {
  const homeCardMetrics = await page.evaluate(`(() => {
    const link = document.querySelector('[data-testid="home-text-memory-link"]');
    const read = (name, element) => {
      const rect = element?.getBoundingClientRect();
      const style = element ? getComputedStyle(element) : null;
      return {
        name,
        missing: !element,
        left: rect?.left ?? 0,
        right: rect?.right ?? 0,
        width: rect?.width ?? 0,
        borderRadius: style?.borderRadius ?? '',
        overflow: style?.overflow ?? '',
      };
    };
    return {
      expectedViewportWidth: ${expectedViewportWidth},
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      link: read('link', link),
      shell: read('shell', link?.querySelector('.glass-shell')),
      liquid: read('liquid', link?.querySelector('.glass-liquid')),
      svg: read('svg', link?.querySelector('.glass-liquid > svg')),
      glass: read('glass', link?.querySelector('.glass-liquid > .glass')),
      wrapper: read('wrapper', link?.querySelector('.glass-liquid > .glass > div')),
      fallback: read('fallback', link?.querySelector('.glass-fallback')),
      content: read('content', link?.querySelector('.glass-fallback > div')),
    };
  })()`)
  const layers = ['link', 'shell', 'liquid', 'svg', 'glass', 'wrapper', 'fallback']
  assert(homeCardMetrics.viewportWidth === expectedViewportWidth, `Homepage viewport should be ${expectedViewportWidth}px`)
  assert(homeCardMetrics.documentWidth <= homeCardMetrics.viewportWidth, 'Homepage should not have horizontal overflow')
  for (const layer of layers) {
    const metrics = homeCardMetrics[layer]
    assert(!metrics.missing && metrics.width > 0, `Homepage glass card layer is missing: ${layer}`)
    assert(metrics.left >= -0.5, `Homepage glass card ${layer} should not be clipped on the left`)
    assert(metrics.right <= homeCardMetrics.viewportWidth + 0.5, `Homepage glass card ${layer} should not be clipped on the right`)
    assert(metrics.overflow === 'hidden', `Homepage glass card ${layer} should clip square liquid layers`)
    assert(metrics.borderRadius === '24px', `Homepage glass card ${layer} should preserve rounded corners`)
  }
  assert(homeCardMetrics.content.left >= homeCardMetrics.fallback.left - 0.5, 'Homepage glass card content should stay inside fallback on the left')
  assert(homeCardMetrics.content.right <= homeCardMetrics.fallback.right + 0.5, 'Homepage glass card content should stay inside fallback on the right')
}

async function waitForJson(url, timeoutMs = 5000) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return response.json()
    } catch {
      // Chrome is still starting.
    }
    await sleep(120)
  }
  throw new Error(`Timed out waiting for ${url}`)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function waitForProcessExit(child, timeoutMs = 2000) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, timeoutMs)
    child.once('exit', () => {
      clearTimeout(timeout)
      resolve()
    })
  })
}
