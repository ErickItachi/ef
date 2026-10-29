'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion'
import { useMotion } from './MotionProvider'

/**
 * Plays entrance animations for descendants when the block scrolls into view:
 *  .line > .li  rises from behind its mask
 *  .w > .wi     words rise
 *  [data-fade]  fades up
 *  [data-clip]  is uncovered from the bottom, its image settles in
 */
export default function Reveal({ as: Tag = 'div', className, children, start = 'top 82%', ...rest }: { as?: React.ElementType; className?: string; children: React.ReactNode; start?: string } & Record<string, unknown>) {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const el = root.current!
      const lines = el.querySelectorAll('.line > .li, .w > .wi')
      const fades = el.querySelectorAll('[data-fade]')
      const clips = el.querySelectorAll<HTMLElement>('[data-clip]')
      if (lines.length) gsap.set(lines, { yPercent: 110 })
      if (fades.length) gsap.set(fades, { autoAlpha: 0, y: 24 })
      if (clips.length) gsap.set(clips, { clipPath: 'inset(100% 0% 0% 0%)' })
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } })
      if (lines.length) tl.to(lines, { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.035 }, 0)
      if (clips.length) {
        tl.to(clips, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.95, ease: 'power3.inOut', stagger: 0.08 }, 0)
          .fromTo(el.querySelectorAll('[data-clip] img'), { scale: 1.08 }, { scale: 1, duration: 1.15, ease: 'power3.out' }, 0.05)
      }
      if (fades.length) tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.06 }, 0.15)
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <Tag ref={root} className={className} {...rest}>
      {children}
    </Tag>
  )
}
