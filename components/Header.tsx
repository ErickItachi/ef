'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import { nav, site } from '@/content/site'
import { Checker, Wordmark } from './Brand'
import TransitionLink from './TransitionLink'
import { useMotion } from './MotionProvider'

export default function Header() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState('cream')
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { lock } = useMotion()

  // the header takes the colour of whatever section is under it
  useEffect(() => {
    const triggers: ScrollTrigger[] = []
    const id = requestAnimationFrame(() => {
      document.querySelectorAll<HTMLElement>('[data-theme]').forEach((section) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top 32px',
            end: 'bottom 32px',
            onToggle: (self) => self.isActive && setTheme(section.dataset.theme || 'cream'),
          }),
        )
      })
      const first = document.querySelector<HTMLElement>('[data-theme]')
      if (first && window.scrollY < 10) setTheme(first.dataset.theme || 'cream')
    })
    return () => {
      cancelAnimationFrame(id)
      triggers.forEach((t) => t.kill())
    }
  }, [pathname])

  // menu open / close
  useEffect(() => {
    const menu = menuRef.current
    if (!menu) return
    lock(open)
    const links = menu.querySelectorAll('.menu__link .li')
    const reduced = prefersReducedMotion()
    if (open) {
      gsap.set(menu, { visibility: 'visible' })
      if (!reduced) {
        gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'expo.inOut' })
        gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, delay: 0.3, ease: 'expo.out' })
      } else gsap.set(menu, { clipPath: 'none' })
      const first = menu.querySelector<HTMLElement>('a')
      setTimeout(() => first?.focus({ preventScroll: true }), reduced ? 0 : 450)
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    if (menu.style.visibility === 'visible') {
      if (reduced) gsap.set(menu, { visibility: 'hidden' })
      else gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.6, ease: 'expo.inOut', onComplete: () => { gsap.set(menu, { visibility: 'hidden' }) } })
      buttonRef.current?.focus({ preventScroll: true })
    }
  }, [open, lock])

  useEffect(() => setOpen(false), [pathname])

  return (
    <>
      <header ref={headerRef} className={`header is-${open ? 'menu' : theme}`}>
        <TransitionLink href="/" className="header__logo" aria-label="Erick Filmes — início">
          <Wordmark title="erick filmes" />
        </TransitionLink>
        <button
          ref={buttonRef}
          type="button"
          className="header__menu"
          aria-expanded={open}
          aria-controls="menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="header__menu-label">{open ? 'fechar' : 'menu'}</span>
          <span className={`header__menu-icon${open ? ' is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      <div ref={menuRef} id="menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu" inert={!open} style={{ visibility: 'hidden' }}>
        <nav className="menu__nav" aria-label="Seções">
          <ol>
            {nav.map((item, i) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="menu__link" onNavigate={() => setOpen(false)} tabIndex={open ? 0 : -1}>
                  <span className="menu__num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="line">
                    <span className="li">{item.label}</span>
                  </span>
                </TransitionLink>
              </li>
            ))}
          </ol>
        </nav>
        <div className="menu__foot">
          <a href={site.instagram.url} target="_blank" rel="noreferrer" tabIndex={open ? 0 : -1}>
            instagram {site.instagram.handle}
          </a>
          {site.email && (
            <a href={`mailto:${site.email}`} tabIndex={open ? 0 : -1}>
              {site.email}
            </a>
          )}
          <Checker className="menu__checker" />
        </div>
      </div>
    </>
  )
}
