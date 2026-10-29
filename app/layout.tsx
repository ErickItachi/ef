import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { site } from '@/content/site'
import MotionProvider from '@/components/MotionProvider'
import PageTransition from '@/components/PageTransition'
import Header from '@/components/Header'
import './globals.css'

// Película: the Erick Filmes typeface, drawn from the logotype (brand/fonts has OTF, TTF and WOFF2).
const pelicula = localFont({
  src: './fonts/Pelicula-Bold.woff2',
  weight: '700',
  style: 'normal',
  display: 'swap',
  variable: '--font-pelicula',
  preload: true,
  fallback: ['Inter Tight', 'system-ui', 'sans-serif'],
})

const inter = localFont({
  src: './fonts/InterTight-Variable-latin.woff2',
  weight: '100 900',
  display: 'swap',
  variable: '--font-text',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
})

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Erick Filmes — filmes de Erick Borborema', template: '%s · Erick Filmes' },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.person }],
  keywords: ['Erick Filmes', 'Erick Borborema', 'filmmaker', 'São Paulo', 'filme de casamento', 'audiovisual', 'direção'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: site.name,
    title: 'Erick Filmes',
    description: 'Histórias, pessoas e tudo aquilo que acontece entre uma cena e outra.',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'erick filmes' }],
  },
  twitter: { card: 'summary_large_image', title: 'Erick Filmes', description: 'Histórias, pessoas e tudo aquilo que acontece entre uma cena e outra.', images: ['/og.jpg'] },
  icons: { icon: [{ url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-icon.png' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#EEEAE1',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Before the first paint: mark JS and, unless motion is reduced, keep the checker closed for the opening.
const boot = `(()=>{const d=document.documentElement;d.classList.add('js');if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('ef-seen')){d.classList.add('js-intro');try{sessionStorage.setItem('ef-seen','1')}catch(e){}setTimeout(()=>d.classList.remove('js-intro'),3500)}})()`

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.person,
  jobTitle: 'Filmmaker',
  brand: { '@type': 'Brand', name: site.name },
  address: { '@type': 'PostalAddress', addressLocality: 'São Paulo', addressCountry: 'BR' },
  url: site.url,
  sameAs: [site.instagram.url, site.linktree],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${pelicula.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a className="skip" href="#conteudo">
          Pular para o conteúdo
        </a>
        <MotionProvider>
          <PageTransition>
            <Header />
            {children}
          </PageTransition>
        </MotionProvider>
      </body>
    </html>
  )
}
