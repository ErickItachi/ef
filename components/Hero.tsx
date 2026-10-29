'use client'

import { useEffect, useRef, useState } from 'react'
import { films, filmMedia } from '@/content/films'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, saveData, isLowPower } from '@/lib/motion'
import Picture from './Picture'

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
  const [reel, setReel] = useState(0)
  const [playReel, setPlayReel] = useState(false)
  const videos = useRef<(HTMLVideoElement | null)[]>([])

  // which film the screen is showing
  useEffect(() => {
    if (prefersReducedMotion() || saveData()) return
    setPlayReel(true)
  }, [])

  useEffect(() => {
    if (!playReel) return
    videos.current.forEach((v, i) => {
      if (!v) return
      if (i === reel) {
        v.currentTime = 0
        v.play().catch(() => {})
      } else if (i === (reel + 1) % films.length) {
        v.preload = 'auto'                 // warm up only the next one
      } else v.pause()
    })
  }, [reel, playReel])

  useGSAP(
    () => {
      const el = root.current!
      const stage = el.querySelector<HTMLElement>('.hero__stage')!
      const media = el.querySelector<HTMLElement>('.hero__media')!
      const win = el.querySelector<HTMLElement>('.hero__window')!
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
      gsap.set(media, { clipPath: insetOf() })
      const heroFlag = (on: boolean) => document.documentElement.classList.toggle('hero-active', on)
      if (reduced) {
        ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom top', onUpdate: (self) => heroFlag(self.progress < 0.5) })
        return
      }

      // opening: letters rise, the screen opens from a line, like a projector warming up
      gsap.set(letters, { yPercent: 110 })
      gsap.set(fades, { autoAlpha: 0, y: 14 })
      gsap.set(media, { clipPath: closedOf() })
      const intro = (delay: number) =>
        gsap.timeline({ delay })
          .to(letters, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.045 })
          .to(media, { clipPath: insetOf(), duration: 1.25, ease: 'expo.inOut' }, 0.25)
          .to(fades, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.7)
      let started = false
      const onReveal = (e: Event) => {
        if (started) return
        started = true
        intro((e as CustomEvent).detail?.delay ?? 0)
      }
      document.addEventListener('ef:reveal', onReveal, { once: true })
      const failsafe = window.setTimeout(() => onReveal(new CustomEvent('ef:reveal', { detail: { delay: 0 } })), 2500)

      // scroll: the screen opens to the whole frame and the title leaves
      const light = isLowPower()
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * (light ? 0.7 : 1.1)}`,
          scrub: light ? true : 0.6,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => heroFlag(self.progress < 0.45),
        },
      })
      tl.fromTo(media, { clipPath: () => insetOf() }, { clipPath: 'inset(0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1, immediateRender: false }, 0)
        .fromTo(media.querySelectorAll('.hero__layer'), { scale: 1.14 }, { scale: 1, ease: 'none', duration: 1 }, 0)
        .to(el.querySelector('.hero__title'), { yPercent: -30, autoAlpha: 0, ease: 'power2.in', duration: 0.55 }, 0)
        .to(fades, { autoAlpha: 0, duration: 0.3 }, 0)
        .fromTo(el.querySelector('.hero__over'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35 }, 0.62)

      return () => {
        window.clearTimeout(failsafe)
        document.removeEventListener('ef:reveal', onReveal)
      }
    },
    { scope: root },
  )

  useEffect(() => {
    document.documentElement.classList.add('hero-active')
    return () => document.documentElement.classList.remove('hero-active')
  }, [])

  const current = films[reel]

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
          <div className="hero__layer">
            <Picture name={films[0].poster} alt="" priority sizes="100vw" className="hero__poster" style={{ objectPosition: films[0].focus }} />
          </div>
          {playReel &&
            films.map((f, i) => (
              <video
                key={f.slug}
                ref={(v) => {
                  videos.current[i] = v
                }}
                className={`hero__layer hero__video${i === reel ? ' is-on' : ''}`}
                src={filmMedia(f.slug).preview}
                muted
                playsInline
                preload={i === 0 ? 'auto' : 'none'}
                onEnded={() => setReel((r) => (r + 1) % films.length)}
                aria-hidden="true"
                tabIndex={-1}
                style={{ objectPosition: f.focus }}
              />
            ))}
          <div className="hero__shade" aria-hidden="true" />
          <p className="hero__reel" aria-live="off">
            <span>{String(reel + 1).padStart(2, '0')}</span> {current.title} · {current.category}
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
