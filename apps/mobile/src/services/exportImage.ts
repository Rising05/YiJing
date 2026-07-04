import { toPng } from 'html-to-image'

export type ExportRatio = '1:1' | '9:16'

type ShareCapableNavigator = Navigator & {
  canShare?: (data: { files?: File[] }) => boolean
  share?: (data: { title?: string; text?: string; files?: File[] }) => Promise<void>
}

export async function renderNodeToPng(node: HTMLElement, ratio: ExportRatio) {
  const width = ratio === '1:1' ? 1080 : 1080
  const height = ratio === '1:1' ? 1080 : 1920
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 2,
    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      transform: 'scale(1)',
      transformOrigin: 'top left',
    },
  })
}

export function downloadPng(dataUrl: string, filename = `memory-palace-${Date.now()}.png`) {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

export async function exportNodeToPng(node: HTMLElement, ratio: ExportRatio) {
  const dataUrl = await renderNodeToPng(node, ratio)
  downloadPng(dataUrl)
  return dataUrl
}

export async function shareNodeAsPng(node: HTMLElement, ratio: ExportRatio) {
  const dataUrl = await renderNodeToPng(node, ratio)
  const filename = `memory-palace-${Date.now()}.png`
  const response = await fetch(dataUrl)
  const blob = await response.blob()
  const file = new File([blob], filename, { type: 'image/png' })
  const sharePayload = {
    title: '忆境 MemoryPalace',
    text: '我用忆境生成了一张学习记忆图。',
    files: [file],
  }
  const shareNavigator = navigator as ShareCapableNavigator
  if (shareNavigator.share && (!shareNavigator.canShare || shareNavigator.canShare({ files: [file] }))) {
    await shareNavigator.share(sharePayload)
  } else {
    downloadPng(dataUrl, filename)
  }
  return dataUrl
}
