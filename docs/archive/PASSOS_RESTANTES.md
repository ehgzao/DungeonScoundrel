# 🎵 Passos Restantes - Música Dark

## ✅ JÁ FEITO POR VOCÊ

- [x] Classe `DarkAtmosphericMusic` colada (linha ~1316-1748)

---

## 📝 FALTA FAZER (3 PASSOS SIMPLES)

### PASSO 1: Trocar Nome da Classe (1 linha)

**Buscar:** `const epic8BitMusic = new Epic8BitMusic();`  
**Trocar para:** `const music = new DarkAtmosphericMusic();`

**Linha aproximada:** ~1749 (logo após classe)

---

### PASSO 2: Trocar Todas Referências (Buscar/Substituir)

**No VS Code/Editor:**
1. Ctrl+H (buscar e substituir)
2. Buscar: `epic8BitMusic`
3. Substituir por: `music`
4. "Substituir Tudo"

**Ocorrências aproximadas:** ~15 linhas

**Locais:**
- Linha ~1756: `epic8BitMusic.start()`
- Linha ~1758: `epic8BitMusic.stop()`
- Linha ~1761-1762: `epic8BitMusic.prevTrack()` e `nextTrack()`
- Linha ~1772: `epic8BitMusic.isPlaying`
- Linha ~1776: `epic8BitMusic.start()`
- Linha ~1778: `epic8BitMusic.stop()`
- Linha ~1787, 1788: `epic8BitMusic.prevTrack()`, `nextTrack()`
- Linha ~1797, 1798, 1808: Mais referências

---

### PASSO 3: Adicionar Triggers Automáticos (4 funções)

#### A. Função `startNewGame()` (buscar esta função)

**Adicionar NO FINAL:**
```javascript
function startNewGame() {
    // ... todo código existente ...
    
    // ADICIONAR esta linha:
    music.switchContext('gameplay');
}
```

---

#### B. Função `endGame(isVictory)` (buscar esta função)

**Adicionar NO INÍCIO, antes do overlay:**
```javascript
function endGame(isVictory) {
    // ADICIONAR estas linhas NO INÍCIO:
    if (isVictory) {
        music.switchContext('victory');
    } else {
        music.switchContext('defeat');
    }
    
    // ... resto do código original ...
}
```

---

#### C. Função `showWelcomeScreen()` (buscar esta função)

**Adicionar NO FINAL:**
```javascript
function showWelcomeScreen() {
    // ... todo código existente ...
    
    // ADICIONAR esta linha:
    music.switchContext('menu');
}
```

---

#### D. Shop (OPCIONAL - se existir)

**Se houver funções de abrir/fechar shop:**
```javascript
// Ao abrir
music.switchContext('shop');

// Ao fechar  
music.switchContext('gameplay');
```

---

## ✅ PRONTO!

Depois disso está tudo funcionando!

---

## 🧪 TESTAR

1. Recarregar página
2. Ouvir "Dark Awakening" (drone + bells)
3. Iniciar jogo → Música muda para "Into the Depths"
4. Vencer/Morrer → Músicas apropriadas tocam
5. Console (F12) → Ver "🎵 Music: menu → gameplay"

---

## 🆘 SE DER ERRO

**Rollback:**
```bash
copy backups\index-pre-music-and-optimization-*.html index.html
```

**Console (F12):**
- Ver mensagens de erro
- Verificar se `music` está definido: `console.log(music)`

---

**Tempo:** ~3 minutos  
**Dificuldade:** Fácil (buscar/substituir)
