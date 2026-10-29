'use client'

import { createContext, useCallback, useContext, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import { useMotion } from './MotionProvider'

// The 2 × 10 checker of the identity, blown up to the whole screen: it closes over a page and opens on the next.
const COLS = 10
const ROWS = 2

type Ctx = { navigate: (href: string) => void }
const TransitionContext = createContext<Ctx>({ navigate: () => {} })
export const usePageTransition = () => useContext(TransitionContext)

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const wipeRef = useRef<HTMLDivElement>(null)
  const busy = useRef(false)
  const first = useRef(true)
  const { scrollTo } = useMotion()

  const cells = () => Array.from(wipeRef.current?.children ?? []) as HTMLElement[]

  const open = useCallback((delay = 0) => {
    const els = cells()
    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        gsap.set(wipeRef.current, { visibility: 'hidden' })
        document.documentElement.classList.remove('js-intro')
        busy.current = false
        ScrollTrigger.refresh()
      },
    })
    tl.set(wipeRef.current, { visibility: 'visible' })
      .set(els, { scaleY: 1, transformOrigin: '50% 0%' })
      .to(els, { scaleY: 0, duration: 0.7, ease: 'expo.inOut', stagger: { each: 0.035, grid: [ROWS, COLS], from: 'start', axis: 'x' } })
    document.dispatchEvent(new CustomEvent('ef:reveal', { detail: { delay: delay + 0.35 } }))
    return tl
  }, [])

  // first visit: the checker opens to show the opening title
  useEffect(() => {
    if (!first.current) return
    first.current = false
    if (!document.documentElement.classList.contains('js-intro')) {
      document.dispatchEvent(new CustomEvent('ef:reveal', { detail: { delay: 0 } }))
      return
    }
    open(0.15)
  }, [open])

  // every new route opens the checker again
  const lastPath = useRef(pathname)
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    const hash = window.location.hash
    scrollTo(0, { immediate: true })
    if (hash) requestAnimationFrame(() => requestAnimationFrame(() => scrollTo(hash, { immediate: true })))
    if (prefersReducedMotion() || !busy.current) {
      busy.current = false
      document.dispatchEvent(new CustomEvent('ef:reveal', { detail: { delay: 0 } }))
      return
    }
    requestAnimationFrame(() => open(0.05))
  }, [pathname, open, scrollTo])

  const navigate = useCallback(
    (href: string) => {
      if (busy.current) return
      if (prefersReducedMotion()) {
        router.push(href)
        return
      }
      busy.current = true
      router.prefetch(href)
      const els = cells()
      gsap.timeline({ onComplete: () => router.push(href) })
        .set(wipeRef.current, { visibility: 'visible' })
        .set(els, { scaleY: 0, transformOrigin: '50% 100%' })
        .to(els, { scaleY: 1, duration: 0.6, ease: 'expo.inOut', stagger: { each: 0.03, grid: [ROWS, COLS], from: 'end', axis: 'x' } })
    },
    [router],
  )

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div ref={wipeRef} className="wipe" aria-hidden="true">
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const r = Math.floor(i / COLS)
          const c = i % COLS
          return <i key={i} className={(r + c) % 2 === 0 ? 'is-blue' : 'is-cream'} />
        })}
      </div>
    </TransitionContext.Provider>
  )
}
