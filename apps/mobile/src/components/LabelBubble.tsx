interface Props {
  text: string
  x: number
  y: number
}

export default function LabelBubble({ text, x, y }: Props) {
  return (
    <div
      className="absolute max-w-[128px] -translate-x-1/2 rounded-full border border-white/80 bg-white/85 px-3 py-1 text-center text-xs font-semibold text-ink shadow-lg"
      style={{ left: `${x * 100}%`, top: `calc(${y * 100}% + 18px)` }}
    >
      {text}
    </div>
  )
}
