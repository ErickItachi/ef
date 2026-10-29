'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/motion'
import { Words } from './Split'
import { Checker } from './Brand'
import { useMotion } from './MotionProvider'

export default function Manifesto() {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const el = root.current!
      const words = el.querySelectorAll('.manifesto__text .wi')
      gsap.set(words, { opacity: 0.14 })
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.5 } })
      tl.to(words, { opacity: 1, stagger: 0.12, duration: 0.3, ease: 'none' }, 0)
        .fromTo(el.querySelector('.manifesto__checker'), { xPercent: -60 }, { xPercent: 60, ease: 'none', duration: tl.duration() || 2 }, 0)
        .fromTo(el.querySelector('.manifesto__sign'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.3 }, '>-0.2')
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="olhar" className="manifesto" data-theme="cream" aria-labelledby="olhar-titulo">
      <div className="manifesto__sticky">
        <p className="label">o olhar</p>
        <h2 id="olhar-titulo" className="manifesto__text display">
          <Words text="não é só sobre imagens bonitas." />{' '}
          <Words text="é sobre fazer alguém sentir, entender e lembrar." accent={['sentir', 'entender', 'lembrar']} />
        </h2>
        <p className="manifesto__sign">— Erick Borborema</p>
        <Checker className="manifesto__checker" />
      </div>
    </section>
  )
}
