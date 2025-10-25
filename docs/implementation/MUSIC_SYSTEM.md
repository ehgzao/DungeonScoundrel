# 🎵 Sistema de Música Atmosférica - Dungeon Scoundrel

## 🎯 Objetivo

Substituir o sistema 8-bit chiptune por música atmosférica dark medieval inspirada em:
- **Heretic** - Dark, sombria, sintetizadores atmosféricos
- **Zelda** - Misteriosa, aventura, medieval

---

## 🎼 5 Tracks Contextuais

### 1. 🏰 Menu Theme - "Dark Awakening"
**Contexto:** Welcome screen  
**Atmosfera:** Misteriosa, sombria, convidativa  
**Elementos:**
- Drone grave contínuo (80-100 Hz)
- Pads atmosféricos escuros
- Bells/chimes medievais espaçados
- Reverb profundo

**Inspiração:** Intro de Heretic + atmosphere de Zelda dungeon

---

### 2. ⚔️ Gameplay Theme - "Into the Depths"
**Contexto:** Durante partida  
**Atmosfera:** Tensa, aventureira, dark  
**Elementos:**
- Bass pulsante (ritmo lento)
- Melodia menor misteriosa
- Percussão sutil (batidas graves)
- Ambiente de caverna

**Inspiração:** Dungeon themes de Zelda + tensão de Heretic

---

### 3. 🛍️ Shop Theme - "Merchant's Shadow"
**Contexto:** Modal de loja  
**Atmosfera:** Mais calma mas ainda dark  
**Elementos:**
- Arpejos medievais lentos
- Drone mais suave
- Bells mais presentes
- Tom misterioso mas "seguro"

**Inspiração:** Safe zones de Zelda mas com twist dark

---

### 4. 👑 Victory Theme - "Triumph in Darkness"
**Contexto:** Game over (vitória)  
**Atmosfera:** Épica, celebratória, mas medieval  
**Elementos:**
- Fanfarra grave (não aguda)
- Crescendo orquestral simulado
- Percussão triunfante
- Resolve em acorde maior

**Inspiração:** Victory themes épicos mas com peso

---

### 5. 💀 Defeat Theme - "The Final Darkness"
**Contexto:** Game over (derrota)  
**Atmosfera:** Sombria, final, respeitosa  
**Elementos:**
- Drone descendente
- Bells fúnebres
- Fade out lento
- Silêncio dramático

**Inspiração:** Death themes atmosféricos

---

## 🔧 Implementação Técnica

### Sistema de Troca Automática

```javascript
class DarkAtmosphericMusic {
    constructor() {
        this.currentContext = 'menu'; // menu, gameplay, shop, victory, defeat
        this.tracks = {
            menu: this.createMenuTrack,
            gameplay: this.createGameplayTrack,
            shop: this.createShopTrack,
            victory: this.createVictoryTrack,
            defeat: this.createDefeatTrack
        };
    }
    
    // Troca automática baseada no estado do jogo
    switchContext(newContext) {
        if (this.currentContext === newContext) return;
        this.fadeOut(() => {
            this.currentContext = newContext;
            this.fadeIn();
        });
    }
}
```

### Triggers Automáticos

```javascript
// No código do jogo:

// Ao iniciar partida
music.switchContext('gameplay');

// Ao abrir shop
music.switchContext('shop');

// Ao vencer
music.switchContext('victory');

// Ao morrer
music.switchContext('defeat');

// Voltar ao menu
music.switchContext('menu');
```

---

## 🎨 Características Sonoras

### Frequências Usadas
```
Graves (Drones):    40-120 Hz
Bass:              80-200 Hz
Melodia:          200-800 Hz
Bells/Chimes:     800-2000 Hz
Atmosfera:        200-400 Hz (filtrado)
```

### Escalas Modais
```
Menor Natural:    A, B, C, D, E, F, G
Frígio:          E, F, G, A, B, C, D (mais dark)
Dórico:          D, E, F, G, A, B, C (aventura)
Lócrio:          B, C, D, E, F, G, A (tensão máxima)
```

### Timbres
- **Square Wave:** Bells digitais, melodias
- **Sine Wave:** Drones puros, bass profundo
- **Sawtooth:** Pads atmosféricos, strings
- **Triangle:** Melodias suaves, harmonias
- **Noise (filtrado):** Percussão, atmosphere

---

## 🎼 Estrutura de Cada Track

### 1. Menu Theme (Loop 32 compassos)
```
Compasso 1-8:   Intro (drone + bells espalhados)
Compasso 9-16:  Melodia A (misteriosa, ascendente)
Compasso 17-24: Melodia B (variação)
Compasso 25-32: Outro (retorna ao drone)
Loop perfeito
```

### 2. Gameplay Theme (Loop 64 compassos)
```
Compasso 1-16:  Tensão crescente
Compasso 17-32: Peak de intensidade
Compasso 33-48: Variação rítmica
Compasso 49-64: Retorno, preparação para loop
```

### 3. Shop Theme (Loop 24 compassos)
```
Compasso 1-12:  Arpejos + drone
Compasso 13-24: Variação melódica
Loop contínuo, calmo
```

### 4. Victory Theme (One-shot, 16 compassos)
```
Compasso 1-4:   Fanfarra inicial
Compasso 5-8:   Crescendo
Compasso 9-12:  Climax
Compasso 13-16: Resolução
Fade out natural
```

### 5. Defeat Theme (One-shot, 12 compassos)
```
Compasso 1-4:   Descida cromática
Compasso 5-8:   Bells fúnebres
Compasso 9-12:  Fade para silêncio
```

---

## 🔊 Mixagem e Volumes

```javascript
Master Volume:     0.15  (mais baixo que 8-bit)
Drone:            0.20  (presente mas não dominante)
Bass:             0.25  (fundação sólida)
Melodia:          0.15  (clara mas não intrusiva)
Bells:            0.10  (detalhes sutis)
Percussão:        0.12  (ritmo discreto)
Atmosphere:       0.08  (textura de fundo)
```

---

## 📊 Comparação: Antes vs Depois

| Aspecto | 8-Bit Chiptune | Dark Atmospheric |
|---------|----------------|------------------|
| **Tom** | Alegre, energético | Sombrio, misterioso |
| **BPM** | 160 (rápido) | 80-100 (lento) |
| **Freq** | Médias/Agudas | Graves/Médias |
| **Reverb** | Pouco | Muito (caverna) |
| **Mood** | Arcade casual | Dark fantasy |
| **Coerência** | ❌ Conflito | ✅ Perfeita |

---

## 🎯 Resultado Esperado

### Experiência do Jogador

```
Abre jogo → Música sombria e misteriosa toca
    ↓
"Isso sim combina com as tochas e masmorra!"
    ↓
Inicia partida → Música muda para gameplay
    ↓
"Perfeito, atmosfera tensa mas não distrai"
    ↓
Entra na shop → Música mais calma
    ↓
"Boa, momento de respiro"
    ↓
Vence/Perde → Música apropriada
    ↓
"Coerência total, experiência imersiva"
```

---

## 🚀 Próximos Passos

### Fase 1: Implementar Web Audio (AGORA)
- Substituir Epic8BitMusic
- Criar 5 tracks atmosféricas
- Sistema de fade in/out
- Troca automática por contexto

### Fase 2: Adicionar Arquivos Reais (FUTURO)
- Compor/licenciar músicas reais
- Formatos: MP3 + OGG (compatibilidade)
- Carregar via HTML5 Audio
- Fallback para Web Audio se necessário

### Fase 3: Polish (OPCIONAL)
- Crossfade entre tracks
- Variações dinâmicas baseadas em HP
- Layers adicionais em boss fights
- Sistema de intensidade adaptativa

---

## 📁 Estrutura de Arquivos (Futuro)

```
DungeonScoundrel/
├── audio/
│   ├── menu.mp3 (loop)
│   ├── menu.ogg (fallback)
│   ├── gameplay.mp3 (loop)
│   ├── gameplay.ogg
│   ├── shop.mp3 (loop)
│   ├── shop.ogg
│   ├── victory.mp3 (one-shot)
│   ├── victory.ogg
│   ├── defeat.mp3 (one-shot)
│   └── defeat.ogg
```

---

## 🎵 Referências de Estilo

### Heretic (1994)
- Drones graves constantes
- Sintetizadores dark anos 90
- Atmosfera industrial/medieval
- Tensão constante

### Zelda: Ocarina of Time
- Melodias misteriosas
- Escalas modais (menor, frígio)
- Bells e instrumentos medievais
- Senso de exploração e perigo

### Diablo 1
- Tristram theme (guitarra dark)
- Atmosfera gótica pesada
- Ambiente de catacumbas

### Skyrim
- Drones corais
- Percussão épica mas espaçada
- Atmosfera de dungeon crawling

---

## ✅ Checklist de Qualidade

Música dark atmosférica deve ter:
- [ ] BPM lento (80-100)
- [ ] Frequências graves dominantes
- [ ] Reverb profundo (catedral/caverna)
- [ ] Melodias em menor ou modal
- [ ] Tensão constante mas sutil
- [ ] Loop perfeito (sem click)
- [ ] Fade in/out suave
- [ ] Volume balanceado com SFX

---

**🎯 Objetivo final: Coerência total entre visual dark medieval e áudio atmosférico!**
