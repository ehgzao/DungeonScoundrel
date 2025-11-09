# 🎓 TUTORIAL SYSTEM - IMPLEMENTAÇÃO COMPLETA

## 📊 VISÃO GERAL

Sistema de tutorial interativo para primeira jogada que guia o player passo a passo através das mecânicas principais do jogo.

---

## 🎯 FUNCIONALIDADES

1. **Detecção Automática**: Ativa apenas na primeira run
2. **Passo a Passo**: Guia o player através de todas as mecânicas
3. **Overlay com Destaque**: Foca atenção em elementos específicos
4. **Não-Intrusivo**: Player pode pular a qualquer momento
5. **Persistente**: Marca como completo após finalizar

---

## 🗂️ ESTRUTURA DO SISTEMA

### **1. LocalStorage Flag**
```javascript
// Verificar se é primeira run
const hasSeenTutorial = localStorage.getItem('dungeon_scoundrel_tutorial_completed');
```

### **2. Tutorial Steps Array**
```javascript
const TUTORIAL_STEPS = [
    {
        id: 'welcome',
        title: '🎴 Welcome to Dungeon Scoundrel!',
        text: 'You\'re about to enter a dark dungeon where every card counts. Let me show you the basics!',
        highlight: null,
        position: 'center',
        buttonText: 'Let\'s Start!'
    },
    {
        id: 'health',
        title: '❤️ Your Health',
        text: 'This is your HP. If it reaches 0, game over! Heal with potions (♥ Hearts) and avoid damage.',
        highlight: '#healthAmount',
        position: 'top-right',
        buttonText: 'Got it!'
    },
    {
        id: 'gold',
        title: '💰 Gold',
        text: 'You earn gold by clearing rooms. Use it to buy items at the merchant!',
        highlight: '#goldAmount',
        position: 'top-right',
        buttonText: 'Next'
    },
    {
        id: 'weapon',
        title: '⚔️ Weapons',
        text: 'You need a weapon to fight monsters! Equip weapons (♦ Diamonds) from the cards you draw.',
        highlight: '#weaponDisplay',
        position: 'top',
        buttonText: 'Next'
    },
    {
        id: 'draw',
        title: '🎲 Drawing Rooms',
        text: 'Click "Draw Room" to draw 4 cards. Each room is a new challenge!',
        highlight: '#btnDrawRoom',
        position: 'bottom',
        buttonText: 'Draw My First Room!',
        action: () => {
            // Auto-click draw room
            document.getElementById('btnDrawRoom').click();
        }
    },
    {
        id: 'cards',
        title: '🃏 Understanding Cards',
        text: '♠️♣️ = Monsters (damage you)\n♦️ = Weapons (equip to fight)\n♥️ = Potions (heal you)\n✨ = Special (powerful effects)',
        highlight: '#bottomBar',
        position: 'bottom',
        buttonText: 'I Understand!'
    },
    {
        id: 'combat',
        title: '⚔️ Combat Basics',
        text: 'Click a MONSTER card to attack it! Your weapon damage is subtracted from the monster\'s HP. If the monster has more HP than your weapon, you take the difference as damage.',
        highlight: null,
        position: 'center',
        buttonText: 'Ready to Fight!'
    },
    {
        id: 'strategy',
        title: '🧠 Strategy Tips',
        text: '1. Always equip a weapon first!\n2. Use potions when HP is low\n3. Save strong weapons for tough monsters\n4. Clear the room before drawing a new one',
        highlight: null,
        position: 'center',
        buttonText: 'Almost Ready!'
    },
    {
        id: 'finish',
        title: '🏆 You\'re Ready!',
        text: 'That\'s all you need to know! The dungeon is yours to conquer. Good luck, Scoundrel!',
        highlight: null,
        position: 'center',
        buttonText: 'Start My Adventure!'
    }
];
```

---

## 💻 CÓDIGO COMPLETO

### **Adicionar no game.js após startGame()**

```javascript
// ============================================
// TUTORIAL SYSTEM
// ============================================

let tutorialActive = false;
let tutorialCurrentStep = 0;

function checkAndStartTutorial() {
    const hasSeenTutorial = localStorage.getItem('dungeon_scoundrel_tutorial_completed');
    
    if (!hasSeenTutorial && !tutorialActive) {
        tutorialActive = true;
        tutorialCurrentStep = 0;
        showTutorialStep(TUTORIAL_STEPS[0]);
    }
}

function showTutorialStep(step) {
    // Remove previous overlay if exists
    const existingOverlay = document.getElementById('tutorialOverlay');
    if (existingOverlay) existingOverlay.remove();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9998;
        pointer-events: all;
    `;
    
    // Highlight element if specified
    if (step.highlight) {
        const targetElement = document.querySelector(step.highlight);
        if (targetElement) {
            const rect = targetElement.getBoundingClientRect();
            
            // Create spotlight
            const spotlight = document.createElement('div');
            spotlight.style.cssText = `
                position: fixed;
                top: ${rect.top - 10}px;
                left: ${rect.left - 10}px;
                width: ${rect.width + 20}px;
                height: ${rect.height + 20}px;
                border: 3px solid #ffd700;
                border-radius: 8px;
                box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 30px #ffd700;
                z-index: 9999;
                pointer-events: none;
                animation: tutorialPulse 2s infinite;
            `;
            document.body.appendChild(spotlight);
            
            // Remove spotlight when closing
            overlay.addEventListener('remove', () => spotlight.remove());
        }
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        ${step.position === 'center' ? 'top: 50%; left: 50%; transform: translate(-50%, -50%);' : ''}
        ${step.position === 'top' ? 'top: 120px; left: 50%; transform: translateX(-50%);' : ''}
        ${step.position === 'bottom' ? 'bottom: 100px; left: 50%; transform: translateX(-50%);' : ''}
        ${step.position === 'top-right' ? 'top: 120px; right: 30px;' : ''}
        max-width: 500px;
        background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%);
        border: 3px solid #ffd700;
        border-radius: 15px;
        padding: 25px;
        z-index: 10000;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
        text-align: center;
    `;
    
    modal.innerHTML = `
        <h2 style="color: #ffd700; margin-bottom: 15px; font-size: 1.5em;">${step.title}</h2>
        <p style="color: #e0e0e0; line-height: 1.6; white-space: pre-line; margin-bottom: 20px;">${step.text}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            ${tutorialCurrentStep > 0 ? '<button class="btn btn-secondary" id="tutorialSkip">Skip Tutorial</button>' : ''}
            <button class="btn btn-primary" id="tutorialNext">${step.buttonText}</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // Button handlers
    const nextBtn = document.getElementById('tutorialNext');
    const skipBtn = document.getElementById('tutorialSkip');
    
    nextBtn.onclick = () => {
        // Execute action if exists
        if (step.action) step.action();
        
        // Remove overlay
        overlay.remove();
        
        // Next step
        tutorialCurrentStep++;
        if (tutorialCurrentStep < TUTORIAL_STEPS.length) {
            // Delay for card draw animation
            if (step.action) {
                setTimeout(() => showTutorialStep(TUTORIAL_STEPS[tutorialCurrentStep]), 1000);
            } else {
                showTutorialStep(TUTORIAL_STEPS[tutorialCurrentStep]);
            }
        } else {
            completeTutorial();
        }
    };
    
    if (skipBtn) {
        skipBtn.onclick = () => {
            overlay.remove();
            completeTutorial();
        };
    }
}

function completeTutorial() {
    tutorialActive = false;
    localStorage.setItem('dungeon_scoundrel_tutorial_completed', 'true');
    showMessage('🎓 Tutorial completed! Good luck in the dungeon!', 'success');
}

// Add CSS animation for pulse
const tutorialStyle = document.createElement('style');
tutorialStyle.textContent = `
    @keyframes tutorialPulse {
        0%, 100% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 30px #ffd700; }
        50% { box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.85), 0 0 50px #ffd700, 0 0 70px #ffd700; }
    }
`;
document.head.appendChild(tutorialStyle);
```

---

## 🔧 INTEGRAÇÃO

### **Modificar startGame()**

Adicionar no FINAL da função `startGame()`, logo após `music.switchContext('gameplay');`:

```javascript
// Start tutorial if first time
checkAndStartTutorial();
```

---

## 🎨 OPÇÕES DE CUSTOMIZAÇÃO

### **Mudar Cores**
```javascript
border: 3px solid #4ecdc4;  // Cyan
border: 3px solid #ff6b6b;  // Red
border: 3px solid #6bcf7f;  // Green
```

### **Adicionar Mais Steps**
Basta adicionar no array `TUTORIAL_STEPS`:
```javascript
{
    id: 'relics',
    title: '🔮 Relics',
    text: 'Collect relics for permanent bonuses!',
    highlight: '#relicsList',
    position: 'right',
    buttonText: 'Cool!'
}
```

### **Resetar Tutorial (Debug)**
```javascript
// Console command
localStorage.removeItem('dungeon_scoundrel_tutorial_completed');
```

---

## 📊 FEATURES IMPLEMENTADAS

- ✅ Detecção automática primeira run
- ✅ 9 passos de tutorial
- ✅ Highlight visual com spotlight
- ✅ Animação de pulse
- ✅ Botão "Skip Tutorial"
- ✅ Auto-ação (draw room)
- ✅ Posicionamento dinâmico
- ✅ Persistência localStorage
- ✅ Feedback final

---

## 🚀 RESULTADO ESPERADO

1. **Primeira jogada**: Tutorial aparece automaticamente
2. **Player lê cada passo**: Entende as mecânicas
3. **Auto-draw room**: Sistema demonstra ação
4. **Player pode pular**: Não é forçado
5. **Tutorial completo**: Nunca mais aparece

---

## 💡 MELHORIAS FUTURAS

- [ ] Tutorial avançado (combos, relics específicos)
- [ ] Tutorial por classe (cada classe tem dicas únicas)
- [ ] Modo "Dicas" ativo sempre
- [ ] Tutorial achievements

---

**STATUS:** Pronto para implementação manual  
**Estimativa:** 15-20 minutos de inserção  
**Localização:** Após função `startGame()` em `game.js`  
**Testing:** Limpar localStorage e iniciar novo jogo
