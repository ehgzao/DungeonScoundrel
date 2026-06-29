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
            // Hide the linear room + corner-merchant controls — the map drives
            // progression and the merchant is a map node in Adventure.
            ['btnDrawRoom', 'btnAvoidRoom', 'btnOpenShop'].forEach(id => {
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
            // Illustrated boss art: per-class for the finale, generic guardian per
            // act otherwise (see tools/cards.config.mjs BOSSES + assets/cards/adventure).
            const artKey = node.type === 'finalboss'
                ? `boss_${game.playerClass || 'scoundrel'}`
                : `boss_act${Math.min((node.act || 0) + 1, 2)}`;
            const boss = {
                suit: '👹', value: '👹', numValue: hp, maxHP: hp,
                isBoss: true,
                bossNumber: node.type === 'finalboss' ? 99 : (node.act + 1),
                bossName: node.boss ? node.boss.name : 'Dungeon Guardian',
                bossFlavor: node.boss ? node.boss.flavor : 'A warden of the deep.',
                suitName: 'spades',
                artKey,
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

        // Relic rarity scales with depth (act 0..2; bosses pass act+1 for rarer).
        _relicRarity(act) {
            const r = Math.random();
            if (act <= 0) return r < 0.7 ? 'common' : 'uncommon';
            if (act === 1) return r < 0.6 ? 'uncommon' : 'rare';
            return r < 0.6 ? 'rare' : 'legendary';
        },
        _grantRelic(act) {
            if (window.giveRelicByRarity) window.giveRelicByRarity(AR._relicRarity(act));
            if (window.updateUI) window.updateUI();
        },

        _treasure(node) {
            const gold = 10 + node.tier * 2;
            if (window.earnGold) window.earnGold(gold); else game.gold += gold;
            AR._grantRelic(node.act);
            if (window.updateUI) window.updateUI();
            if (window.showMessage) window.showMessage(`🎁 Treasure! A relic and ${gold} gold.`, 'success');
            AR._toMapSoon();
        },

        // ADV-2: a dedicated merchant with deck-building services. Buys/edits hit
        // the persistent run deck (game.dungeon + discard), so they stick.
        _shop(node) {
            const act = node.act || 0;
            AR._merchantAct = act;
            const prices = { weapon: 12 + act * 4, potion: 12 + act * 4, remove: 18 + act * 4, upgrade: 20 + act * 5, relic: 35 + act * 10 };
            let overlay = document.getElementById('advMerchant');
            if (!overlay) { overlay = document.createElement('div'); overlay.id = 'advMerchant'; overlay.className = 'modal-overlay'; overlay.style.zIndex = '10001'; document.body.appendChild(overlay); }
            overlay.classList.add('active');
            const render = () => {
                const g = game.gold || 0;
                const dis = (c) => (g >= c ? '' : 'disabled');
                overlay.innerHTML = `
                    <div class="modal-content" style="max-width:520px;text-align:center;border:2px solid #c9a961;">
                        <h2 style="font-family:'Cinzel',serif;color:#e8c878;">🏛️ Merchant</h2>
                        <p style="color:#cbb892;">Gold: <strong style="color:#e8c878;">${g} 🪙</strong></p>
                        <div style="display:flex;flex-direction:column;gap:8px;margin:14px 0;">
                            <button class="btn btn-secondary" data-buy="weapon" ${dis(prices.weapon)}>🗡️ Buy a Weapon — ${prices.weapon} 🪙</button>
                            <button class="btn btn-secondary" data-buy="potion" ${dis(prices.potion)}>🧪 Buy a Potion — ${prices.potion} 🪙</button>
                            <button class="btn btn-secondary" data-buy="remove" ${dis(prices.remove)}>✂️ Remove a Threat — ${prices.remove} 🪙</button>
                            <button class="btn btn-secondary" data-buy="upgrade" ${dis(prices.upgrade)}>⬆️ Sharpen a Weapon (+2) — ${prices.upgrade} 🪙</button>
                            <button class="btn btn-secondary" data-buy="relic" ${dis(prices.relic)}>🔮 Mystery Relic — ${prices.relic} 🪙</button>
                        </div>
                        <button class="btn btn-primary" data-buy="leave">Leave</button>
                    </div>`;
                overlay.querySelectorAll('button[data-buy]').forEach(btn => {
                    btn.onclick = () => {
                        const a = btn.dataset.buy;
                        if (a === 'leave') { overlay.classList.remove('active'); AR._toMapSoon(); return; }
                        if (AR._merchantBuy(a, prices[a])) render();
                    };
                });
            };
            render();
        },

        // Returns true if a purchase happened (so the merchant re-renders).
        _merchantBuy(action, cost) {
            if ((game.gold || 0) < cost) return false;
            let msg = '';
            if (action === 'weapon') {
                const v = 6 + Math.floor(Math.random() * 5);
                game.dungeon.push({ value: String(v), suit: '♦', numValue: v, suitName: 'diamonds' });
                msg = `Bought a ${v}♦ weapon — it joins your deck.`;
            } else if (action === 'potion') {
                const v = 6 + Math.floor(Math.random() * 5);
                game.dungeon.push({ value: String(v), suit: '♥', numValue: v, suitName: 'hearts' });
                msg = `Bought a ${v}♥ potion — it joins your deck.`;
            } else if (action === 'remove') {
                const pool = [...(game.dungeon || []), ...(game.discardPile || [])];
                const worst = pool.filter(c => (c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss)
                    .reduce((m, c) => (!m || c.numValue > m.numValue ? c : m), null);
                if (!worst) { if (window.showMessage) window.showMessage('No threats left to remove.', 'warning'); return false; }
                const di = game.dungeon.indexOf(worst);
                if (di >= 0) game.dungeon.splice(di, 1); else { const pi = game.discardPile.indexOf(worst); if (pi >= 0) game.discardPile.splice(pi, 1); }
                msg = `Removed a ${worst.numValue}-power monster from your deck.`;
            } else if (action === 'upgrade') {
                const pool = [...(game.dungeon || []), ...(game.discardPile || [])];
                const weapons = pool.filter(c => c.suitName === 'diamonds' && c.numValue < 13);
                if (!weapons.length) { if (window.showMessage) window.showMessage('No weapon to sharpen.', 'warning'); return false; }
                const w = weapons[Math.floor(Math.random() * weapons.length)];
                w.numValue = Math.min(13, w.numValue + 2); w.value = String(w.numValue);
                msg = `Sharpened a weapon to ${w.numValue}♦.`;
            } else if (action === 'relic') {
                AR._grantRelic(AR._merchantAct || 0);
                msg = 'Acquired a relic.';
            }
            game.gold -= cost;
            if (window.updateUI) window.updateUI();
            if (window.showMessage && msg) window.showMessage('🏛️ ' + msg, 'success');
            return true;
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
            // ADV-5: relic rewards for tougher nodes.
            if (node && node.type === 'elite') {
                AR._grantRelic(node.act);
                if (window.showMessage) window.showMessage('💀 Elite slain — a relic is yours!', 'success');
            } else if (node && node.type === 'boss') {
                AR._grantRelic((node.act || 0) + 1);
                if (window.showMessage) window.showMessage('👹 Boss felled — a powerful relic!', 'success');
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
