import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const mobileRoot = resolve(scriptDir, '..')
const errors = []

const files = {
  app: readSource('src/App.tsx'),
  pageShell: readSource('src/pages/PageShell.tsx'),
  bottomTabBar: readSource('src/components/BottomTabBar.tsx'),
  authModal: readSource('src/components/AuthModal.tsx'),
  glassButton: readSource('src/components/GlassButton.tsx'),
  liquidGlassCard: readSource('src/components/LiquidGlassCard.tsx'),
  styles: readSource('src/styles/globals.css'),
}

checkSafeArea()
checkTouchTargets()
checkLiquidGlassLayout()

if (errors.length) {
  for (const error of errors) console.error(`mobile-layout: ${error}`)
  process.exit(1)
}

console.log('mobile-layout: safe area, touch target, and liquid glass layout checks passed')

function readSource(relativePath) {
  return readFileSync(resolve(mobileRoot, relativePath), 'utf8')
}

function checkSafeArea() {
  assertIncludes(
    files.app,
    'pb-[calc(86px+env(safe-area-inset-bottom))]',
    'App root must reserve bottom safe-area space for the fixed tab bar',
  )
  assertIncludes(
    files.pageShell,
    'pt-[calc(18px+env(safe-area-inset-top))]',
    'PageShell must reserve top safe-area space',
  )
  assertIncludes(
    files.bottomTabBar,
    'pb-[calc(10px+env(safe-area-inset-bottom))]',
    'BottomTabBar must include bottom safe-area padding',
  )
  assertIncludes(
    files.authModal,
    'pb-[calc(16px+env(safe-area-inset-bottom))]',
    'AuthModal must keep its sheet above the bottom safe area',
  )
}

function checkTouchTargets() {
  assertIncludes(
    files.glassButton,
    'min-h-11',
    'GlassButton must keep at least 44px touch height',
  )
  assertIncludes(
    files.bottomTabBar,
    'min-h-12',
    'Bottom tab items must keep at least 48px touch height',
  )
}

function checkLiquidGlassLayout() {
  assertIncludes(
    files.liquidGlassCard,
    "className=\"glass-liquid h-full w-full\"",
    'LiquidGlassCard must keep the effect layer full width and height',
  )
  assertIncludes(
    files.liquidGlassCard,
    "style={{ position: 'absolute'",
    'LiquidGlassCard effect layer must be absolute so it cannot drive content layout',
  )
  assertIncludes(
    files.liquidGlassCard,
    '<div className="glass-fallback">{children}</div>',
    'LiquidGlassCard content must render in the owned fallback layer',
  )

  assertIncludes(files.styles, '.glass-shell {', 'globals.css must define the glass shell')
  assertIncludes(files.styles, 'clip-path: inset(0 round 24px);', 'Glass layers must keep rounded clipping')
  assertIncludes(files.styles, '.glass-shell > .glass-liquid {', 'globals.css must scope the liquid effect layer')
  assertIncludes(files.styles, 'pointer-events: none;', 'Liquid effect layer must not steal taps from card content')
  assertIncludes(files.styles, '.glass-fallback {', 'globals.css must define the fallback content layer')
  assertIncludes(files.styles, 'z-index: 1;', 'Fallback content layer must render above the liquid effect')
}

function assertIncludes(source, expected, message) {
  if (!source.includes(expected)) errors.push(message)
}
