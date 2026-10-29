import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { films, getFilm, image } from '@/content/films'
import { site } from '@/content/site'
import Picture from '@/components/Picture'
import FilmPlayer from '@/components/FilmPlayer'
import Reveal from '@/components/Reveal'
import TransitionLink from '@/components/TransitionLink'
import Contact from '@/components/Contact'
import { Lines, Words } from '@/components/Split'

export const dynamicParams = false

export function generateStaticParams() {
  return films.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const film = getFilm((await params).slug)
  if (!film) return {}
  const title = `${film.title} — ${film.category}`
  const og = image(film.poster)
  return {
    title,
    description: `${film.description} Um filme de Erick Borborema.`,
    alternates: { canonical: `/filmes/${film.slug}` },
    openGraph: { title: `${title} · ${site.name}`, description: film.logline, images: [{ url: og.src, width: Math.min(og.width, 2048), alt: film.posterAlt }], type: 'video.other' },
  }
}

export default async function FilmPage({ params }: { params: Promise<{ slug: string }> }) {
  const film = getFilm((await params).slug)
  if (!film) notFound()
  const i = films.indexOf(film)
  const next = films[(i + 1) % films.length]
  const facts = [
    ['categoria', film.category],
    ['local', film.place],
    ['cliente', film.client],
    ['ano', film.year],
    ['duração', film.duration],
  ].filter(([, v]) => v) as [string, string][]

  return (
    <main id="conteudo" className="filmpage">
      <section className="fhero" data-theme="ink" aria-labelledby="film-title">
        <div className="fhero__media" aria-hidden="true">
          <Picture name={film.poster} alt="" priority sizes="100vw" style={{ objectPosition: film.focus }} />
          <span className="fhero__shade" />
        </div>
        <Reveal className="fhero__text" start="top 95%">
          <TransitionLink href="/#filmes" className="fhero__back" data-fade>
            <span aria-hidden="true">←</span> todos os filmes
          </TransitionLink>
          <p className="label" data-fade>
            {String(i + 1).padStart(2, '0')} · {film.category}
          </p>
          <h1 id="film-title" className="fhero__title display">
            <Words text={film.title} />
          </h1>
        </Reveal>
      </section>

      <section className="fplay" data-theme="ink" aria-label="Filme">
        <Reveal className="fplay__inner" start="top 90%">
          <div data-fade>
            <FilmPlayer film={film} />
          </div>
        </Reveal>
      </section>

      <section className="finfo" data-theme="cream" aria-label="Sobre o filme">
        <Reveal className="finfo__grid">
          <p className="finfo__logline display">
            <Lines lines={[film.logline]} />
          </p>
          <div className="finfo__body">
            <p data-fade>{film.description}</p>
            <dl className="finfo__facts" data-fade>
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {film.credits.length > 0 && (
              <dl className="finfo__credits" data-fade>
                {film.credits.map((c) => (
                  <div key={c.role}>
                    <dt>{c.role}</dt>
                    <dd>{c.name}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </Reveal>
      </section>

      <section className="fnext" data-theme="ink" aria-label="Próximo filme">
        <TransitionLink href={`/filmes/${next.slug}`} className="fnext__link">
          <span className="fnext__media" aria-hidden="true">
            <Picture name={next.poster} alt="" sizes="(min-width: 960px) 50vw, 100vw" style={{ objectPosition: next.focus }} />
          </span>
          <span className="label">próximo filme</span>
          <span className="fnext__title display">{next.title}</span>
          <span className="fnext__meta">
            {next.category} <span aria-hidden="true">→</span>
          </span>
        </TransitionLink>
      </section>

      <Contact />
    </main>
  )
}
