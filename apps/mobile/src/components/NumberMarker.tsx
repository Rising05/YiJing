interface Props {
  id: number
  x: number
  y: number
  active?: boolean
  onClick?: () => void
}

export default function NumberMarker({ id, x, y, active, onClick }: Props) {
  return (
    <button
      className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs font-bold shadow-lg transition ${
        active ? 'scale-110 border-white bg-coral text-white' : 'border-white/80 bg-white/80 text-ink'
      }`}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      onClick={onClick}
    >
      {id}
    </button>
  )
}
