import { site } from '@/content/site'
import { Checker, Symbol } from './Brand'
import Reveal from './Reveal'
import TransitionLink from './TransitionLink'
import { Lines } from './Split'

export default function Contact() {
  return (
    <section id="contato" className="contact" data-theme="blue" aria-labelledby="contato-titulo">
      <Reveal className="contact__inner">
        <p className="label" data-fade>
          contato
        </p>
        <h2 id="contato-titulo" className="contact__title display">
          <Lines lines={['me conta', 'o que você está', 'imaginando.']} />
        </h2>
        <ul className="contact__links" data-fade>
          <li>
            <a href={site.instagram.url} target="_blank" rel="noreferrer">
              <span className="contact__kind">instagram</span>
              <span className="contact__value">{site.instagram.handle}</span>
              <span className="contact__arrow" aria-hidden="true">↗</span>
            </a>
          </li>
          {site.email && (
            <li>
              <a href={`mailto:${site.email}`}>
                <span className="contact__kind">e-mail</span>
                <span className="contact__value">{site.email}</span>
                <span className="contact__arrow" aria-hidden="true">↗</span>
              </a>
            </li>
          )}
          <li>
            <a href={site.linktree} target="_blank" rel="noreferrer">
              <span className="contact__kind">links</span>
              <span className="contact__value">linktr.ee/oerickfilm</span>
              <span className="contact__arrow" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </Reveal>

      <footer className="footer">
        <Checker className="footer__checker" />
        <div className="footer__row">
          <Symbol className="footer__symbol" />
          <p>
            Erick Filmes · {site.city}
            <br />© {new Date().getFullYear()} Erick Borborema
          </p>
          <TransitionLink href="/#topo" className="footer__top">
            voltar ao início <span aria-hidden="true">↑</span>
          </TransitionLink>
        </div>
      </footer>
    </section>
  )
}
