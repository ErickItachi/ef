'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger, registerGsap, prefersReducedMotion, isFinePointer } from '@/lib/motion'

type MotionApi = {
  reduced: boolean
  scrollTo: (target: string | number | HTMLElement, opts?: { immediate?: boolean; offset?: number }) => void
  lock: (locked: boolean) => void
}

const MotionContext = createContext<MotionApi>({ reduced: false, scrollTo: () => {}, lock: () => {} })
export const useMotion = () => useContext(MotionContext)

registerGsap()

export default function MotionProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    // smooth scroll only where it helps: mouse/trackpad, motion allowed. Touch keeps native scrolling.
    if (reduced || prefersReducedMotion() || !isFinePointer()) return
    const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9, anchors: false })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [reduced])

  const scrollTo = useCallback<MotionApi['scrollTo']>((target, opts = {}) => {
    // a menu link scrolls while the menu is still closing: release the scroll lock first
    document.documentElement.classList.remove('is-locked')
    lenisRef.current?.start()
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    if (target !== 0 && !el && typeof target !== 'number') return
    if (opts.immediate || prefersReducedMotion()) {
      const top = typeof target === 'number' ? target : (el as HTMLElement).getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0)
      lenisRef.current?.resize()
      window.scrollTo({ top, behavior: 'auto' })
      lenisRef.current?.scrollTo(top, { immediate: true, force: true })
      return
    }
    if (lenisRef.current) {
      lenisRef.current.scrollTo((el ?? target) as HTMLElement | number, { immediate: opts.immediate || prefersReducedMotion(), offset: opts.offset ?? 0, duration: 1.05 })
    } else {
      const top = typeof target === 'number' ? target : (el as HTMLElement).getBoundingClientRect().top + window.scrollY + (opts.offset ?? 0)
      window.scrollTo({ top, behavior: opts.immediate || prefersReducedMotion() ? 'auto' : 'smooth' })
    }
  }, [])

  const lock = useCallback((locked: boolean) => {
    if (lenisRef.current) {
      if (locked) lenisRef.current.stop()
      else lenisRef.current.start()
    }
    document.documentElement.classList.toggle('is-locked', locked)
  }, [])

  const value = useMemo(() => ({ reduced, scrollTo, lock }), [reduced, scrollTo, lock])
  return <MotionContext.Provider value={value}>{children}</MotionContext.Provider>
}
