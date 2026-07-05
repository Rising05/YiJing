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
  await assertExportStage(page, '9:16')
  await page.click('[data-testid="ratio-1-1"]')
  await page.waitFor(() => document.querySelector('[data-testid="ratio-1-1"]')?.classList.contains('segmented-active'))
  await assertExportStage(page, '1:1')
  await page.evaluate(`(() => {
    window.__yijingDownloads = [];
    if (!window.__yijingAnchorClickPatched) {
      window.__yijingAnchorClickPatched = true;
      const originalClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function patchedAnchorClick() {
        if (this.download && String(this.href).startsWith('data:image/png')) {
          window.__yijingDownloads.push({ download: this.download, href: this.href });
          return;
        }
        return originalClick.call(this);
      };
    }
  })()`)
  await page.click('[data-testid="export-png-button"]')
  await page.waitFor(() => {
    const download = window.__yijingDownloads?.[0]
    return Boolean(download?.download?.endsWith('.png') && download?.href?.startsWith('data:image/png'))
  }, 12000)

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
  await assertHistoryFlow(page)
  await assertSettingsFlow(page)

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

async function assertHistoryFlow(page) {
  await page.click('[data-testid="tab-history"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="history-page"]')))
  await page.waitFor(() => document.querySelectorAll('[data-testid="history-record"]').length >= 2)

  const initialCount = await page.evaluate(`document.querySelectorAll('[data-testid="history-record"]').length`)
  assert(initialCount >= 2, 'History page should include generated text and word records')
  await page.evaluate(`window.__yijingInitialHistoryCount = ${initialCount}`)

  await page.click('[data-testid="history-favorite-button"]')
  await page.waitFor(() => document.querySelector('[data-testid="history-favorite-button"]')?.getAttribute('aria-label') === '取消收藏')

  await page.click('[data-testid="history-detail-link"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="detail-page"]')) && location.pathname.startsWith('/detail/'))
  await page.waitFor(() => document.body.innerText.includes('模板') && (document.body.innerText.includes('单词详情') || document.body.innerText.includes('记忆点详情')))
  const detailFavoriteText = await page.evaluate(`document.querySelector('[data-testid="detail-favorite-button"]')?.textContent ?? ''`)
  assert(detailFavoriteText.includes('已收藏'), 'Detail page should reflect favorite state from history')

  await page.click('[data-testid="tab-history"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="history-page"]')))
  await page.click('[data-testid="history-delete-button"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="history-confirm-delete-button"]')))
  await page.click('[data-testid="history-confirm-delete-button"]')
  await page.waitFor(() => document.querySelectorAll('[data-testid="history-record"]').length === window.__yijingInitialHistoryCount - 1)
}

async function assertSettingsFlow(page) {
  await page.click('[data-testid="tab-settings"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="settings-page"]')))
  await page.waitFor(() => document.querySelector('[data-testid="settings-account-status"]')?.textContent?.includes('测试用户'))

  await page.click('[data-testid="settings-clear-cache-button"]')
  await page.waitFor(() => document.querySelector('[data-testid="settings-confirm-panel"]')?.getAttribute('data-action') === 'clear-cache')
  await page.click('[data-testid="settings-confirm-action"]')
  await page.waitFor(() => (JSON.parse(localStorage.getItem('memory-palace-history') || '{}')?.state?.records?.length ?? 0) === 0)

  await page.click('[data-testid="tab-history"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="history-page"]')))
  await page.waitFor(() => document.body.innerText.includes('还没有生成记录。'))

  await page.click('[data-testid="tab-settings"]')
  await page.waitFor(() => Boolean(document.querySelector('[data-testid="settings-page"]')))
  await page.click('[data-testid="settings-delete-account-button"]')
  await page.waitFor(() => document.querySelector('[data-testid="settings-confirm-panel"]')?.getAttribute('data-action') === 'delete-account')
  await page.click('[data-testid="settings-confirm-action"]')
  await page.waitFor(() => document.querySelector('[data-testid="settings-account-status"]')?.textContent?.includes('未登录'))
  await page.waitFor(() => {
    const authState = JSON.parse(localStorage.getItem('memory-palace-auth') || '{}')?.state
    return authState?.user == null && authState?.token == null
  })
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
        top: rect?.top ?? 0,
        right: rect?.right ?? 0,
        bottom: rect?.bottom ?? 0,
        width: rect?.width ?? 0,
        height: rect?.height ?? 0,
        borderRadius: style?.borderRadius ?? '',
        overflow: style?.overflow ?? '',
        clipPath: style?.clipPath ?? '',
        position: style?.position ?? '',
        transform: style?.transform ?? '',
      };
    };
    return {
      expectedViewportWidth: ${expectedViewportWidth},
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      main: read('main', document.querySelector('main')),
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
  assert(homeCardMetrics.main.left >= -0.5, 'Homepage main should stay inside viewport on the left')
  assert(homeCardMetrics.main.right <= homeCardMetrics.viewportWidth + 0.5, 'Homepage main should stay inside viewport on the right')
  assert(homeCardMetrics.link.left > 0, 'Homepage glass card should not touch or disappear behind the left viewport edge')
  assert(homeCardMetrics.link.right < homeCardMetrics.viewportWidth, 'Homepage glass card should not touch or disappear behind the right viewport edge')
  for (const layer of layers) {
    const metrics = homeCardMetrics[layer]
    assert(!metrics.missing && metrics.width > 0, `Homepage glass card layer is missing: ${layer}`)
    assert(metrics.left >= -0.5, `Homepage glass card ${layer} should not be clipped on the left`)
    assert(metrics.right <= homeCardMetrics.viewportWidth + 0.5, `Homepage glass card ${layer} should not be clipped on the right`)
    assert(metrics.overflow === 'hidden', `Homepage glass card ${layer} should clip square liquid layers`)
    assert(metrics.borderRadius === '24px', `Homepage glass card ${layer} should preserve rounded corners`)
    assert(metrics.clipPath.includes('round 24px'), `Homepage glass card ${layer} should use a rounded clip-path`)
  }
  assert(homeCardMetrics.wrapper.position === 'relative', 'Homepage glass card wrapper should not inherit absolute library positioning')
  assert(homeCardMetrics.wrapper.transform === 'none', 'Homepage glass card wrapper should not inherit library transforms')
  assert(homeCardMetrics.wrapper.left === homeCardMetrics.fallback.left, 'Homepage glass card wrapper and fallback should align on the left')
  assert(homeCardMetrics.wrapper.top === homeCardMetrics.fallback.top, 'Homepage glass card wrapper and fallback should align on the top')
  assert(homeCardMetrics.content.left >= homeCardMetrics.fallback.left - 0.5, 'Homepage glass card content should stay inside fallback on the left')
  assert(homeCardMetrics.content.right <= homeCardMetrics.fallback.right + 0.5, 'Homepage glass card content should stay inside fallback on the right')
}

async function assertExportStage(page, expectedRatio) {
  const metrics = await page.evaluate(`(() => {
    const stage = document.querySelector('[data-testid="export-stage"]');
    const watermark = stage?.querySelector('.watermark');
    const rect = stage?.getBoundingClientRect();
    return {
      width: rect?.width ?? 0,
      height: rect?.height ?? 0,
      watermark: watermark?.textContent ?? '',
    };
  })()`)
  assert(metrics.watermark === '忆境 MemoryPalace', 'Export stage should include app watermark')
  assert(metrics.width > 0 && metrics.height > 0, 'Export stage should have visible dimensions')
  const actualRatio = metrics.width / metrics.height
  const targetRatio = expectedRatio === '1:1' ? 1 : 9 / 16
  assert(Math.abs(actualRatio - targetRatio) < 0.03, `Export stage should use ${expectedRatio} ratio`)
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
