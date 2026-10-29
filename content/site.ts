// Dados oficiais da Erick Filmes. Tudo o que aparece no contato e no SEO sai daqui.
// Campos `null` ainda não foram confirmados: o site simplesmente não mostra o canal.

export const site = {
  name: 'Erick Filmes',
  person: 'Erick Borborema',
  role: 'filmmaker',
  city: 'São Paulo',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://erickfilmes.vercel.app',
  description:
    'Erick Filmes — filmes de Erick Borborema, filmmaker em São Paulo. Histórias, pessoas e tudo aquilo que acontece entre uma cena e outra.',
  instagram: { handle: '@oerickfilme', url: 'https://www.instagram.com/oerickfilme/' },
  linktree: 'https://linktr.ee/oerickfilm',
  // A confirmar: e-mail oficial. Defina NEXT_PUBLIC_CONTACT_EMAIL na Vercel para exibi-lo.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || null,
} as const

export const nav = [
  { href: '/#olhar', label: 'o olhar' },
  { href: '/#historia', label: 'história' },
  { href: '/#filmes', label: 'filmes' },
  { href: '/#contato', label: 'contato' },
] as const
