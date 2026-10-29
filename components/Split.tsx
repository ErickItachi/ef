import { Fragment } from 'react'

/**
 * Splits a line into words (and optionally letters) wrapped for masked reveals.
 * Screen readers get the plain sentence; the pieces are hidden from them.
 */
export function Words({ text, className, letters = false, accent = [] }: { text: string; className?: string; letters?: boolean; accent?: string[] }) {
  const words = text.split(' ')
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      {words.map((w, i) => {
        const strip = w.replace(/[.,;:!?]/g, '')
        const hot = accent.includes(strip)
        return (
          <Fragment key={i}>
            <span className="w" aria-hidden="true">
              <span className={`wi${hot ? ' is-accent' : ''}`}>
                {letters
                  ? [...w].map((ch, j) => (
                      <span className="ch" key={j}>
                        {ch}
                      </span>
                    ))
                  : w}
              </span>
            </span>
            {i < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
    </span>
  )
}

/** Lines that rise from behind a mask, one after another. */
export function Lines({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <span className={className}>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((l, i) => (
        <span className="line" key={i} aria-hidden="true">
          <span className="li">{l}</span>
        </span>
      ))}
    </span>
  )
}
