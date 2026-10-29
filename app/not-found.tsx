import TransitionLink from '@/components/TransitionLink'
import { Checker } from '@/components/Brand'

export default function NotFound() {
  return (
    <main id="conteudo" className="lost" data-theme="blue">
      <p className="label">404</p>
      <h1 className="lost__title display">essa cena ficou na edição.</h1>
      <TransitionLink href="/" className="lost__link">
        voltar para o início <span aria-hidden="true">→</span>
      </TransitionLink>
      <Checker className="lost__checker" />
    </main>
  )
}
