'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { usePageTransition } from './PageTransition'
import { useMotion } from './MotionProvider'

type Props = Omit<React.ComponentProps<typeof Link>, 'href'> & { href: string; onNavigate?: () => void }

/** Internal link: same-page anchors scroll smoothly, other pages go through the checker transition. */
export default function TransitionLink({ href, onClick, onNavigate, children, ...rest }: Props) {
  const pathname = usePathname()
  const { navigate } = usePageTransition()
  const { scrollTo } = useMotion()

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
