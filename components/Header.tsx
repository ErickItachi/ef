'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'
import { nav, site } from '@/content/site'
import { Checker, Wordmark } from './Brand'
import TransitionLink from './TransitionLink'
import { useMotion } from './MotionProvider'

export default function Header() {
  const pathname = usePathname()
  const [menuState, setMenuState] = useState({ path: pathname, open: false })
  if (menuState.path !== pathname) setMenuState({ path: pathname, open: false })
  const open = menuState.path === pathname && menuState.open
  const [theme, setTheme] = useState('cream')
  const headerRef = useRef<HTMLElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const restoreFocusRef = useRef(true)
  const { lock } = useMotion()

  const closeMenu = useCallback((restoreFocus = true) => {
    restoreFocusRef.current = restoreFocus
    setMenuState((state) => ({ ...state, open: false }))
  }, [])

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
    const links = menu.querySelectorAll('.menu__link .li')
    gsap.killTweensOf([menu, ...links])
    const reduced = prefersReducedMotion()
    let focusTimer: number | undefined

    if (open) {
      lock(true)
      menu.scrollTop = 0
      gsap.set(menu, { visibility: 'visible' })
      if (!reduced) {
        gsap.fromTo(menu, { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.inOut' })
        gsap.fromTo(links, { yPercent: 110 }, { yPercent: 0, duration: 0.7, stagger: 0.055, delay: 0.18, ease: 'expo.out' })
      } else {
        gsap.set(menu, { clipPath: 'none' })
        gsap.set(links, { yPercent: 0 })
      }
      const first = menu.querySelector<HTMLElement>('a')
      focusTimer = window.setTimeout(() => first?.focus({ preventScroll: true }), reduced ? 0 : 250)

      const focusable = () => Array.from(menu.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), [tabindex="0"]'))
        .filter((element) => element.getClientRects().length > 0)
      const onKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          closeMenu()
          return
        }
        if (event.key !== 'Tab') return
        const elements = focusable()
        const firstElement = elements[0]
        const lastElement = elements[elements.length - 1]
        if (!firstElement || !lastElement) return
        if (event.shiftKey && (document.activeElement === firstElement || !menu.contains(document.activeElement))) {
          event.preventDefault()
          lastElement.focus()
        } else if (!event.shiftKey && (document.activeElement === lastElement || !menu.contains(document.activeElement))) {
          event.preventDefault()
          firstElement.focus()
        }
      }
      const containFocus = (event: FocusEvent) => {
        if (event.target instanceof Node && !menu.contains(event.target)) first?.focus({ preventScroll: true })
      }
      document.addEventListener('keydown', onKey)
      document.addEventListener('focusin', containFocus)
      return () => {
        window.clearTimeout(focusTimer)
        document.removeEventListener('keydown', onKey)
        document.removeEventListener('focusin', containFocus)
        gsap.killTweensOf([menu, ...links])
        lock(false)
      }
    }

    if (menu.style.visibility === 'visible') {
      if (reduced) gsap.set(menu, { visibility: 'hidden' })
      else gsap.to(menu, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.4, ease: 'power3.inOut', onComplete: () => { gsap.set(menu, { visibility: 'hidden' }) } })
      if (restoreFocusRef.current) buttonRef.current?.focus({ preventScroll: true })
    }
    return () => {
      gsap.killTweensOf([menu, ...links])
    }
  }, [open, lock, closeMenu])

  return (
    <>
      <header ref={headerRef} className={`header is-${open ? 'menu' : theme}`} style={{ pointerEvents: open ? 'none' : undefined }}>
        <TransitionLink href="/" className="header__logo" aria-label="Erick Filmes — início" tabIndex={open ? -1 : undefined}>
          <Wordmark title="erick filmes" />
        </TransitionLink>
        <button
          ref={buttonRef}
          type="button"
          className="header__menu"
          aria-expanded={open}
          aria-controls="menu"
          aria-haspopup="dialog"
          tabIndex={open ? -1 : 0}
          style={{ visibility: open ? 'hidden' : undefined }}
          onClick={() => {
            restoreFocusRef.current = true
            setMenuState({ path: pathname, open: true })
          }}
        >
          <span className="header__menu-label">{open ? 'fechar' : 'menu'}</span>
          <span className={`header__menu-icon${open ? ' is-open' : ''}`} aria-hidden="true">
            <i />
            <i />
          </span>
        </button>
      </header>

      <div ref={menuRef} id="menu" className="menu" role="dialog" aria-modal="true" aria-label="Menu" inert={!open} data-lenis-prevent style={{ visibility: 'hidden' }}>
        <button type="button" className="menu__close header__menu" aria-label="Fechar menu" onClick={() => closeMenu()} tabIndex={open ? 0 : -1}>
          <span className="header__menu-label">fechar</span>
          <span className="header__menu-icon is-open" aria-hidden="true"><i /><i /></span>
        </button>
        <nav className="menu__nav" aria-label="Seções">
          <ol>
            {nav.map((item, i) => (
              <li key={item.href}>
                <TransitionLink href={item.href} className="menu__link" onNavigate={() => closeMenu(false)} tabIndex={open ? 0 : -1}>
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
          <a href={site.phone.href} tabIndex={open ? 0 : -1}>
            {site.phone.display}
          </a>
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
