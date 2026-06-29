/* ============================================
   ADVENTURE RUN ORCHESTRATOR
   Drives an Adventure-mode run through the procedural map: each node launches an
   encounter using the EXISTING engine (combat reuses drawRoom; bosses spawn a
   boss card; rest/treasure/event/shop reuse existing systems), and control
   returns to the map when the encounter resolves. Classic mode is untouched.

   Loaded as a classic script after game.js + adventure-map.js; uses window.* .
   ============================================ */
(function () {
    const AR = {
        _pending: null,

        start() {
            if (!window.AdventureMap) return;
            game.adventureRun = true;
            game.finalBossDefeated = false;
            // Hide the linear room controls — the map drives progression.
            ['btnDrawRoom', 'btnAvoidRoom'].forEach(id => {
                const b = document.getElementById(id);
                if (b) b.style.display = 'none';
            });
            window.AdventureMap.start(game.playerClass);
            window.AdventureMap.onNodeSelected = (node) => AR.enter(node);
            AR.showMap();
        },

        showMap() {
            if (window.AdventureMap) window.AdventureMap.openScreen();
        },

        enter(node) {
            if (window.AdventureMap) window.AdventureMap.closeScreen();
            switch (node.type) {
                case 'combat':
                case 'elite': return AR._combat(node);
                case 'boss':
                case 'finalboss': return AR._boss(node);
                case 'rest': return AR._rest(node);
                case 'treasure': return AR._treasure(node);
                case 'shop': return AR._shop(node);
                case 'event': return AR._event(node);
                default: return AR._toMapSoon();
            }
        },

        _combat(node) {
            AR._pending = node;
            // Reuse the full linear room flow for the fight; drawRoom refills the
            // deck itself in adventure mode. Clear -> checkGameState -> afterEncounterCleared.
            if (typeof window.drawRoom === 'function') window.drawRoom();
        },

        _boss(node) {
            AR._pending = node;
            const baseHp = { easy: 18, normal: 26, hard: 34, endless: 26 }[game.difficulty] || 26;
            const hp = node.type === 'finalboss' ? baseHp + 12 : baseHp + node.act * 4;
            const boss = {
                suit: '👹', value: '👹', numValue: hp, maxHP: hp,
                isBoss: true,
                bossNumber: node.type === 'finalboss' ? 99 : (node.act + 1),
                bossName: node.boss ? node.boss.name : 'Dungeon Guardian',
                bossFlavor: node.boss ? node.boss.flavor : 'A warden of the deep.',
                suitName: 'spades',
            };
            game.room = [boss];
            game.lastActionWasAvoid = false;
            if (window.music && window.music.playBossStinger) window.music.playBossStinger();
            if (window.updateUI) window.updateUI();
            if (window.showMessage) window.showMessage(`👹 ${boss.bossName} — ${boss.bossFlavor}`, 'danger');
        },

        _rest(node) {
            const heal = Math.ceil(game.maxHealth * 0.3);
            game.health = Math.min(game.maxHealth, game.health + heal);
            if (window.updateUI) window.updateUI();
            if (window.showMessage) window.showMessage(`🔥 You rest by the fire — recovered ${heal} HP.`, 'success');
            AR._toMapSoon();
        },

        _treasure(node) {
            const gold = 20 + node.tier * 4;
            if (window.earnGold) window.earnGold(gold); else game.gold += gold;
            if (window.updateUI) window.updateUI();
            if (window.showMessage) window.showMessage(`🎁 Treasure! You pocket ${gold} gold.`, 'success');
            AR._toMapSoon();
        },

        _shop(node) {
            if (typeof window.openShop === 'function') {
                window.openShop();
                AR._observeClose('shopModal');
            } else {
                AR._toMapSoon();
            }
        },

        _event(node) {
            // Lightweight boon for now — full event-system integration is a follow-up.
            if (Math.random() < 0.5) {
                const g = 15 + node.tier * 3;
                if (window.earnGold) window.earnGold(g); else game.gold += g;
                if (window.showMessage) window.showMessage(`❓ A hooded stranger presses ${g} gold into your hand.`, 'info');
            } else {
                const h = Math.ceil(game.maxHealth * 0.15);
                game.health = Math.min(game.maxHealth, game.health + h);
                if (window.showMessage) window.showMessage(`❓ A forgotten shrine restores ${h} HP.`, 'info');
            }
            if (window.updateUI) window.updateUI();
            AR._toMapSoon();
        },

        _observeClose(id) {
            const el = document.getElementById(id);
            if (!el) { AR._toMapSoon(); return; }
            const obs = new MutationObserver(() => {
                if (!el.classList.contains('active')) { obs.disconnect(); AR.showMap(); }
            });
            obs.observe(el, { attributes: true, attributeFilter: ['class'] });
        },

        _toMapSoon() { setTimeout(() => AR.showMap(), 300); },

        // Called from checkGameState when an adventure combat/boss room empties.
        afterEncounterCleared() {
            game.stats.roomsCleared++;
            if (game.classAbilityCooldown > 0) game.classAbilityCooldown--;
            if (window.updateUI) window.updateUI();
            const node = AR._pending;
            AR._pending = null;
            if (node && node.type === 'finalboss') {
                game.finalBossDefeated = true;
                AR._ending();
                return;
            }
            AR._toMapSoon();
        },

        _ending() {
            const adv = (window.AdventureMap && window.AdventureMap.map) ? window.AdventureMap.map.adventure : null;
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.style.zIndex = '10001';
            overlay.innerHTML = `
                <div class="modal-content" style="max-width:560px;text-align:center;border:3px solid #c9a961;">
                    <div style="font-size:3em;">🏆</div>
                    <h2 style="color:#e8c878;font-family:'Cinzel',serif;">${adv ? adv.finalBoss.name : 'The Final Boss'} falls</h2>
                    <p style="color:#ddd;line-height:1.7;font-style:italic;padding:0 10px;">${adv ? adv.ending : 'Victory.'}</p>
                    <button class="btn btn-primary" id="advEndBtn" style="margin-top:14px;">Claim Victory</button>
                </div>`;
            document.body.appendChild(overlay);
            const btn = overlay.querySelector('#advEndBtn');
            btn.onclick = () => {
                overlay.remove();
                if (window.endGame) window.endGame('victory');
            };
        },
    };

    window.AdventureRun = AR;
})();
