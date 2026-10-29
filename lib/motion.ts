'use client'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

let registered = false
export function registerGsap() {
  if (registered || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, useGSAP)
  gsap.defaults({ ease: 'power3.out' })
  registered = true
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** modest devices or data saver: keep the identity, drop the heavy effects */
export const isLowPower = () => {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
  return Boolean(nav.connection?.saveData) || (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || (navigator.hardwareConcurrency || 8) <= 2
}

export const saveData = () => {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } }
  return Boolean(nav.connection?.saveData)
}

export const isFinePointer = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

export { gsap, ScrollTrigger, useGSAP }
