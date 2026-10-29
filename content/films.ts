// Portfólio. Para adicionar um filme: coloque os arquivos em public/media/films/<slug>/
// (film-1080.mp4, film-720.mp4, preview.mp4), a imagem em scripts/source-images/<slug>.jpg,
// rode `npm run media` e acrescente um item nesta lista. A página do filme é gerada sozinha.
import images from './images.generated.json'

export type Film = {
  slug: string
  title: string          // sempre em minúsculas: é escrito na Película
  category: string
  place?: string
  client?: string
  year?: string
  logline: string
  description: string
  duration: string
  ultraHd?: boolean
  poster: keyof typeof images
  posterAlt: string
  focus?: string         // object-position do pôster e do vídeo
  credits: { role: string; name: string }[]   // a confirmar: vazio = a seção de créditos não aparece
}

export const films: Film[] = [
  {
    slug: 'larissa-roger',
    title: 'larissa e roger',
    category: 'casamento',
    year: '2026',
    logline: 'um sim debaixo da pérgola.',
    description: 'O casamento de Larissa e Roger.',
    duration: '2:28',
    poster: 'larissa-roger',
    posterAlt: 'Noivo beija a mão da noiva debaixo de uma pérgola com flores',
    focus: '50% 40%',
    credits: [],
  },
  {
    slug: 'igreja-burn',
    ultraHd: true,
    title: 'batismo',
    category: 'igreja',
    place: 'Igreja Burn · Guaianases',
    year: '2026',
    logline: 'o antigo já passou.',
    description: 'Batismo realizado na Igreja Burn, em Guaianases.',
    duration: '0:21',
    poster: 'igreja-burn',
    posterAlt: 'Mão sobre as costas de uma pessoa com camiseta escrita “the old is gone”',
    focus: '50% 50%',
    credits: [],
  },
]

export const filmMedia = (slug: string) => {
  const ultraHd = films.find((film) => film.slug === slug)?.ultraHd
  return {
    uhd: ultraHd ? `/media/films/${slug}/film-4k.mp4` : null,
    hd: `/media/films/${slug}/film-1080.mp4`,
    sd: `/media/films/${slug}/film-720.mp4`,
    preview: `/media/films/${slug}/preview.mp4`,
    previewUhd: ultraHd ? `/media/films/${slug}/preview-4k.mp4` : null,
  }
}

export const getFilm = (slug: string) => films.find((f) => f.slug === slug)
export const image = (key: keyof typeof images) => images[key]
