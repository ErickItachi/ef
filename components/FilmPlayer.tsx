'use client'

import { useEffect, useRef, useState } from 'react'
import { filmMedia, image, type Film } from '@/content/films'
import { saveData } from '@/lib/motion'
import Picture from './Picture'
import { Symbol } from './Brand'

type Quality = '4k' | '1080' | '720'

/** Full resolution is available on every screen; the film loads only on play. */
export default function FilmPlayer({ film }: { film: Film }) {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [poster, setPoster] = useState(image(film.poster).src)
  const [quality, setQuality] = useState<Quality>(film.ultraHd ? '4k' : '1080')
  const ref = useRef<HTMLVideoElement>(null)
  const resume = useRef<{ time: number; playing: boolean } | null>(null)
  const media = filmMedia(film.slug)
  const src = quality === '4k' ? media.uhd || media.hd : quality === '720' ? media.sd : media.hd

  useEffect(() => {
    const video = ref.current
    if (!playing || !video) return
    video.focus({ preventScroll: true })
    return () => {
      video.pause()
      video.removeAttribute('src')
      video.load()
    }
  }, [playing])

  const start = (event: React.MouseEvent<HTMLButtonElement>) => {
    setPoster(event.currentTarget.querySelector('img')?.currentSrc || image(film.poster).src)
    setQuality(saveData() ? '720' : film.ultraHd ? '4k' : '1080')
    setFailed(false)
    setLoading(true)
    setPlaying(true)
  }

  const changeQuality = (value: Quality) => {
    if (value === quality) return
    const video = ref.current
    if (video) resume.current = { time: video.currentTime, playing: !video.paused }
    setFailed(false)
    setLoading(true)
    setQuality(value)
  }

  const retry = () => {
    const video = ref.current
    if (!video) return
    resume.current = { time: video.currentTime, playing: true }
    setFailed(false)
    setLoading(true)
    video.focus({ preventScroll: true })
    video.load()
    video.play().catch(() => {})
  }

  return (
    <div className="film-player">
      <div className="player" aria-busy={loading}>
        {!playing ? (
          <button type="button" className="player__poster" onClick={start} aria-label={`Assistir ${film.title}${film.ultraHd ? ' em 4K' : ''} (${film.duration})`}>
            <Picture name={film.poster} alt="" sizes="(min-width: 1200px) 1200px, 100vw" style={{ objectPosition: film.focus }} />
            <span className="player__play" aria-hidden="true">
              <Symbol className="player__symbol" />
              <span>assistir · {film.duration}</span>
            </span>
          </button>
        ) : (
          <video
            ref={ref}
            className="player__video"
            src={src}
            poster={poster}
            controls
            autoPlay
            playsInline
            preload="metadata"
            onLoadStart={() => setLoading(true)}
            onWaiting={() => setLoading(true)}
            onCanPlay={() => setLoading(false)}
            onPlaying={() => setLoading(false)}
            onLoadedMetadata={() => {
              const video = ref.current
              const previous = resume.current
              if (!video || !previous) return
              video.currentTime = Math.min(previous.time, video.duration || previous.time)
              if (previous.playing) video.play().catch(() => {})
              else video.pause()
              resume.current = null
            }}
            onError={() => {
              setFailed(true)
              setLoading(false)
            }}
            aria-label={`Filme: ${film.title}`}
          />
        )}
      </div>
      {playing && (
        <div className="player__toolbar">
          <span className="player__status" role="status">{loading ? 'carregando o filme…' : ''}</span>
          <label>
            qualidade
            <select aria-label="Qualidade do vídeo" value={quality} onChange={(event) => changeQuality(event.target.value as Quality)}>
              {media.uhd && <option value="4k">4K</option>}
              <option value="1080">1080p</option>
              <option value="720">720p</option>
            </select>
          </label>
        </div>
      )}
      {failed && (
        <div className="player__error" role="alert">
          <p>Não foi possível carregar o vídeo agora.</p>
          <div className="player__recovery">
            <button type="button" onClick={retry}>tentar novamente</button>
            <a href={media.hd}>abrir o arquivo do filme</a>
          </div>
        </div>
      )}
    </div>
  )
}
