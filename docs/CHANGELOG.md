# Changelog

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
