import Hero from '@/components/Hero'
import Manifesto from '@/components/Manifesto'
import Story from '@/components/Story'
import Films from '@/components/Films'
import Contact from '@/components/Contact'

// The site is told like a short film: the look, the person, the work — then the credits.
export default function Home() {
  return (
    <main id="conteudo">
      <Hero />
      <Manifesto />
      <Story />
      <Films />
      <Contact />
    </main>
  )
}
