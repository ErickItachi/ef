# Erick Filmes — site oficial

> Contexto completo da marca (IDV em PDF, fonte, voz, decisões e pendências): veja [`contexto/README.md`](contexto/README.md).

Next.js 16 · React 19 · TypeScript · GSAP/ScrollTrigger · Lenis.

## Rodar
```
npm install
npm run dev
```

## Estrutura
- `app/` páginas (home, `/filmes/[slug]`, 404, sitemap, robots) e fontes locais
- `components/` abertura, olhar, história, filmes, contato, menu, transição em xadrez
- `content/site.ts` contatos (Instagram, linktr.ee, e-mail via `NEXT_PUBLIC_CONTACT_EMAIL`)
- `content/films.ts` portfólio — para adicionar um filme, siga o comentário no topo do arquivo
- `public/media/films/<slug>/` vídeos 1080p, 720p e prévia
- `brand/` identidade: fonte Película (OTF/TTF/WOFF2 + código-fonte), SVGs do logotipo, símbolo e xadrez
- `scripts/optimize-images.mjs` gera WebP responsivos (`npm run media`)

## A confirmar
- E-mail oficial de contato
- Créditos e ano de cada filme (dados vindos do site da DUUK, onde estavam "a definir")
- Categoria de "arena xp" (está como "show ao vivo")
