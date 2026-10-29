# Contexto da Erick Filmes — leia antes de continuar o projeto

Esta pasta reúne tudo o que foi criado para a Erick Filmes (marca pessoal do filmmaker Erick Borborema, São Paulo), para que qualquer pessoa ou IA consiga continuar o trabalho sem o histórico da conversa original.

## O que tem aqui

| Pasta / arquivo | Conteúdo |
|---|---|
| `idv/IDV-Erick-Filmes.pdf` | Manual de identidade visual completo (21 pranchas). |
| `voz/brand-voice-storytelling.md` | Documento de voz e storytelling escrito pelo Erick. **Regra para qualquer texto.** |
| `marca/svg/` | Logotipo, símbolo, xadrez, títulos e textos na Película, em SVG. |
| `marca/adesivos/` | Arte e contorno de corte dos adesivos (SVG/PNG). |
| `marca/papelaria/` | Carta A4, cartão (frente/verso) e envelope DL em alta. |
| `marca/mockups/` | Mockups aprovados do boné (4K) e a tela do Instagram. |
| `../brand/fonts/` | Fonte **Película Bold** em OTF, TTF e WOFF2. |
| `../brand/pelicula-source/` | Código Python que desenha a fonte e gera os arquivos (`python3 build_font.py . <saida>`; precisa de `shapely` e `fonttools`). |

## Identidade visual (resumo)

- **Logotipo:** "erick filmes", sempre em minúsculas, desenhado do zero (círculos e retas, pontas com corte reto horizontal, "fi" em ligadura: o gancho do f vira o pingo do i). Não redesenhar: use o SVG ou a fonte.
- **Símbolo:** o "e" do logotipo esticado na proporção 1.85:1 (tela plana do cinema). Referência indireta à câmera — o Erick recusou símbolos literais de câmera.
- **Cores:** Azul Tela `#1554D6` (60%), Creme Película `#EEEAE1` (30%), Preto Sala `#121212` (10%).
- **Tipografia:** Película (títulos, sempre minúsculas, entrelinha justa) + Inter Tight (textos).
- **Xadrez:** elemento old school de 2 linhas × 10 colunas; casas azuis cheias, casas creme vazadas (mostram o fundo). Começa sempre cheio no canto superior esquerdo. Sobre azul, vira creme.
- **Fotos:** retrato em duotone azul/creme ou P&B; stills reais dos filmes.

## Preferências do Erick (aprendidas na prática)

- Gosta de: clean, satisfatório, composições fora do padrão, coisas **reais** (fotos reais, não ilustrações).
- Recusou: símbolos literais de câmera; mockups ilustrados; mockup 3D do iPhone renderizado (pareceu falso). O que funcionou: aplicar a marca sobre **foto real enviada por ele** (ex.: boné).
- Tipografia precisa estar "certinha": já foram corrigidos S, E, F, Q, Y, ?, cedilha e os números 1, 2, 3, 4, 5, 6, 9.
- Fala em português, direto. Quer ver prévias antes de publicar coisas grandes.

## Projetos e onde estão

- **Site Erick Filmes:** este repositório (`ErickItachi/ef`), Next.js 16 + React 19 + TypeScript + GSAP + Lenis. Publicado na Vercel (time "duuk", projeto `erick-filmes`): https://erick-filmes.vercel.app. Cada push no `main` publica.
  - Narrativa: abertura (tela 1.85:1 que se abre com a rolagem) → o olhar → a pessoa (história) → filmes → contato. Transição de página com o xadrez.
  - Portfólio atual: Casamento (Larissa e Roger) e Batismo (Igreja Burn). Vídeos em `public/media/films/`.
  - Instagram: @oerickfilme · links: linktr.ee/oerickfilm.
- **Site DUUK Films** (`ErickItachi/duuk`, duukfilms.com): marca separada, onde o Erick é diretor. Regras no `AGENTS.md` daquele repo (publicar via `main`; painel admin só na branch `preview/admin-panel`). Última mudança: vídeos sempre em alta qualidade.
- **Canvas da IDV** (claude.ai, privado do Erick): https://claude.ai/artifact/FUEkP3Gp1ncd4v1szkJRTD — o PDF desta pasta é a exportação dele.

## Pendências / a confirmar

- E-mail oficial de contato (variável `NEXT_PUBLIC_CONTACT_EMAIL` na Vercel).
- Créditos e ano de cada filme.
- Domínio próprio para o site.
- Ajuste fino do alinhamento da abertura no desktop; rodar Lighthouse.
- Mockups em foto real de camiseta, garrafa, xícara, caneta, papelaria e adesivos (aguardando fotos do Erick).
- Sugestão: a bio atual do Instagram ("Tornando ideias reais, frame a frame") contraria o documento de voz.
