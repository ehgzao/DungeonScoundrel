# 📊 Performance Map - Dungeon Scoundrel

**Data:** 2025-11-27
**Versão:** 1.4.3
**Lighthouse Score Atual:** 51% (Performance)

---

## 🔴 Métricas Core Web Vitals

| Métrica | Atual | Meta | Gap | Status |
|---------|-------|------|-----|--------|
| **FCP** | 3.1s | <1.8s | -1.3s | 🔴 |
| **LCP** | 4.1s | <2.5s | -1.6s | 🔴 |
| **Speed Index** | 3.1s | <2.3s | -0.8s | 🔴 |
| **TBT** | 270ms | <200ms | -70ms | 🟡 |
| **CLS** | 0.019 | <0.1 | ✅ | 🟢 |
| **TTI** | 4.2s | <3.8s | -0.4s | 🟡 |

---

## 📜 Scripts por Ordem de Carregamento

| # | Script | Tamanho | Crítico? | Atributo | Notas |
|---|--------|---------|----------|----------|-------|
| 1 | `<script>` inline (silent logging) | ~0.5KB | ✅ SIM | blocking | Deve ser primeiro |
| 2 | `error-handler.js` | 2.3 KB | ✅ SIM | blocking | Handler de erros global |
| 3 | `firebase-config.js` | ~1 KB | ✅ SIM | blocking | Config Firebase |
| 4 | `inline-scripts.js` | 36 KB | ❌ | defer | Waitlist/Email systems |
| 5 | `firebase-auth.js` | 20.1 KB | 🟡 | module+defer | Auth Firebase |
| 6 | `helpers.js` | 35.5 KB | 🟡 | defer | Utils gerais |
| 7 | `mobile-optimization.js` | 10.1 KB | ❌ | defer | Otimização mobile |
| 8 | `offline-storage.js` | 16 KB | ❌ | defer | IndexedDB |
| 9 | `achievements.js` | 14.2 KB | ❌ | defer | Sistema achievements |
| 10 | `game-data.js` | 27.8 KB | ❌ | defer | Dados do jogo |
| 11 | `stats.js` | 6 KB | ❌ | defer | Stats permanentes |
| 12 | `leaderboard.js` | 9.7 KB | ❌ | defer | Leaderboard |
| 13 | `audio-context.js` | ~2 KB | ❌ | defer | Contexto de áudio |
| 14 | `music.js` | 20 KB | ❌ | defer | Sistema de música |
| 15 | EmailJS CDN | ~15 KB | ❌ | async | Serviço de email |
| 16 | `init-emailjs.js` | ~1 KB | ❌ | defer | Init EmailJS |
| 17 | `firebase-ready.js` | 1 KB | ❌ | defer | Firebase ready check |
| 18 | `game.js` | **142.3 KB** | ✅ SIM | module+defer | **⚠️ MAIOR ARQUIVO** |
| 19 | `codex.js` | 15.4 KB | ❌ | defer | Sistema Codex |
| 20 | SW Registration (inline) | ~0.2 KB | ❌ | blocking | Service Worker |

### **Total JavaScript: ~460 KB**

### Scripts NÃO carregados no index.html (módulos do game.js):
| Script | Tamanho | Carregado por |
|--------|---------|---------------|
| `game-combat.js` | 36.3 KB | import em game.js |
| `game-classes.js` | 22.1 KB | import em game.js |
| `game-deck.js` | 15.3 KB | import em game.js |
| `game-shop.js` | 10.3 KB | import em game.js |
| `game-relics.js` | 7 KB | import em game.js |
| `game-events.js` | 6.1 KB | import em game.js |
| `game-state.js` | 8.1 KB | import em game.js |
| `game-sounds.js` | 12.7 KB | import em game.js |
| `game-constants.js` | 14.2 KB | import em game.js |

---

## 🎨 CSS por Ordem de Carregamento

| # | Stylesheet | Tamanho | Crítico? | Status |
|---|------------|---------|----------|--------|
| 1 | CSS crítico inline | ~0.3 KB | ✅ SIM | ✅ OK |
| 2 | Google Fonts (Cinzel) | ~15 KB | 🟡 | ⚠️ Render-blocking |
| 3 | `variables.css` | 0.8 KB | ✅ SIM | ⚠️ Render-blocking |
| 4 | `styles.css` | **72.2 KB** | 🟡 | **⚠️ MAIOR, BLOCKING** |
| 5 | `animations.css` | 2.1 KB | ❌ | ⚠️ Render-blocking |
| 6 | `scrollbar.css` | 4.7 KB | ❌ | ⚠️ Render-blocking |
| 7 | `waitlist.css` | 3.5 KB | ❌ | ⚠️ Render-blocking |
| 8 | `buttons.css` | 2.5 KB | ❌ | ⚠️ Render-blocking |

### **Total CSS: ~86 KB (todos render-blocking exceto inline)**

---

## 🖼️ Imagens (Ordenadas por Tamanho)

| Imagem | Tamanho | Uso | LCP? |
|--------|---------|-----|------|
| `title-logo-readme.png` | 245.4 KB | Apenas README | ❌ |
| `avatar-dancer.webp` | 130.3 KB | Class select | ❌ |
| `dungeon-bg.webp` | **119.2 KB** | **Welcome screen BG** | **✅ LCP** |
| `avatar-knight.webp` | 87.3 KB | Class select | ❌ |
| `avatar-rogue.webp` | 73.7 KB | Class select | ❌ |
| `avatar-scoundrel.webp` | 69 KB | Class select | ❌ |
| `title-logo.webp` | 48.2 KB | Welcome screen | 🟡 |
| `avatar-priest.webp` | 39.9 KB | Class select | ❌ |
| `avatar-berserker.webp` | 28 KB | Class select | ❌ |

---

## 🔥 LCP Element Analysis

```css
/* Elemento LCP identificado */
#welcomeScreen {
    background: url('assets/images/dungeon-bg.webp') center center / cover no-repeat;
    /* + gradient overlay */
}
```

### Problemas identificados:
1. **❌ Sem preload** - Imagem descoberta tarde pelo parser
2. **❌ No CSS** - Imagem referenciada via CSS, não HTML
3. **⚠️ 119KB** - Tamanho razoável para WebP, mas poderia ser menor

### Solução proposta:
```html
<!-- Adicionar no <head> -->
<link rel="preload" as="image" href="assets/images/dungeon-bg.webp" fetchpriority="high">
```

---

## 🔌 Dependências Firebase

| Módulo | Carregado por | Tamanho CDN | % Não Usado |
|--------|---------------|-------------|-------------|
| `firebase-app.js` | firebase-auth.js | ~30 KB | ~20% |
| `firebase-auth.js` | firebase-auth.js | ~80 KB | ~30% |
| `firebase-firestore.js` | firebase-auth.js | ~100 KB | **~93%** |

### Problema:
- Firestore carrega 100KB mesmo quando usuário não está logado
- Só é realmente usado quando: Cloud Save ou Leaderboard

### Solução proposta:
- Lazy load Firestore apenas quando necessário (login ou leaderboard)

---

## ⚠️ Problemas Identificados (Priorizado)

### 🔴 Crítico (Alto Impacto)

| ID | Problema | Impacto | Economia |
|----|----------|---------|----------|
| P1 | **LCP sem preload** | +500-800ms LCP | Grátis |
| P2 | **CSS render-blocking** (86KB) | +300-500ms FCP | ~70KB async |
| P3 | **Firestore carrega cedo** | +100KB inicial | ~100KB lazy |
| P4 | **game.js monolítico** | +270ms TBT | Split crítico |

### 🟡 Médio (Impacto Moderado)

| ID | Problema | Impacto | Economia |
|----|----------|---------|----------|
| M1 | `inline-scripts.js` (36KB) | 90% não usado | ~32KB |
| M2 | Google Fonts blocking | +100-200ms FCP | font-display |
| M3 | Avatares sem lazy load | Não crítico | - |

### 🟢 Baixo (Refinamentos)

| ID | Problema | Impacto |
|----|----------|---------|
| L1 | Preconnect www.gstatic.com (Firebase) | ~50ms |
| L2 | dns-prefetch adicional | ~30ms |

---

## 📋 Plano de Ação Recomendado

### Quick Wins (5-10 min cada, fazer primeiro)
1. **OPT-005**: Preload LCP image → -500ms LCP
2. **OPT-010**: Resource hints (preconnect Firebase) → -50ms
3. **OPT-006**: Font display optimization → -100ms FCP

### Médio Prazo (30-60 min cada)
4. **OPT-004**: CSS Critical Path → -300ms FCP
5. **OPT-003**: Firebase lazy loading → -100KB inicial

### Longo Prazo (2-4h)
6. **OPT-002**: Code splitting game.js → -270ms TBT
7. **OPT-007**: Cleanup inline-scripts.js → -32KB

---

## ✅ Já Configurado Corretamente

- [x] Preconnects básicos (fonts.googleapis.com, fonts.gstatic.com)
- [x] CSS crítico inline (básico)
- [x] Scripts com defer (maioria)
- [x] Netlify minification habilitado
- [x] Cache headers configurados
- [x] Imagens em WebP
- [x] Security headers

---

## 🎯 Meta Final

| Métrica | Atual | Meta | Estratégia |
|---------|-------|------|------------|
| Performance | 51% | 80%+ | Quick wins + CSS async |
| FCP | 3.1s | <1.5s | Preload + CSS critical |
| LCP | 4.1s | <2.5s | Preload image |
| TBT | 270ms | <150ms | Code split (futuro) |

---

**Próximo passo:** Implementar OPT-005 (Preload LCP Image) - Quick Win

