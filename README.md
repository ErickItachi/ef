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
- `content/site.ts` contatos (telefone, WhatsApp, Instagram, CNPJ e e-mail opcional)
- `content/films.ts` portfólio — para adicionar um filme, siga o comentário no topo do arquivo
- `public/media/films/<slug>/` filmes e prévias, incluindo versões 4K nativas quando disponíveis
- `brand/` identidade: fonte Película (OTF/TTF/WOFF2 + código-fonte), SVGs do logotipo, símbolo e xadrez
- `scripts/optimize-images.mjs` gera WebP responsivos (`npm run media`)

## Qualidade e movimento

A abertura mostra somente o batismo, com prévia 4K. Larissa e Roger e o batismo compõem o portfólio. As prévias usam trechos sem títulos ou legendas adicionadas; a seleção está em [`docs/media-previews.md`](docs/media-previews.md).

O batismo tem filme e prévia em 3840 × 2160. O melhor original disponível de Larissa e Roger é 1920 × 1080; a prévia foi refeita a partir desse master, sem ampliação artificial. O player abre na maior resolução disponível em qualquer dispositivo e permite trocar a qualidade preservando a posição. O modo de economia de dados inicia o player em 720p.

Durante o carregamento, o player mantém a capa e informa o estado do vídeo. Falhas oferecem uma nova tentativa sem sair da página. A navegação por teclado leva o foco ao título da seção escolhida no menu.

As prévias carregam ao entrar na tela, pausam ao sair, ao abrir o menu ou ocultar a aba, e liberam os recursos quando ficam distantes. Movimento reduzido e economia de dados mantêm as imagens estáticas; os filmes completos continuam disponíveis ao clicar. Toque usa rolagem nativa; mouse e trackpad usam Lenis.

## Validar e publicar

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

O projeto Vercel `erick-filmes` está conectado a `ErickItachi/ef`, branch `main`. Produção: https://erick-filmes.vercel.app. Confira a conclusão do deployment e a reprodução no domínio após cada publicação.

## A confirmar
- E-mail oficial de contato
- Créditos e ano de cada filme (dados vindos do site da DUUK, onde estavam "a definir")
