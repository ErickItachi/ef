'use client'

import { useRef, useState } from 'react'
import { filmMedia, type Film } from '@/content/films'
import Picture from './Picture'
import { Symbol } from './Brand'

/** Poster first; the film itself (720p on phones / data saver, 1080p elsewhere) loads only on play. */
export default function FilmPlayer({ film }: { film: Film }) {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLVideoElement>(null)
  const media = filmMedia(film.slug)

  const start = () => {
    setPlaying(true)
    requestAnimationFrame(() => ref.current?.focus())
  }

  const pickSource = () => {
    if (typeof window === 'undefined') return media.hd
    const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
    return window.innerWidth < 900 || nav.connection?.saveData ? media.sd : media.hd
  }

  return (
    <div className="player">
      {!playing && (
        <button type="button" className="player__poster" onClick={start} aria-label={`Assistir ${film.title} (${film.duration})`}>
          <Picture name={film.poster} alt="" sizes="(min-width: 1200px) 1200px, 100vw" style={{ objectPosition: film.focus }} />
          <span className="player__play" aria-hidden="true">
            <Symbol className="player__symbol" />
            <span>assistir · {film.duration}</span>
          </span>
        </button>
      )}
      {playing && (
        <video
          ref={ref}
          className="player__video"
          src={pickSource()}
          controls
          autoPlay
          playsInline
          preload="auto"
          onError={() => setFailed(true)}
          aria-label={`Filme: ${film.title}`}
        />
      )}
      {failed && (
        <p className="player__error" role="alert">
          Não foi possível carregar o vídeo agora. <a href={media.sd}>Abrir o arquivo do filme</a>.
        </p>
      )}
    </div>
  )
}
