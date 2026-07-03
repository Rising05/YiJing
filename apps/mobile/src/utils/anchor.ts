import type { Anchor } from '../types'

export function anchorPosition(anchors: Anchor[], anchorKey: string) {
  const anchor = anchors.find((item) => item.key === anchorKey)
  return anchor ? { x: anchor.x, y: anchor.y } : { x: 0.5, y: 0.5 }
}
