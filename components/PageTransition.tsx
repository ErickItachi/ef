'use client'

import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import { useMotion } from './MotionProvider'

const COLS = 10
const ROWS = 2

type Ctx = { navigate: (href: string) => void }
const TransitionContext = createContext<Ctx>({ navigate: () => {} })
export const usePageTransition = () => useContext(TransitionContext)

/** Keep the original checker, with a shorter rhythm and a guaranteed way out. */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const wipeRef = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const safetyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const anchorFrame = useRef<number | null>(null)
  const busy = useRef(false)
  const lastPath = useRef(pathname)
  const { scrollTo, lock, reduced } = useMotion()

  const release = useCallback(() => {
    if (safetyTimer.current) clearTimeout(safetyTimer.current)
    busy.current = false
    document.documentElement.classList.remove('js-intro', 'is-transitioning')
    if (wipeRef.current) gsap.set(wipeRef.current, { visibility: 'hidden', pointerEvents: 'none' })
    lock(false)
  }, [lock])

  const open = useCallback((delay = 0) => {
    timeline.current?.kill()
    const cells = Array.from(wipeRef.current?.children ?? [])
    document.dispatchEvent(new CustomEvent('ef:reveal', { detail: { delay: delay + 0.15 } }))
    if (prefersReducedMotion()) {
      release()
      return
    }
    timeline.current = gsap.timeline({ delay, onComplete: release })
      .set(wipeRef.current, { visibility: 'visible', pointerEvents: 'auto' })
      .set(cells, { scaleY: 1, transformOrigin: '50% 0%' })
      .to(cells, { scaleY: 0, duration: 0.48, ease: 'power3.inOut', stagger: { each: 0.022, grid: [ROWS, COLS], from: 'start', axis: 'x' } })
  }, [release])

  useEffect(() => {
    if (document.documentElement.classList.contains('js-intro')) open(0.05)
    else document.dispatchEvent(new CustomEvent('ef:reveal', { detail: { delay: 0 } }))
    return () => {
      timeline.current?.kill()
      if (safetyTimer.current) clearTimeout(safetyTimer.current)
      if (anchorFrame.current !== null) cancelAnimationFrame(anchorFrame.current)
      release()
    }
  }, [open, release])

  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    scrollTo(0, { immediate: true })
    anchorFrame.current = requestAnimationFrame(() => {
      anchorFrame.current = requestAnimationFrame(() => {
        ScrollTrigger.refresh()
        const hash = window.location.hash
        if (hash) scrollTo(hash, { immediate: true })
        if (busy.current) open()
        else document.dispatchEvent(new CustomEvent('ef:reveal', { detail: { delay: 0 } }))
      })
    })
  }, [pathname, open, scrollTo])

  useEffect(() => {
    if (reduced && busy.current) {
      timeline.current?.kill()
      release()
    }
  }, [reduced, release])

  const navigate = useCallback((href: string) => {
    if (busy.current) return
    if (prefersReducedMotion()) {
      router.push(href)
      return
    }
    busy.current = true
    document.documentElement.classList.add('is-transitioning')
    lock(true)
    router.prefetch(href)
    timeline.current?.kill()
    safetyTimer.current = setTimeout(() => open(), 5000)
    timeline.current = gsap.timeline({ onComplete: () => router.push(href) })
      .set(wipeRef.current, { visibility: 'visible', pointerEvents: 'auto' })
      .set(Array.from(wipeRef.current?.children ?? []), { scaleY: 0, transformOrigin: '50% 100%' })
      .to(Array.from(wipeRef.current?.children ?? []), { scaleY: 1, duration: 0.4, ease: 'power3.inOut', stagger: { each: 0.02, grid: [ROWS, COLS], from: 'end', axis: 'x' } })
  }, [router, lock, open])

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={wipeRef} className="wipe" aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, index) => (
          <i key={index} className={(Math.floor(index / COLS) + index % COLS) % 2 === 0 ? 'is-blue' : 'is-cream'} />
        ))}
      </div>
    </TransitionContext.Provider>
  )
}
