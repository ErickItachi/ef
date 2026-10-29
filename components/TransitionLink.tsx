'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePageTransition } from './PageTransition'
import { useMotion } from './MotionProvider'

type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string; onNavigate?: () => void }

/** Internal link: same-page anchors scroll smoothly, other pages go through the checker transition. */
export default function TransitionLink({ href, onClick, onNavigate, children, ...rest }: Props) {
  const pathname = usePathname()
  const { navigate } = usePageTransition()
  const { scrollTo } = useMotion()
  const focusFrame = useRef<number | null>(null)

  useEffect(() => () => {
    if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
  }, [])

  const handle = (e: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    const [path, hash] = href.split('#')
    const targetPath = path || pathname
    e.preventDefault()
    onNavigate?.()
    if (targetPath === pathname) {
      if (hash) {
        scrollTo(`#${hash}`)
        history.replaceState(null, '', `#${hash}`)
        if (e.detail === 0) {
          if (focusFrame.current !== null) cancelAnimationFrame(focusFrame.current)
          // Let the closing menu release its focus trap before moving to the heading.
          focusFrame.current = requestAnimationFrame(() => {
            focusFrame.current = requestAnimationFrame(() => {
              focusFrame.current = null
              const section = document.getElementById(hash)
              const target = section?.querySelector<HTMLElement>('h1, h2') || section
              if (!target) return
              const temporary = !target.hasAttribute('tabindex')
              if (temporary) target.setAttribute('tabindex', '-1')
              target.focus({ preventScroll: true })
              if (temporary) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
            })
          })
        }
      } else scrollTo(0)
      return
    }
    navigate(href)
  }

  return (
    <Link href={href} onClick={handle} {...rest}>
      {children}
    </Link>
  )
}
