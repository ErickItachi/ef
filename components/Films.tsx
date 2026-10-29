'use client'

import { useRef } from 'react'
import { films, filmMedia, type Film } from '@/content/films'
import { gsap, useGSAP, prefersReducedMotion, isLowPower } from '@/lib/motion'
import Picture from './Picture'
import Reveal from './Reveal'
import TransitionLink from './TransitionLink'
import { Lines, Words } from './Split'
import PreviewVideo from './PreviewVideo'
import { useMotion } from './MotionProvider'

function FilmCard({ film, index }: { film: Film; index: number }) {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const el = root.current!
      const frame = el.querySelector('.film__frame')
      const light = isLowPower()
      gsap.fromTo(
        frame,
        { clipPath: 'inset(9% 7% 9% 7%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'center 55%', scrub: light ? true : 0.4 } },
      )
      if (!light)
        gsap.fromTo(el.querySelector('.film__visual'), { scale: 1.08 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } })
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  const media = filmMedia(film.slug)
  return (
    <article ref={root} className={`film film--${index % 2 ? 'right' : 'left'}`}>
      <TransitionLink href={`/filmes/${film.slug}`} className="film__link" aria-label={`Assistir ${film.title} — ${film.category}`}>
        <div className="film__frame">
          <div className="film__visual">
            <Picture name={film.poster} alt={film.posterAlt} sizes="(min-width: 960px) 86vw, 100vw" className="film__layer film__poster" style={{ objectPosition: film.focus }} />
            <PreviewVideo
              className="film__layer film__video"
              src={media.previewUhd || media.preview}
              fallbackSrc={media.preview}
              loop
              style={{ objectPosition: film.focus }}
            />
          </div>
          <span className="film__shade" aria-hidden="true" />
          <span className="film__duration" aria-hidden="true">
            {film.duration}
          </span>
        </div>
        <Reveal className="film__info" start="top 88%">
          <span className="film__num display" data-fade>
            {String(index + 1).padStart(2, '0')}
          </span>
          <h3 className="film__title display">
            <Words text={film.title} />
          </h3>
          <p className="film__meta" data-fade>
            {[film.category, film.place, film.year].filter(Boolean).join(' · ')}
          </p>
          <p className="film__logline" data-fade>
            {film.logline}
          </p>
          <span className="film__cta" data-fade>
            assistir o filme <span aria-hidden="true">→</span>
          </span>
        </Reveal>
      </TransitionLink>
    </article>
  )
}

export default function Films() {
  return (
    <section id="filmes" className="films" data-theme="ink" aria-labelledby="filmes-titulo">
      <Reveal className="films__head">
        <p className="label" data-fade>
          filmes <span className="films__count">{String(films.length).padStart(2, '0')}</span>
        </p>
        <h2 id="filmes-titulo" className="films__title display">
          <Lines lines={['algumas histórias', 'que passaram', 'pela minha câmera.']} />
        </h2>
      </Reveal>
      <div className="films__list">
        {films.map((f, i) => (
          <FilmCard film={f} index={i} key={f.slug} />
        ))}
      </div>
    </section>
  )
}
