'use client'

import { useRef } from 'react'
import { gsap, useGSAP, prefersReducedMotion, isLowPower } from '@/lib/motion'
import Picture from './Picture'
import Reveal from './Reveal'
import { Lines } from './Split'
import { useMotion } from './MotionProvider'

// Texts: Erick's own bio and the brand voice document. Nothing here is invented.
const chapters = [
  {
    title: 'antes da câmera',
    text: 'Cresci no auge do YouTube, em uma geração que aprendeu a consumir histórias através de vídeos. Durante toda a minha infância, fui cercado por esse universo, mesmo sem imaginar que, anos depois, o audiovisual se tornaria parte tão importante da minha vida.',
  },
  {
    title: 'a igreja',
    text: 'Meu primeiro contato real com esse mundo aconteceu servindo no ministério de mídia da minha igreja. Foi ali que comecei a pegar em uma câmera, editar, experimentar, errar e entender, na prática, como uma imagem pode carregar uma mensagem.',
  },
  {
    title: 'outras histórias',
    text: 'Com o tempo, aquilo que começou de forma simples se transformou em profissão. Vieram casamentos, eventos, produções comerciais e outros projetos — e diferentes maneiras de contar cada um deles.',
  },
  {
    title: 'hoje',
    text: 'Hoje, minha atuação está principalmente na direção audiovisual. Gosto de pensar cada projeto desde a ideia, entendendo o que precisa ser comunicado e transformando isso em conceito, linguagem e imagem.',
  },
]

export default function Story() {
  const root = useRef<HTMLElement>(null)
  const { reduced } = useMotion()

  useGSAP(
    () => {
      if (prefersReducedMotion() || isLowPower()) return
      root.current!.querySelectorAll<HTMLElement>('.parallax-img').forEach((img) => {
        gsap.fromTo(img, { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } })
      })
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="historia" className="story" data-theme="blue" aria-labelledby="historia-titulo">
      <div className="story__grid">
        <Reveal className="story__aside">
          <p className="label" data-fade>
            a pessoa
          </p>
          <h2 id="historia-titulo" className="story__title display">
            <Lines lines={['eu sou', 'o erick.']} />
          </h2>
          <figure className="story__portrait" data-clip>
            <Picture name="erick-retrato" alt="Retrato de Erick Borborema, de perfil" sizes="(min-width: 960px) 30vw, 70vw" className="parallax-img" />
            <figcaption data-fade>Erick Borborema · filmmaker</figcaption>
          </figure>
        </Reveal>

        <ol className="story__chapters">
          {chapters.map((c, i) => (
            <Reveal as="li" className="story__chapter" key={c.title}>
              <span className="story__num display" data-fade>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="story__chap display">
                <Lines lines={[c.title]} />
              </h3>
              <p data-fade>{c.text}</p>
              {i === 1 && (
                <figure className="story__set" data-clip>
                  <Picture name="erick-set" alt="Bastidor de gravação: câmera no ombro, em preto e branco" sizes="(min-width: 960px) 34vw, 80vw" className="parallax-img" />
                  <figcaption data-fade>no set</figcaption>
                </figure>
              )}
            </Reveal>
          ))}
        </ol>
      </div>

      <Reveal className="story__close">
        <p className="story__closing display">
          <Lines lines={['e continuo descobrindo', 'o meu jeito', 'de fazer filmes.']} />
        </p>
      </Reveal>
    </section>
  )
}
