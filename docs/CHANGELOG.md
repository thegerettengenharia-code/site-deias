# Changelog

## 2026-08-08 (novo) — Envio de foto para a IA editar/criar a partir dela

### Novo
- Botão **Foto** no formulário de geração (com ícone de clipe): anexe uma imagem do dispositivo para a IA editar ou criar algo a partir dela.
- A imagem é reduzida para no máx. 1024px e enviada como JPEG (data URL). Preview com miniatura e botão ✕ para remover.
- Colar imagem direto no campo de prompt (Ctrl/Cmd+V) também anexa.
- No modo vídeo o botão fica desabilitado (imagem vale só para fotos) — anexada antes da troca é preservada, com aviso na nota.

### Como a imagem chega a cada API
- **Grátis (FLUX/Z-Image, Pollinations):** parâmetro `image=` com o data URL na URL da geração.
- **Premium (OpenRouter):** campo `input_references: [{ type: "image_url", image_url: { url } }]` no POST de `/api/v1/images` (padrão documentado para edição de imagem).
- O fallback automático (sem créditos → FLUX) mantém a imagem anexada.

### Validação (puppeteer + interceptação)
- Preview aparece ao anexar (data URL JPEG), nota atualiza, remover limpa tudo.
- Geração conclui com a requisição à Pollinations contendo `&image=data%3Aimage...`.
- Modo vídeo desabilita o anexo; voltar ao modo foto reabilita.
- Mobile (390px): sem overflow horizontal na área do gerador.
- `node --check js/app.js` — sintaxe OK.

## 2026-08-08 (PWA) — Instalável como aplicativo

- `manifest.webmanifest`: nome, ícones 192/512 (any + maskable), `display: standalone`, cores do tema.
- `sw.js`: service worker com cache da estrutura do app (network-first + fallback offline) — o site abre mesmo sem internet após a primeira visita.
- Ícones gerados em `icons/` (icon-180/192/512.png a partir de `icons/icon.svg`).
- `index.html`: `link rel="manifest"`, `apple-touch-icon` (iOS) e registro do service worker.
- `vercel.json`: headers de `Content-Type` para o manifest, `no-cache` no SW e cache imutável nos ícones.
- Validado: SW registrado e ativado, página carrega offline.

## 2026-08-08 (correção) — Seletor de modelo no gerador + correção mobile

### Novo
- Adicionado dropdown de modelo (`#modelSel`) na linha do formulário de geração (ao lado de proporção/duração e do botão **Gerar**), sincronizado com a lista lateral e os cards do catálogo. Lista só os modelos do modo ativo (foto/vídeo) e alterna junto com o modo. No mobile ocupa linha inteira.

### Correção mobile (bug crítico)
- `.gen-shell` explodia para ~1956px no mobile/tablet: a lista horizontal de modelos forçava a coluna do grid a crescer até o mínimo-conteúdo, e o `body { overflow-x: hidden }` cortava o gerador (só a fatia esquerda aparecia). Corrigido com `min-width: 0` em `.gen-side` no breakpoint ≤1024px — o gerador passa a ocupar 100% da largura e a lista de modelos rola horizontalmente de fato.

## 2026-08-08 — Overhaul responsivo + rebranding "The-Gerett-Studio"

### Rebranding
- Nome do site alterado de **ARCA** para **The-Gerett-Studio** (title, meta description, `.brand-name` no nav e footer, aria-labels).
- Meta tags mobile/PWA adicionadas: `viewport-fit=cover`, `mobile-web-app-capable`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`.
- `referrer`/`Referer`/`HTTP-Referer`/`X-Title` nas chamadas à Pollinations atualizados para `the-gerett-studio.app`.
- **Dados preservados:** chaves de `localStorage` continuam com o prefixo `arca.*` de propósito (compatibilidade), com comentário no `js/app.js`.
- **Lógica de negócio inalterada** — mudanças visuais apenas.

### Responsividade (breakpoints: desktop ≥1025 · tablet 768–1024 · mobile grande 481–767 · mobile ≤480)
- `index.html`: `img, video { max-width: 100% }` e `-webkit-text-size-adjust: 100%`.
- Navbar: altura 60px no mobile, hambúrguer como menu dropdown, `env(safe-area-inset-top)`.
- Galeria `.gen-gallery`: 4 colunas (desktop) → 2 (tablet) → 1 (mobile).
- Lista de modelos: grade 3 → 2 → 1; carrossel horizontal com scroll-snap no mobile.
- Área de geração (`.gen-body`): `max-height: 58vh; min-height: 46vh` no mobile.
- Input do prompt com `font-size: 16px` no mobile (evita zoom automático no iOS).
- Seletores de opções: 50% da largura no mobile; botão gerar ocupa 100%.
- Settings vira bottom-sheet no mobile (`align-items: end`, altura limitada com scroll interno).
- Alvos de toque ≥ 44px: hambúrguer, `.icon-btn`, `.mode-btn`, `.send-btn` (48px), botões de ação da mídia.
- Spinner no botão gerar: animação de piscar no ícone de seta quando desabilitado.

### Arquivos alterados
| Arquivo | Alteração |
|---|---|
| `index.html` | Rebranding + metas mobile + `img/video max-width` |
| `css/styles.css` | Overhaul responsivo (7 media queries, touch targets, spinner) |
| `js/app.js` | Strings de marca + header de comentário |

### Arquivos inalterados
- `vercel.json`, `scripts/inject-key.mjs` (continua injetando `__ARCA_OPENROUTER_KEY__` via env `OPENROUTER_KEY` na build da Vercel).

### Validação
- `node --check js/app.js` — sintaxe OK.
- Teste automatizado via Chrome DevTools Protocol em 360 / 375 / 390 / 414 / 768 / 1024 / 1440 px:
  - `overflowX = 0` (sem scroll horizontal) em todas as larguras;
  - galeria 4 → 2 → 1 conforme breakpoint;
  - alvos de toque mobile ≥ 44px (44×44 confirmado);
  - input 16px no mobile.
- Screenshots de referência em `C:\Users\User\AppData\Local\Temp\opencode\shots\`.
