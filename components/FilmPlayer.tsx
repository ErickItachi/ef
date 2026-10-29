'use client'

import { useEffect, useRef, useState } from 'react'
import { filmMedia, type Film } from '@/content/films'
import { saveData } from '@/lib/motion'
import Picture from './Picture'
import { Symbol } from './Brand'

type Quality = '4k' | '1080' | '720'

/** Full resolution is available on every screen; the film loads only on play. */
export default function FilmPlayer({ film }: { film: Film }) {
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)
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

  const start = () => {
    setQuality(saveData() ? '720' : film.ultraHd ? '4k' : '1080')
    setFailed(false)
    setPlaying(true)
  }

  const changeQuality = (value: Quality) => {
    const video = ref.current
    if (video) resume.current = { time: video.currentTime, playing: !video.paused }
    setFailed(false)
    setQuality(value)
  }

  return (
    <div className="film-player">
      <div className="player">
        {!playing ? (
          <button type="button" className="player__poster" onClick={start} aria-label={`Assistir ${film.title} (${film.duration})`}>
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
            controls
            autoPlay
            playsInline
            preload="metadata"
            onLoadedMetadata={() => {
              const video = ref.current
              const previous = resume.current
              if (!video || !previous) return
              video.currentTime = Math.min(previous.time, video.duration || previous.time)
              if (previous.playing) video.play().catch(() => {})
              else video.pause()
              resume.current = null
            }}
            onError={() => setFailed(true)}
            aria-label={`Filme: ${film.title}`}
          />
        )}
      </div>
      {playing && (
        <div className="player__toolbar">
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
        <p className="player__error" role="alert">
          Não foi possível carregar o vídeo agora. <a href={media.hd}>Abrir o arquivo do filme</a>.
        </p>
      )}
    </div>
  )
}
