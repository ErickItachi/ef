'use client'

import { useEffect, useRef } from 'react'
import { prefersReducedMotion, saveData } from '@/lib/motion'
import { useMotion } from './MotionProvider'

type Props = Omit<React.ComponentProps<'video'>, 'src' | 'autoPlay' | 'controls'> & {
  src: string
  fallbackSrc?: string
  active?: boolean
}

/** Decorative films load nearby, and only play in a visible, active page. */
export default function PreviewVideo({ src, fallbackSrc, active = true, className = '', ...props }: Props) {
  const ref = useRef<HTMLVideoElement>(null)
  const syncRef = useRef<() => void>(() => {})
  const activeRef = useRef(active)
  const { reduced } = useMotion()

  useEffect(() => {
    activeRef.current = active
    syncRef.current()
  }, [active])

  useEffect(() => {
    const video = ref.current
    if (!video || reduced || prefersReducedMotion() || saveData()) return
    let nearby = false
    let visible = false
    let disposed = false

    const sync = () => {
      if (disposed) return
      const shouldPlay = nearby && visible && activeRef.current && !document.hidden && !document.documentElement.matches('.is-locked, .is-transitioning')
      if (shouldPlay) {
        if (!video.hasAttribute('src')) video.src = src
        video.play().catch(() => {})
      } else video.pause()
      if (!nearby && video.hasAttribute('src')) {
        video.removeAttribute('src')
        video.load()
        video.classList.remove('is-on')
      }
    }
    syncRef.current = sync
    const nearObserver = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting
      sync()
    }, { rootMargin: '240px 0px' })
    const playObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio > 0
      sync()
    }, { threshold: [0, 0.01, 0.1] })
    const lockObserver = new MutationObserver(sync)
    const fallback = () => {
      if (!fallbackSrc || video.getAttribute('src') === fallbackSrc || disposed) return
      video.src = fallbackSrc
      sync()
    }
    nearObserver.observe(video)
    playObserver.observe(video)
    lockObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    document.addEventListener('visibilitychange', sync)
    video.addEventListener('error', fallback)

    return () => {
      disposed = true
      syncRef.current = () => {}
      nearObserver.disconnect()
      playObserver.disconnect()
      lockObserver.disconnect()
      document.removeEventListener('visibilitychange', sync)
      video.removeEventListener('error', fallback)
      video.pause()
      video.removeAttribute('src')
      video.load()
      video.classList.remove('is-on')
    }
  }, [src, fallbackSrc, reduced])

  return (
    <video
      {...props}
      ref={ref}
      className={`${className}${active ? ' is-active' : ''}`}
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={(event) => event.currentTarget.classList.add('is-on')}
    />
  )
}
