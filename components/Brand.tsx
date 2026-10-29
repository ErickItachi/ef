import { SYMBOL_PATH, SYMBOL_VIEWBOX, WORDMARK_PATH, WORDMARK_VIEWBOX } from './brand-paths'

export function Symbol({ className, title }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={SYMBOL_VIEWBOX} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <path fill="currentColor" d={SYMBOL_PATH} />
    </svg>
  )
}

export function Wordmark({ className, title = 'erick filmes' }: { className?: string; title?: string }) {
  return (
    <svg className={className} viewBox={WORDMARK_VIEWBOX} role="img" aria-label={title}>
      <path fill="currentColor" d={WORDMARK_PATH} />
    </svg>
  )
}

/** The 2 × 10 checker: filled cells in currentColor, the others are see-through. */
export function Checker({ className, cols = 10 }: { className?: string; cols?: number }) {
  const cells = []
  for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) if ((r + c) % 2 === 0) cells.push(<rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" />)
  return (
    <svg className={className} viewBox={`0 0 ${cols} 2`} aria-hidden="true" shapeRendering="crispEdges" fill="currentColor">
      {cells}
    </svg>
  )
}
