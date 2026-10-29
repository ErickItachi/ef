'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion'

/**
 * Plays entrance animations for descendants when the block scrolls into view:
 *  .line > .li  rises from behind its mask
 *  .w > .wi     words rise
 *  [data-fade]  fades up
 *  [data-clip]  is uncovered from the bottom, its image settles in
 */
export default function Reveal({ as: Tag = 'div', className, children, start = 'top 82%', ...rest }: { as?: React.ElementType; className?: string; children: React.ReactNode; start?: string } & Record<string, unknown>) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const el = root.current!
      const lines = el.querySelectorAll('.line > .li, .w > .wi')
      const fades = el.querySelectorAll('[data-fade]')
      const clips = el.querySelectorAll<HTMLElement>('[data-clip]')
      gsap.set(lines, { yPercent: 110 })
      gsap.set(fades, { autoAlpha: 0, y: 24 })
      gsap.set(clips, { clipPath: 'inset(100% 0% 0% 0%)' })
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start, once: true } })
      tl.to(lines, { yPercent: 0, duration: 1.05, ease: 'expo.out', stagger: 0.05 }, 0)
        .to(clips, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut', stagger: 0.1 }, 0)
        .fromTo(el.querySelectorAll('[data-clip] img'), { scale: 1.18 }, { scale: 1, duration: 1.6, ease: 'expo.out' }, 0.1)
        .to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.25)
    },
    { scope: root },
  )

  return (
    <Tag ref={root} className={className} {...rest}>
      {children}
    </Tag>
  )
}
