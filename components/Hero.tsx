'use client'

import { useEffect, useRef } from 'react'
import { films, filmMedia } from '@/content/films'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, isLowPower } from '@/lib/motion'
import Picture from './Picture'
import PreviewVideo from './PreviewVideo'
import { useMotion } from './MotionProvider'

/** "erick filmes" split into letters, keeping the f+i ligature together as one piece. */
function TitleLetters({ word }: { word: string }) {
  const pieces: string[] = []
  for (let i = 0; i < word.length; i++) {
    if (word[i] === 'f' && word[i + 1] === 'i') {
      pieces.push('fi')
      i++
    } else pieces.push(word[i])
  }
  return (
    <span className="hero__word" aria-hidden="true">
      {pieces.map((p, i) => (
        <span className="ch-mask" key={i}>
          <span className="ch">{p}</span>
        </span>
      ))}
    </span>
  )
}

export default function Hero() {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()
  const current = films.find((film) => film.slug === 'igreja-burn')!
  const openingMedia = filmMedia(current.slug)

  useGSAP(
    () => {
      const el = root.current!
      const stage = el.querySelector<HTMLElement>('.hero__stage')!
      const media = el.querySelector<HTMLElement>('.hero__media')!
      const win = el.querySelector<HTMLElement>('.hero__window')!
      const visual = el.querySelector<HTMLElement>('.hero__visual')!
      const letters = el.querySelectorAll('.hero__title .ch')
      const fades = el.querySelectorAll('.hero__fade')
      const reduced = prefersReducedMotion()

      const insetOf = () => {
        const s = stage.getBoundingClientRect()
        const w = win.getBoundingClientRect()
        return `inset(${w.top - s.top}px ${s.right - w.right}px ${s.bottom - w.bottom}px ${w.left - s.left}px)`
      }
      const closedOf = () => {
        const s = stage.getBoundingClientRect()
        const w = win.getBoundingClientRect()
        const mid = w.top - s.top + w.height / 2
        return `inset(${mid}px ${s.right - w.right}px ${s.height - mid}px ${w.left - s.left}px)`
      }
      const windowBounds = () => {
        const s = stage.getBoundingClientRect()
        const w = win.getBoundingClientRect()
        return { left: w.left - s.left, top: w.top - s.top, width: w.width, height: w.height }
      }
      gsap.set(media, { clipPath: insetOf() })
      gsap.set(visual, windowBounds())
      const heroFlag = (on: boolean) => document.documentElement.classList.toggle('hero-active', on)
      const updateHeaderContrast = () => {
        const header = document.querySelector<HTMLElement>('.header')
        if (!header) return
        const headerBounds = header.getBoundingClientRect()
        const stageBounds = stage.getBoundingClientRect()
        const middle = headerBounds.top + headerBounds.height / 2
        const clipTop = Number.parseFloat(media.style.clipPath.match(/inset\(\s*([-\d.]+)/)?.[1] || '0')
        document.documentElement.classList.toggle('hero-expanded', stageBounds.top + clipTop <= middle && stageBounds.bottom > middle)
      }
      if (reduced) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          onUpdate: (self) => heroFlag(self.progress < 0.5),
          onRefresh: () => {
            gsap.set(media, { clipPath: insetOf() })
            gsap.set(visual, windowBounds())
          },
        })
        return
      }

      // opening: letters rise, the screen opens from a line, like a projector warming up
      gsap.set(letters, { yPercent: 110 })
      gsap.set(fades, { autoAlpha: 0, y: 14 })
      gsap.set(media, { clipPath: closedOf() })
      let introTimeline: gsap.core.Timeline | undefined
      let started = false
      let introInterrupted = false
      const interruptIntro = () => {
        if (introInterrupted) return
        introInterrupted = true
        started = true
        introTimeline?.kill()
        introTimeline = undefined
        window.clearTimeout(failsafe)
        gsap.set(letters, { yPercent: 0 })
        gsap.set(fades, { y: 0 })
      }
      const intro = (delay: number) => {
        introTimeline = gsap.timeline({ delay })
          .to(letters, { yPercent: 0, duration: 0.9, ease: 'expo.out', stagger: 0.035 })
          .to(media, { clipPath: insetOf(), duration: 1, ease: 'power3.inOut' }, 0.15)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.07 }, 0.45)
      }
      const onReveal = (e: Event) => {
        if (started) return
        if (window.scrollY > 2) {
          interruptIntro()
          return
        }
        started = true
        intro((e as CustomEvent).detail?.delay ?? 0)
      }
      document.addEventListener('ef:reveal', onReveal, { once: true })
      const failsafe = window.setTimeout(() => onReveal(new CustomEvent('ef:reveal', { detail: { delay: 0 } })), 500)

      // scroll: the screen opens to the whole frame and the title leaves
      const light = isLowPower()
      const tl = gsap.timeline({
        onUpdate: updateHeaderContrast,
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * (light ? 0.7 : 1.1)}`,
          scrub: light ? true : 0.6,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            heroFlag(self.progress < 0.45)
            if (self.progress > 0.015) interruptIntro()
          },
        },
      })
      tl.fromTo(media, { clipPath: () => insetOf() }, { clipPath: 'inset(0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1, immediateRender: false }, 0)
        .fromTo(visual, {
          left: () => windowBounds().left,
          top: () => windowBounds().top,
          width: () => windowBounds().width,
          height: () => windowBounds().height,
        }, { left: 0, top: 0, width: '100%', height: '100%', ease: 'power2.inOut', duration: 1 }, 0)
        .to(el.querySelector('.hero__title'), { yPercent: -30, autoAlpha: 0, ease: 'power2.in', duration: 0.55 }, 0)
        .fromTo(fades, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: 0, duration: 0.3, immediateRender: false }, 0)
        .fromTo(el.querySelector('.hero__over'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.62)

      // The header stays legible through the pinned video and its final scroll out.
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom top',
        onUpdate: updateHeaderContrast,
        onRefresh: updateHeaderContrast,
        onEnterBack: updateHeaderContrast,
        onLeave: () => document.documentElement.classList.remove('hero-expanded'),
      })

      return () => {
        introTimeline?.kill()
        window.clearTimeout(failsafe)
        document.removeEventListener('ef:reveal', onReveal)
        document.documentElement.classList.remove('hero-expanded')
      }
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  useEffect(() => {
    document.documentElement.classList.add('hero-active')
    return () => document.documentElement.classList.remove('hero-active', 'hero-expanded')
  }, [])

  return (
    <section ref={root} id="topo" className="hero" data-theme="cream" aria-label="Abertura">
      <div className="hero__stage">
        <h1 className="hero__title">
          <span className="sr-only">Erick Filmes</span>
          <TitleLetters word="erick" />
          <TitleLetters word="filmes" />
        </h1>

        <div className="hero__window" aria-hidden="true" />

        <div className="hero__media">
          <div className="hero__visual">
            <div className="hero__layer">
              <Picture name={current.poster} alt="" priority sizes="100vw" className="hero__poster" style={{ objectPosition: current.focus }} />
            </div>
            <PreviewVideo
              className="hero__layer hero__video"
              src={openingMedia.previewUhd || openingMedia.preview}
              fallbackSrc={openingMedia.preview}
              loop
              style={{ objectPosition: current.focus }}
            />
          </div>
          <div className="hero__shade" aria-hidden="true" />
          <p className="hero__reel" aria-live="off">
            <span>01</span> {current.title} · {current.category}
          </p>
          <p className="hero__over" aria-hidden="true">
            entre uma cena<br />e outra.
          </p>
        </div>

        <p className="hero__line hero__fade">histórias, pessoas e tudo aquilo que acontece entre uma cena e outra.</p>
        <p className="hero__meta hero__fade">
          <span>Erick Borborema</span>
          <span>filmmaker · São Paulo</span>
        </p>
        <span className="hero__cue hero__fade" aria-hidden="true">
          role
        </span>
      </div>
    </section>
  )
}
