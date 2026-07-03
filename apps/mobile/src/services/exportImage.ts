import { toPng } from 'html-to-image'

export type ExportRatio = '1:1' | '9:16'

export async function exportNodeToPng(node: HTMLElement, ratio: ExportRatio) {
  const width = ratio === '1:1' ? 1080 : 1080
  const height = ratio === '1:1' ? 1080 : 1920
  const dataUrl = await toPng(node, {
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
  const link = document.createElement('a')
  link.download = `memory-palace-${Date.now()}.png`
  link.href = dataUrl
  link.click()
  return dataUrl
}
