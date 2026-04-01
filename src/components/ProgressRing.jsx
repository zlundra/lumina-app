export default function ProgressRing({ pct = 0, size = 80, stroke = 6, color = '#7c5cfc', label, sublabel }) {
  const r   = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#2a2a3f" strokeWidth={stroke}
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="font-display font-bold text-malux-text" style={{ fontSize: size * 0.22 }}>
            {pct}%
          </span>
        </div>
      </div>
      {label    && <p className="font-mono text-xs text-malux-muted text-center">{label}</p>}
      {sublabel && <p className="font-mono text-xs text-malux-faint text-center">{sublabel}</p>}
    </div>
  )
}
