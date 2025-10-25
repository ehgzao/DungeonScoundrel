# 🧪 Como Testar o Sistema de Música

## ✅ Problema Corrigido

Todas as referências `epic8BitMusic` foram substituídas por `music`.

---

## 🎵 TESTE RÁPIDO (1 minuto)

### 1. Recarregar Página
- **F5** ou **Ctrl+R**
- Limpa cache antigo

### 2. Abrir Console
- **F12** (Chrome/Edge/Firefox)
- Aba "Console"

### 3. Verificar Logs
Você deve ver:
```
🎵 Music: menu → menu
```

### 4. Ouvir a Música
- **Som:** Drone grave (80-120 Hz) + bells espaçados
- **Volume:** Baixo e atmosférico
- **Mood:** Dark e misterioso

---

## 🔊 Verificação de Áudio

### Se não ouvir nada:

**1. Volume do navegador:**
- Clicar com botão direito na aba
- Verificar se não está mudo

**2. Botão de música:**
- Clicar no botão ⏯️ na tela
- Deve tocar imediatamente

**3. Console (F12):**
Digitar:
```javascript
music.start();
```
Se não funcionar, ver mensagem de erro

---

## 🎮 TESTE COMPLETO (5 minutos)

### Cenário 1: Menu
1. Abrir jogo
2. **Ouvir:** Dark Awakening
   - Drone grave contínuo
   - Bells a cada 4 segundos
3. **Console:** `🎵 Music: menu → menu`

### Cenário 2: Gameplay
1. Clicar "Start Game"
2. **Ouvir:** Into the Depths
   - Bass pulsante (2x por segundo)
   - Melodia misteriosa
3. **Console:** `🎵 Music: menu → gameplay`

### Cenário 3: Shop (se houver)
1. Abrir loja
2. **Ouvir:** Merchant's Shadow
   - Arpejos lentos
   - Bells mais presentes
3. **Console:** `🎵 Music: gameplay → shop`

### Cenário 4: Vitória/Derrota
1. Terminar jogo
2. **Vitória:** Fanfarra épica grave
3. **Derrota:** Descida cromática sombria
4. **Console:** `🎵 Music: gameplay → victory/defeat`

---

## 🐛 TROUBLESHOOTING

### Problema: Nada toca

**Solução 1:** Verificar se música está habilitada
```javascript
// Console (F12)
game.settings.musicEnabled
// Deve ser: true
```

Se for `false`:
```javascript
game.settings.musicEnabled = true;
music.start();
```

---

### Problema: Erro no console

**Erro comum:**
```
Uncaught ReferenceError: music is not defined
```

**Solução:**
Verificar linha ~1748 no código:
```javascript
const music = new DarkAtmosphericMusic();
```

Se não existir, adicionar após o fim da classe.

---

### Problema: Música antiga ainda toca

**Causa:** Cache do navegador

**Solução:**
1. **Ctrl + Shift + R** (hard reload)
2. Ou abrir janela anônima
3. Ou limpar cache:
   - Chrome: Ctrl+Shift+Del
   - Selecionar "Imagens e arquivos em cache"
   - Limpar

---

### Problema: Som muito baixo

**Solução:**
Ajustar volume no código (linha ~12):
```javascript
this.masterGain.gain.value = 0.15; // Aumentar para 0.25
```

---

## 🎯 CARACTERÍSTICAS ESPERADAS

### Menu Music (Dark Awakening)
- **Frequência:** 80 Hz e 120 Hz (graves)
- **Bells:** A cada 4 segundos
- **Mood:** Misterioso, convidativo
- **Volume:** Baixo (0.15)

### Gameplay Music (Into the Depths)
- **Bass:** 90 Hz pulsante (500ms interval)
- **Melodia:** Escala frígia (E, F, G, A, B, C, D)
- **Percussão:** Sutil, dark
- **Mood:** Tenso, aventureiro

### Shop Music (Merchant's Shadow)
- **Drone:** 100 Hz suave
- **Arpejos:** C4, D4, E4, G4
- **Bells:** C5, D5, E5 (2.4s interval)
- **Mood:** Calmo mas misterioso

### Victory Music (Triumph in Darkness)
- **Fanfarra:** C4 → E4 → G4 → C5
- **Duração:** One-shot (~2.5s)
- **Mood:** Épico, celebratório

### Defeat Music (The Final Darkness)
- **Descida:** D4 → C#4 → C4 → B3 → A3
- **Bells:** Fúnebres (C5, G4)
- **Fade:** 2s para silêncio
- **Mood:** Sombrio, respeitoso

---

## ✅ CHECKLIST DE TESTE

- [ ] Página recarregada (F5)
- [ ] Console aberto (F12)
- [ ] Logs de música aparecendo
- [ ] Dark Awakening tocando no menu
- [ ] Transição para gameplay funciona
- [ ] Botão play/pause funciona
- [ ] Volume adequado
- [ ] Sem erros no console

---

## 🎵 COMANDOS DE DEBUG

### No Console (F12):

**Verificar status:**
```javascript
music.isPlaying // true ou false
music.currentContext // "menu", "gameplay", etc.
music.getCurrentTrackName() // Nome da música atual
```

**Forçar troca manual:**
```javascript
music.switchContext('gameplay') // Into the Depths
music.switchContext('shop') // Merchant's Shadow
music.switchContext('victory') // Triumph in Darkness
music.switchContext('defeat') // The Final Darkness
music.switchContext('menu') // Dark Awakening
```

**Ver osciladores ativos:**
```javascript
music.oscillators.length // Número de sons tocando
music.intervals.length // Número de timers ativos
```

**Parar tudo:**
```javascript
music.stop()
```

**Reiniciar:**
```javascript
music.start()
```

---

## 📊 RESULTADO ESPERADO

Ao abrir o jogo, você deve:
1. ✅ Ouvir drone grave imediatamente
2. ✅ Ver log no console
3. ✅ Bells tocam a cada 4s
4. ✅ Transições suaves ao mudar tela

**Se tudo isso acontecer: ✅ SISTEMA FUNCIONANDO!**

---

## 🆘 AINDA NÃO FUNCIONA?

**Compartilhe:**
1. Mensagens do Console (F12)
2. Linha onde dá erro (se houver)
3. O que você ouve (ou não ouve)

**Ou tente:**
1. Abrir arquivo `index.html` direto (sem servidor)
2. Verificar se autoplay está bloqueado no navegador
3. Clicar em qualquer lugar da página (alguns navegadores exigem interação)

---

**Última atualização:** 2025-10-25 01:55
