# 🎯 LIGHTHOUSE PERFORMANCE BACKLOG

> **Data:** 2025-11-27  
> **Score Atual:** 42% (mobile)  
> **Meta:** 80%+

---

## 📊 MÉTRICAS ATUAIS

| Métrica | Valor | Status | Meta |
|---------|-------|--------|------|
| **FCP** | 1.8s | 🟢 | <1.8s |
| **LCP** | 4.1s | 🔴 | <2.5s |
| **Speed Index** | 2.1s | 🟢 | <3.4s |
| **TTI** | ? | - | <3.8s |
| **TBT** | ? | - | <200ms |

---

## 🔴 PROBLEMAS CRÍTICOS (por impacto)

### OPT-001: Unused JavaScript - 219KB
**Impacto:** MUITO ALTO  
**Economia:** 219KB  
**Arquivos afetados:**
- `game.js` - código não usado no carregamento inicial
- Firebase Firestore (100KB) - carrega mesmo sem uso

**Solução:** Code splitting / lazy loading

---

### OPT-002: Render-blocking Resources - 793ms
**Impacto:** ALTO  
**Economia:** 793ms potencial  
**Causa:** Google Fonts carrega antes do conteúdo

**Solução:** 
- Usar `font-display: swap` (já tem)
- Considerar self-hosting das fontes
- Preload da fonte principal

---

### OPT-003: Unminified JavaScript - 37KB
**Impacto:** MÉDIO  
**Economia:** 37KB  
**Arquivos afetados:** Verificar se Netlify minifica

**Solução:** Verificar config do Netlify

---

### OPT-004: Legacy JavaScript - 14KB
**Impacto:** MÉDIO  
**Economia:** 14KB  
**Causa:** Código ES5 desnecessário para browsers modernos

**Solução:** Remover polyfills desnecessários

---

### OPT-005: Unused CSS - 10KB
**Impacto:** BAIXO  
**Economia:** 10KB  
**Causa:** CSS não usado no welcome screen

**Solução:** PurgeCSS ou CSS crítico inline

---

### OPT-006: Duplicated JavaScript - 3.8KB
**Impacto:** BAIXO  
**Economia:** 3.8KB  
**Causa:** Código duplicado entre módulos

**Solução:** Refatorar imports

---

## ⚠️ OUTROS PROBLEMAS

### Service Worker não registra
- Verificar se SW está funcionando
- Pode afetar PWA score

### Erros no Console
- Investigar quais erros estão aparecendo
- Podem afetar Best Practices

### Splash Screen falhou
- Verificar manifest e configurações PWA

---

## 📋 ORDEM DE EXECUÇÃO RECOMENDADA

1. **OPT-003** - Verificar minificação (rápido, sem risco)
2. **OPT-002** - Otimizar Google Fonts (médio, baixo risco)
3. **OPT-001** - Code splitting game.js (complexo, alto impacto)
4. **OPT-005** - CSS não usado (médio, baixo risco)
5. **OPT-004** - Legacy JS (médio, precisa análise)
6. **OPT-006** - JS duplicado (baixo, precisa análise)

---

## ✅ O QUE FUNCIONOU

- **Preload LCP image**: FCP melhorou de 3.1s para 1.8s
- **Preconnects**: Funcionando corretamente

## ❌ O QUE NÃO FUNCIONOU

- **CSS async com preload/onload**: Lighthouse não reconheceu
- **Modulepreload Firebase**: Pode ter competido com recursos críticos

---

## 📝 NOTAS

- Teste feito em **Mobile (Moto G4)** - simulação mais restritiva
- Deploy preview pode ter comportamento diferente de produção
- Netlify já aplica minificação e compressão por padrão
