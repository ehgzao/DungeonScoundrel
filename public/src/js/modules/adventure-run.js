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

        // Number of hands (rooms) a combat encounter lasts, by difficulty.
        _handsFor() {
            return { easy: 1, normal: 2, hard: 3, endless: 2 }[game.difficulty] || 1;
        },

        _combat(node) {
            AR._pending = node;
            AR._handsTotal = AR._handsFor();
            AR._handsDone = 0;
            AR._drawHand();
        },

        // Draw one hand of a multi-hand encounter (reuses the linear room flow;
        // drawRoom refills the deck itself in adventure mode).
        _drawHand() {
            const node = AR._pending;
            if (typeof window.drawRoom === 'function') window.drawRoom();
            // Depth scaling: deeper nodes hit harder. Elites get an extra bump.
            const mult = 1 + (node.tier || 0) * 0.03 + (node.type === 'elite' ? 0.25 : 0);
            if (mult > 1.01 && Array.isArray(game.room)) {
                game.room.forEach((c) => {
                    if ((c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss && c.numValue > 0) {
                        c.numValue = Math.max(2, Math.round(c.numValue * mult));
                    }
                });
                if (window.updateUI) window.updateUI();
            }
            if (AR._handsTotal > 1 && window.showMessage) {
                window.showMessage(`⚔️ Wave ${AR._handsDone + 1} of ${AR._handsTotal}`, 'info');
            }
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
            // Count the worst threat still in the run deck (dungeon + discard).
            const pool = [...(game.dungeon || []), ...(game.discardPile || [])];
            const monsters = pool.filter(c => (c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss);
            const worst = monsters.reduce((m, c) => (!m || c.numValue > m.numValue ? c : m), null);

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.style.zIndex = '10001';
            overlay.innerHTML = `
                <div class="modal-content" style="max-width:460px;text-align:center;border:2px solid #c9a961;">
                    <div style="font-size:2.4em;">🔥</div>
                    <h2 style="font-family:'Cinzel',serif;color:#e8c878;">Campfire</h2>
                    <p style="color:#cbb892;">Catch your breath, or thin the horde ahead.</p>
                    <div style="display:flex;gap:12px;justify-content:center;margin-top:16px;flex-wrap:wrap;">
                        <button class="btn btn-primary" id="advRestHeal" style="flex:1;min-width:150px;">🔥 Rest<br><small>Recover ${heal} HP</small></button>
                        <button class="btn btn-secondary" id="advRestCull" style="flex:1;min-width:150px;" ${worst ? '' : 'disabled'}>⚒️ Cull a Threat<br><small>${worst ? `Remove a ${worst.numValue}-power monster` : 'No threats left'}</small></button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            const done = () => { overlay.remove(); if (window.updateUI) window.updateUI(); AR._toMapSoon(); };
            overlay.querySelector('#advRestHeal').onclick = () => {
                game.health = Math.min(game.maxHealth, game.health + heal);
                if (window.showMessage) window.showMessage(`🔥 You rest — recovered ${heal} HP.`, 'success');
                done();
            };
            overlay.querySelector('#advRestCull').onclick = () => {
                if (worst) {
                    const di = game.dungeon.indexOf(worst);
                    if (di >= 0) game.dungeon.splice(di, 1);
                    else { const pi = game.discardPile.indexOf(worst); if (pi >= 0) game.discardPile.splice(pi, 1); }
                    if (window.showMessage) window.showMessage(`⚒️ You cull a ${worst.numValue}-power monster from the dungeon.`, 'success');
                }
                done();
            };
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
            // Multi-wave encounters (difficulty = hands): draw the next wave before
            // returning to the map.
            if (node && (node.type === 'combat' || node.type === 'elite') &&
                (AR._handsDone + 1) < (AR._handsTotal || 1)) {
                AR._handsDone++;
                setTimeout(() => AR._drawHand(), 250);
                return;
            }
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
