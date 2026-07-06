/* ============================================
   ADVENTURE RUN ORCHESTRATOR
   Drives an Adventure-mode run through the procedural map: each node launches an
   encounter using the EXISTING engine (combat reuses drawRoom; bosses spawn a
   boss card; rest/treasure/event/shop reuse existing systems), and control
   returns to the map when the encounter resolves. Classic mode is untouched.

   Loaded as a classic script after game.js + adventure-map.js; uses window.* .
   ============================================ */
(function () {
    // Daily Challenge: one shared seed per UTC day. Same class ⇒ identical map
    // AND identical gameplay RNG stream (draws, gold, events — seedRunRng).
    const _d = new Date();
    const DAILY_DAY = `${_d.getUTCFullYear()}-${String(_d.getUTCMonth() + 1).padStart(2, '0')}-${String(_d.getUTCDate()).padStart(2, '0')}`;
    let _h = 0;
    for (const c of DAILY_DAY) _h = (_h * 31 + c.charCodeAt(0)) >>> 0;
    window.DailyRun = { day: DAILY_DAY, seed: _h, pending: false };

    // Adventure reward/decision moments get the same audio cues as Classic
    // (shop purchases play 'special', blocks play 'error' — see game-shop.js).
    const sfx = (name) => { if (typeof window.playSound === 'function') window.playSound(name); };

    // Run-scoped RNG (seeded on Daily runs — see game-state.js runRand).
    const rnd = () => (typeof window.runRand === 'function' ? window.runRand() : Math.random());

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
            window.AdventureMap.start(game.playerClass, game.dailyRun ? window.DailyRun.seed : null);
            window.AdventureMap.onNodeSelected = (node) => AR.enter(node);
            AR.showMap();
            AR._showIntroIfFirstTime();
            AR._startWatchdog();
            AR._warmArt();
        },

        // Prefetch this run's card art in idle time so mid-run reveals don't
        // pop in one by one (each card is a lazy background-image otherwise).
        // URLs must match game.js's createCardElement exactly (?v=ADV_ART_VER)
        // or the browser cache / service worker cache is missed.
        _warmArt() {
            if (AR._warmed) return;
            AR._warmed = true;
            try { if (navigator.connection && navigator.connection.saveData) return; } catch (_) {}
            const ver = window.ADV_ART_VER || '1';
            const names = [];
            for (let v = 2; v <= 14; v++) names.push(`monster_${v}`);
            for (let v = 2; v <= 10; v++) names.push(`weapon_${v}`, `potion_${v}`);
            names.push('boss_act1', 'boss_act2', `boss_${game.playerClass || 'scoundrel'}`);
            const urls = names.map(n => `assets/cards/adventure/${n}.webp?v=${ver}`);
            ['campfire', 'merchant', 'chest', 'event'].forEach(s => urls.push(`assets/images/scene-${s}.webp`));
            urls.push('assets/images/bg-act2.webp?v=1', 'assets/images/bg-act3.webp?v=1');
            const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 400));
            const loadNext = () => {
                if (!urls.length || !game.adventureRun) return;
                urls.splice(0, 4).forEach(u => { const img = new Image(); img.src = u; });
                idle(loadNext);
            };
            idle(loadNext);
        },

        // Recovery net: in Adventure the map is the only way forward (the linear
        // room buttons are hidden), so if every overlay is ever dismissed without
        // handing control back — a future overlay bug, an unforeseen close path —
        // reopen the map instead of stranding the run. No-op outside Adventure.
        _startWatchdog() {
            if (AR._watchdog) return;
            AR._watchdog = setInterval(() => {
                if (!game.adventureRun || game.gameOver) return;
                if (AR._pending) return;                                    // encounter in progress
                if (Array.isArray(game.room) && game.room.length) return;   // hand on screen
                if (document.querySelector('.modal-overlay.active')) return;
                AR.showMap();
            }, 1500);
        },

        // Adventure's OWN tutorial — a concise first-run explainer of the map,
        // node types, waves and deck-building (distinct from Classic's interactive
        // step tutorial, which is suppressed in Adventure). Shown once.
        _showIntroIfFirstTime() {
            const KEY = 'dungeon_scoundrel_adventure_intro_seen';
            let seen = false;
            try { seen = !!localStorage.getItem(KEY); } catch (_) {}
            if (seen) return;
            const adv = (window.AdventureMap && window.AdventureMap.map) ? window.AdventureMap.map.adventure : null;
            const bossName = adv && adv.finalBoss ? adv.finalBoss.name : 'your nemesis';
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.id = 'advIntro';
            overlay.style.zIndex = '10002';
            overlay.dataset.esc = '#advIntroBtn'; // Escape = "Begin" (marks seen, keeps the map open behind)
            overlay.innerHTML = `
                <div class="modal-content" style="max-width:560px;text-align:left;border:2px solid #c9a961;">
                    <h2 style="font-family:'Cinzel',serif;color:#e8c878;text-align:center;">🗺️ Adventure — How It Works</h2>
                    <p style="color:#cbb892;text-align:center;margin-top:-4px;">A branching descent. You choose the path; every run is different.</p>
                    <ul style="color:#ddd;line-height:1.7;font-size:0.95em;padding-left:18px;margin:14px 0;">
                        <li><strong>Pick a node</strong> each step — only connected nodes ahead are selectable (hover for a tooltip).</li>
                        <li>⚔️ Battle &nbsp; 💀 Elite (drops a relic) &nbsp; ❓ Event (real choices) &nbsp; 🏛️ Merchant</li>
                        <li>🔥 Campfire — <strong>heal OR cull</strong> a threat from your deck (pick one). &nbsp; 🎁 Treasure — some chests are <strong>cursed</strong>: big reward, but a curse joins your deck.</li>
                        <li><strong>Difficulty = waves</strong> per encounter: Easy 1 · Normal 2 · Hard 3.</li>
                        <li>Your <strong>deck persists</strong> all run — cull threats, buy cards, sharpen weapons to build it.</li>
                        <li><strong>Bosses fight beside their horde</strong> — your deck deals cards into the fight, so a weapon is always within reach… for a price.</li>
                        <li>Reach the bottom and defeat <strong>${bossName}</strong> to win.</li>
                    </ul>
                    <div style="text-align:center;">
                        <button class="btn btn-primary" id="advIntroBtn">Begin the Descent</button>
                    </div>
                </div>`;
            document.body.appendChild(overlay);
            const close = () => { try { localStorage.setItem(KEY, '1'); } catch (_) {} overlay.remove(); };
            overlay.querySelector('#advIntroBtn').onclick = close;
        },

        showMap() {
            if (game.gameOver) return; // never reopen the map over a game-over screen
            if (window.AdventureMap) window.AdventureMap.openScreen();
        },

        enter(node) {
            if (window.AdventureMap) window.AdventureMap.closeScreen();
            // Per-act combat backdrop (Gemini art): act 1 keeps the base bg
            document.body.classList.toggle('adv-act-2', node.act === 1);
            document.body.classList.toggle('adv-act-3', node.act === 2);
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
            const eff = window.ascensionEffects ? window.ascensionEffects(game.ascension) : { depthSlope: 0.03, eliteBonus: 0.25 };
            const mult = 1 + (node.tier || 0) * eff.depthSlope + (node.type === 'elite' ? eff.eliteBonus : 0);
            if (mult > 1.01 && Array.isArray(game.room)) {
                game.room.forEach((c) => {
                    if ((c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss && c.numValue > 0) {
                        // Scale from the card's BASE value: these objects live in
                        // the persistent run deck and recycle through the discard,
                        // so scaling numValue in place would compound every cycle.
                        if (c._baseValue == null) c._baseValue = c.numValue;
                        c.numValue = Math.max(2, Math.round(c._baseValue * mult));
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
            const asc = window.ascensionEffects ? window.ascensionEffects(game.ascension) : null;
            const baseHp = { easy: 18, normal: 26, hard: 34, endless: 26 }[game.difficulty] || 26;
            let hp = node.type === 'finalboss' ? baseHp + 12 : baseHp + node.act * 4;
            if (asc) hp = Math.round(hp * asc.bossHpMult); // A1/A10
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
                // Capped retaliation for a weaponless strike (game-combat.js):
                // numValue is an HP POOL (26-46), not a monster value — using it
                // as damage one-shot any player who arrived without a weapon.
                strike: (node.type === 'finalboss' ? 14 : 10 + (node.act || 0) * 2) + (asc ? asc.bossStrikeDelta : 0),
            };
            game.room = [boss];
            game.lastActionWasAvoid = false;
            AR._wavesDealt = 0;
            AR._dealBossWave(node);
            if (window.music && window.music.playBossStinger) window.music.playBossStinger();
            if (window.updateUI) window.updateUI();
            if (window.showMessage) window.showMessage(`👹 ${boss.bossName} — ${boss.bossFlavor}`, 'danger');
        },

        // Boss entourage: the guardian never fights alone — each wave deals 3
        // cards from the persistent run deck next to it. This is the fairness
        // system for arriving weaponless: weapons and potions cycle through the
        // waves, so the fight is a dig for a blade instead of a checkmate.
        _dealBossWave(node) {
            const draw = [];
            for (let i = 0; i < 3; i++) {
                if (!game.dungeon.length && game.discardPile.length) {
                    const recycled = game.discardPile.splice(0);
                    game.dungeon = window.shuffleDeck ? window.shuffleDeck(recycled) : recycled;
                }
                if (game.dungeon.length) draw.push(game.dungeon.shift());
            }
            // Same depth scaling as _drawHand, from base values (idempotent —
            // these cards recycle through the discard all run).
            const mult = 1 + (node.tier || 0) * (window.ascensionEffects ? window.ascensionEffects(game.ascension).depthSlope : 0.03);
            if (mult > 1.01) {
                draw.forEach((c) => {
                    if ((c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss && c.numValue > 0) {
                        if (c._baseValue == null) c._baseValue = c.numValue;
                        c.numValue = Math.max(2, Math.round(c._baseValue * mult));
                    }
                });
            }
            // Failsafe: a deck stripped of every weapon (culls, sales) would
            // still be unwinnable bare-handed — leave a rusted blade in reach.
            const hasWeaponSomewhere = !!game.equippedWeapon ||
                [...draw, ...game.room, ...game.dungeon, ...game.discardPile].some(c => c.suitName === 'diamonds');
            if (!hasWeaponSomewhere) {
                draw.push({ value: '4', suit: '♦', numValue: 4, suitName: 'diamonds' });
                if (window.showMessage) window.showMessage('🗡️ You spot a rusted blade among the bones.', 'info');
            }
            game.room.push(...draw);
            game.potionsUsed = 0; // each wave is a fresh room, same as multi-hand combat
            AR._wavesDealt = (AR._wavesDealt || 0) + 1;
            if (window.updateUI) window.updateUI();
        },

        // Called from checkGameState after every action while a room is live:
        // when only the living boss remains, the horde regroups. Refills after
        // the opening wave cost chip damage — that pressure is what keeps the
        // endless deck recycle from being a free score/gold farm (score counts
        // kills + gold), and it puts a clock on digging for a weapon.
        maybeRefillBossWave() {
            const node = AR._pending;
            if (!node || (node.type !== 'boss' && node.type !== 'finalboss')) return;
            if (game.gameOver || AR._waveTimer) return;
            if (game.room.length !== 1) return;
            const boss = game.room[0];
            if (!boss || !boss.isBoss || boss.numValue <= 0) return;
            AR._waveTimer = setTimeout(() => {
                AR._waveTimer = null;
                // Conditions may have shifted during the delay (undo, defeat).
                if (game.gameOver || game.room.length !== 1 || !game.room[0] || !game.room[0].isBoss) return;
                // Chip escalates 50% per extra wave (capped at 2x strike): a potion-
                // rich deck out-healed a flat chip, so stalling had no clock at all.
                const waves = Math.max(1, (AR._wavesDealt || 1) + ((window.ascensionEffects ? window.ascensionEffects(game.ascension).chipWaveBase : 1) - 1));
                const chip = Math.min(
                    (game.room[0].strike || 10) * 2,
                    Math.ceil(((game.room[0].strike || 10) / 2) * (1 + (waves - 1) * 0.5))
                );
                game.health -= chip;
                game.stats.totalDamage += chip;
                game.lastDamageSource = game.room[0].bossName || 'the Boss';
                if (window.showMessage) window.showMessage(`👹 ${game.room[0].bossName || 'The boss'} lashes out as the horde regroups! -${chip} HP`, 'danger');
                sfx('damage');
                if (window.screenShake) window.screenShake();
                AR._dealBossWave(node); // updateUI inside catches a lethal chip -> death
                if (window.checkGameState) window.checkGameState();
            }, 600);
        },

        _rest(node) {
            const heal = Math.ceil(game.maxHealth * (window.ascensionEffects ? window.ascensionEffects(game.ascension).campfireHeal : 0.3));
            // Count the worst threat still in the run deck (dungeon + discard).
            const pool = [...(game.dungeon || []), ...(game.discardPile || [])];
            const monsters = pool.filter(c => (c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss);
            const worst = monsters.reduce((m, c) => (!m || c.numValue > m.numValue ? c : m), null);

            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.style.zIndex = '10001';
            overlay.dataset.esc = 'block'; // one-shot decision — must resolve via a button
            overlay.innerHTML = `
                <div class="modal-content" style="max-width:460px;text-align:center;border:2px solid #c9a961;">
                    <div class="adv-scene" style="background-image:url('assets/images/scene-campfire.webp')"></div>
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
                sfx('heal');
                if (window.showMessage) window.showMessage(`🔥 You rest — recovered ${heal} HP.`, 'success');
                done();
            };
            overlay.querySelector('#advRestCull').onclick = () => {
                if (worst) {
                    const di = game.dungeon.indexOf(worst);
                    if (di >= 0) game.dungeon.splice(di, 1);
                    else { const pi = game.discardPile.indexOf(worst); if (pi >= 0) game.discardPile.splice(pi, 1); }
                    sfx('avoid');
                    if (window.showMessage) window.showMessage(`⚒️ You cull a ${worst.numValue}-power monster from the dungeon.`, 'success');
                }
                done();
            };
        },

        // Relic rarity scales with depth (act 0..2; bosses pass act+1 for rarer).
        _relicRarity(act) {
            const r = rnd();
            if (act <= 0) return r < 0.7 ? 'common' : 'uncommon';
            if (act === 1) return r < 0.6 ? 'uncommon' : 'rare';
            return r < 0.6 ? 'rare' : 'legendary';
        },
        _grantRelic(act) {
            if (window.giveRelicByRarity) window.giveRelicByRarity(AR._relicRarity(act));
            sfx('special');
            if (window.updateUI) window.updateUI();
        },

        // The genre-defining reward moment: pick 1 of 3 relics instead of an
        // auto-grant — this is where a build identity is actually chosen.
        // Used for elite/boss kills and uncursed treasure. Events, cursed
        // chests and the merchant's Mystery Relic stay single-outcome bets by
        // design (the gamble IS their decision).
        _offerRelicChoice(act, icon, title, flavor) {
            const rarity = AR._relicRarity(act);
            const picks = window.relicChoicesByRarity ? window.relicChoicesByRarity(rarity, 3) : [];
            if (picks.length < 2 || !window.giveSpecificRelic) { AR._grantRelic(act); AR._toMapSoon(); return; }
            const rarityIcons = { common: '⚪', uncommon: '🟢', rare: '🔵', legendary: '🟠' };
            AR._choiceModal({
                icon: icon || '🎁',
                title: title || 'Choose a Relic',
                flavor: `${flavor || 'One prize leaves with you. The rest stay in the dark.'} (${rarityIcons[rarity] || ''} ${rarity})`,
                choices: picks.map((r) => ({
                    label: r.name,
                    sub: r.description,
                    apply: () => {
                        window.giveSpecificRelic(r);
                        return `${r.name} — yours. The dark keeps the rest.`;
                    },
                })),
            });
        },

        _treasure(node) {
            // ADV-6: ~35% of treasures are CURSED chests — a real risk/reward
            // decision instead of a free reward.
            if (rnd() < 0.35) return AR._cursedChest(node);
            const gold = 10 + node.tier * 2;
            if (window.earnGold) window.earnGold(gold); else game.gold += gold;
            if (window.updateUI) window.updateUI();
            if (window.showMessage) window.showMessage(`🎁 Treasure! ${gold} gold — and a choice of relics.`, 'success');
            AR._offerRelicChoice(node.act, '🎁', 'Treasure', 'Three relics glitter in the chest. Take one.');
        },

        // ADV-6: drop a "curse" — a strong extra monster — into the live run deck.
        // Curses bloat the deck and surface as tough draws; cull/remove services
        // target the highest-power card, so they're the natural answer.
        _injectCurse(power) {
            const v = Math.max(2, Math.min(14, Math.round(power)));
            const suit = rnd() < 0.5 ? '♠' : '♣';
            const suitName = suit === '♠' ? 'spades' : 'clubs';
            const curse = { value: String(v), suit, numValue: v, suitName, isCurse: true };
            if (!Array.isArray(game.dungeon)) game.dungeon = [];
            const idx = Math.floor(rnd() * (game.dungeon.length + 1));
            game.dungeon.splice(idx, 0, curse);
            sfx('damage'); // ominous thud — something foul just joined the deck
        },

        _cursedChest(node) {
            const gold = 18 + node.tier * 3;
            const cursePow = 8 + node.act * 2 + Math.floor(rnd() * 4);
            AR._choiceModal({
                icon: '⚰️', scene: 'scene-chest', title: 'A Cursed Chest',
                flavor: 'Gold glints behind a sigil of binding. Greed always has a price.',
                choices: [
                    {
                        label: '⚒️ Pry it open',
                        sub: `+${gold} gold & a relic — but a curse joins your deck`,
                        apply: () => {
                            if (window.earnGold) window.earnGold(gold); else game.gold += gold;
                            AR._grantRelic(node.act);
                            AR._injectCurse(cursePow);
                            return `You wrench it open — ${gold} gold and a relic are yours. But something foul now stalks your deck (a ${cursePow}-power curse).`;
                        },
                    },
                    {
                        label: '🚪 Leave it sealed',
                        sub: 'Some doors are best left shut',
                        apply: () => 'You leave the cursed chest bound. Safe — and empty-handed.',
                    },
                ],
            });
        },

        // ADV-2: a dedicated merchant with deck-building services. Buys/edits hit
        // the persistent run deck (game.dungeon + discard), so they stick.
        _shop(node) {
            const act = node.act || 0;
            AR._merchantAct = act;
            AR._bumpLifetime('shopsVisited'); // parity with Classic shop (shopper achievement)
            // Base prices scale with act; the discount rules (Merchant Friend
            // unlock, Lucky Dice, Crystal) are the SAME as the Classic shop —
            // shared core in game-economy.js so the two can't drift.
            const P = (base) => (window.GameEconomy ? window.GameEconomy.discountedPrice(base) : base);
            const prices = { weapon: P(12 + act * 4), potion: P(12 + act * 4), remove: P(18 + act * 4), upgrade: P(20 + act * 5), relic: P(35 + act * 10) };
            let overlay = document.getElementById('advMerchant');
            if (!overlay) { overlay = document.createElement('div'); overlay.id = 'advMerchant'; overlay.className = 'modal-overlay'; overlay.style.zIndex = '10001'; document.body.appendChild(overlay); }
            overlay.dataset.esc = '[data-buy="leave"]'; // Escape = Leave (returns to the map)
            overlay.classList.add('active');
            const render = () => {
                const g = game.gold || 0;
                const dis = (c) => (g >= c ? '' : 'disabled');
                overlay.innerHTML = `
                    <div class="modal-content" style="max-width:520px;text-align:center;border:2px solid #c9a961;">
                        <div class="adv-scene" style="background-image:url('assets/images/scene-merchant.webp')"></div>
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
            if ((game.gold || 0) < cost) { sfx('error'); return false; }
            let msg = '';
            if (action === 'weapon') {
                const v = 6 + Math.floor(rnd() * 5);
                game.dungeon.push({ value: String(v), suit: '♦', numValue: v, suitName: 'diamonds' });
                msg = `Bought a ${v}♦ weapon — it joins your deck.`;
            } else if (action === 'potion') {
                const v = 6 + Math.floor(rnd() * 5);
                game.dungeon.push({ value: String(v), suit: '♥', numValue: v, suitName: 'hearts' });
                msg = `Bought a ${v}♥ potion — it joins your deck.`;
            } else if (action === 'remove') {
                const pool = [...(game.dungeon || []), ...(game.discardPile || [])];
                const worst = pool.filter(c => (c.suitName === 'clubs' || c.suitName === 'spades') && !c.isBoss)
                    .reduce((m, c) => (!m || c.numValue > m.numValue ? c : m), null);
                if (!worst) { sfx('error'); if (window.showMessage) window.showMessage('No threats left to remove.', 'warning'); return false; }
                const di = game.dungeon.indexOf(worst);
                if (di >= 0) game.dungeon.splice(di, 1); else { const pi = game.discardPile.indexOf(worst); if (pi >= 0) game.discardPile.splice(pi, 1); }
                msg = `Removed a ${worst.numValue}-power monster from your deck.`;
            } else if (action === 'upgrade') {
                const pool = [...(game.dungeon || []), ...(game.discardPile || [])];
                const weapons = pool.filter(c => c.suitName === 'diamonds' && c.numValue < 13);
                if (!weapons.length) { sfx('error'); if (window.showMessage) window.showMessage('No weapon to sharpen.', 'warning'); return false; }
                const w = weapons[Math.floor(rnd() * weapons.length)];
                w.numValue = Math.min(13, w.numValue + 2); w.value = String(w.numValue);
                msg = `Sharpened a weapon to ${w.numValue}♦.`;
            } else if (action === 'relic') {
                AR._grantRelic(AR._merchantAct || 0);
                msg = 'Acquired a relic.';
            }
            game.gold -= cost;
            // Shared purchase bookkeeping (lifetime itemsBought + achievements)
            if (window.GameEconomy) window.GameEconomy.recordPurchase();
            else AR._bumpLifetime('itemsBought');
            if (action !== 'relic') sfx('special'); // relic purchases already chime via _grantRelic
            if (window.updateUI) window.updateUI();
            if (window.showMessage && msg) window.showMessage('🏛️ ' + msg, 'success');
            return true;
        },

        // ADV-4: event nodes are real decisions with trade-offs, not free boons.
        _eventPool(node) {
            const tier = node.tier || 0, act = node.act || 0;
            const gold = (n) => { if (window.earnGold) window.earnGold(n); else game.gold += n; };
            const spend = (n) => { game.gold = Math.max(0, (game.gold || 0) - n); };
            const heal = (frac) => {
                const h = Math.ceil(game.maxHealth * frac);
                game.health = Math.min(game.maxHealth, game.health + h); return h;
            };
            const hurt = (n) => { game.health = Math.max(1, game.health - n); };
            const addCard = (suit, suitName) => {
                const v = 6 + Math.floor(rnd() * 5);
                game.dungeon.push({ value: String(v), suit, numValue: v, suitName });
                return v;
            };
            return [
                {
                    icon: '🩸', title: 'The Blood Altar',
                    flavor: 'An altar slick with old offerings. It thirsts, and it bargains.',
                    choices: [
                        { label: '🩸 Offer your blood', sub: 'Lose 5 HP → gain a relic', disabled: game.health <= 5,
                          apply: () => { hurt(5); AR._grantRelic(act); return 'The altar drinks deep — and presses a relic into your hand.'; } },
                        { label: '🪙 Pocket the tribute', sub: `Take ${12 + tier * 2} gold`,
                          apply: () => { gold(12 + tier * 2); return 'You sweep the old coins off the altar and move on.'; } },
                        { label: '🚪 Leave it be', sub: 'Tempt nothing',
                          apply: () => 'You step around the altar. Some debts aren\'t worth owing.' },
                    ],
                },
                {
                    icon: '🎲', title: "Gambler's Wager",
                    flavor: 'A grinning shade rattles a cup of bone dice. "Double or nothing, friend?"',
                    choices: [
                        { label: '🎲 Roll the bones', sub: 'Wager half your gold — win double or lose it', disabled: (game.gold || 0) < 10,
                          apply: () => { const stake = Math.floor((game.gold || 0) / 2); spend(stake); if (rnd() < 0.5) { gold(stake * 2); return `The dice land kind — you win ${stake * 2} gold!`; } return `The dice betray you. ${stake} gold gone.`; } },
                        { label: '🍞 Decline politely', sub: 'A small meal, +10% HP',
                          apply: () => { const h = heal(0.10); return `You decline and share his bread instead. +${h} HP.`; } },
                    ],
                },
                {
                    icon: '📦', title: 'A Forgotten Cache',
                    flavor: 'A dead adventurer\'s pack, half-buried. Their loss, your gain.',
                    choices: [
                        { label: '🗡️ Take the weapon', sub: 'A weapon joins your deck',
                          apply: () => { const v = addCard('♦', 'diamonds'); return `You salvage a ${v}♦ weapon — it joins your deck.`; } },
                        { label: '🧪 Take the potion', sub: 'A potion joins your deck',
                          apply: () => { const v = addCard('♥', 'hearts'); return `You salvage a ${v}♥ potion — it joins your deck.`; } },
                    ],
                },
                {
                    icon: '⛲', title: 'The Whispering Spring',
                    flavor: 'Cold water murmurs in the dark. It offers comfort — for a price, if you push it.',
                    choices: [
                        { label: '💧 Drink deeply', sub: 'Heal 25% HP',
                          apply: () => { const h = heal(0.25); return `The water mends you. +${h} HP.`; } },
                        { label: '🪙 Toss a coin & wish', sub: `Pay ${10 + act * 4} gold → a relic`, disabled: (game.gold || 0) < 10 + act * 4,
                          apply: () => { spend(10 + act * 4); AR._grantRelic(act); return 'Your coin sinks. The spring answers with a relic.'; } },
                        { label: '🚪 Move on', sub: 'Leave the water still',
                          apply: () => 'You leave the spring undisturbed.' },
                    ],
                },
                {
                    icon: '🗝️', title: 'A Bound Spirit',
                    flavor: 'A figure chained in chains of light. "Free me, or feed on me — choose."',
                    choices: [
                        { label: '🕊️ Free it', sub: 'Lose 4 HP → it gifts a relic', disabled: game.health <= 4,
                          apply: () => { hurt(4); AR._grantRelic(act + 1); return 'You break the chains. Grateful, the spirit blesses you with a relic.'; } },
                        { label: '⛓️ Bind it for power', sub: `+${20 + tier * 3} gold — but a curse follows you`,
                          apply: () => { gold(20 + tier * 3); AR._injectCurse(7 + act * 2); return 'You wring its power into gold — and earn its hatred. A curse joins your deck.'; } },
                        { label: '🚪 Walk away', sub: 'Leave it bound',
                          apply: () => 'You leave the spirit to its chains.' },
                    ],
                },
            ];
        },

        // QA cross-mode parity: bump a lifetime counter through the storage cache
        // (write-through) so achievement/unlock checks see it, same as Classic.
        _bumpLifetime(key) {
            if (window.storage) window.storage.update('scoundrel_lifetime_stats', s => { s[key] = (s[key] || 0) + 1; return s; });
            if (typeof window.checkAchievements === 'function') window.checkAchievements();
        },

        _event(node) {
            // Parity with Classic events: eventsTriggered (Priest unlock, persisted
            // via updateLifetimeStats from game.stats) + eventsCompleted (achievement).
            if (game.stats) game.stats.eventsTriggered = (game.stats.eventsTriggered || 0) + 1;
            AR._bumpLifetime('eventsCompleted');
            const pool = AR._eventPool(node);
            const ev = pool[Math.floor(rnd() * pool.length)];
            AR._choiceModal({ ...ev, scene: 'scene-event' });
        },

        // Generic risk/reward choice overlay. choices: [{label, sub, disabled,
        // apply()->resultMessage}]. After a choice, shows the outcome then returns
        // control to the map.
        _choiceModal({ icon, title, flavor, choices, scene }) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.style.zIndex = '10001';
            overlay.dataset.esc = 'block'; // a choice is mandatory (events offer a "walk away" button)
            const btns = choices.map((c, i) =>
                `<button class="btn ${i === 0 ? 'btn-primary' : 'btn-secondary'} adv-choice-btn" data-i="${i}" ${c.disabled ? 'disabled' : ''}>${c.label}${c.sub ? `<br><small>${c.sub}</small>` : ''}</button>`
            ).join('');
            const header = scene
                ? `<div class="adv-scene" style="background-image:url('assets/images/${scene}.webp')"></div>`
                : `<div style="font-size:2.4em;">${icon}</div>`;
            overlay.innerHTML = `
                <div class="modal-content" style="max-width:480px;text-align:center;border:2px solid #c9a961;">
                    ${header}
                    <h2 style="font-family:'Cinzel',serif;color:#e8c878;">${title}</h2>
                    <p style="color:#cbb892;line-height:1.5;padding:0 6px;">${flavor}</p>
                    <div class="adv-choices">${btns}</div>
                </div>`;
            document.body.appendChild(overlay);
            overlay.querySelectorAll('button[data-i]').forEach((b) => {
                b.onclick = () => {
                    const c = choices[+b.dataset.i];
                    if (c.disabled) return;
                    sfx('cardFlip'); // outcome reveal
                    const res = c.apply ? c.apply() : null;
                    if (window.updateUI) window.updateUI();
                    overlay.dataset.esc = '#advChoiceCont'; // outcome shown — Escape = Continue (back to map)
                    overlay.querySelector('.modal-content').innerHTML = `
                        ${scene ? `<div class="adv-scene" style="background-image:url('assets/images/${scene}.webp')"></div>` : `<div style="font-size:2.2em;">${icon}</div>`}
                        <p style="color:#ddd;line-height:1.7;padding:8px 10px;font-style:italic;">${res || '...'}</p>
                        <button class="btn btn-primary" id="advChoiceCont">Continue</button>`;
                    overlay.querySelector('#advChoiceCont').onclick = () => {
                        overlay.remove();
                        if (window.updateUI) window.updateUI();
                        AR._toMapSoon();
                    };
                };
            });
        },

        _toMapSoon() { setTimeout(() => AR.showMap(), 300); },

        // Called from checkGameState when an adventure combat/boss room empties.
        afterEncounterCleared() {
            if (game.gameOver) return; // death already handled — no next wave, no map
            game.stats.roomsCleared++;
            // Encounter cleared = room cleared: recharge once-per-room relics
            // (they used to recharge only in the classic room-clear path).
            if (window.resetPerRoomRelicFlags) window.resetPerRoomRelicFlags();
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
            // ADV-5: relic rewards for tougher nodes — pick 1 of 3 (the choice
            // modal's Continue button returns to the map).
            if (node && node.type === 'elite') {
                if (window.showMessage) window.showMessage('💀 Elite slain!', 'success');
                AR._offerRelicChoice(node.act, '💀', 'Elite Spoils', 'It guarded these. It has no further use for them.');
                return;
            } else if (node && node.type === 'boss') {
                if (window.showMessage) window.showMessage('👹 Boss felled!', 'success');
                AR._offerRelicChoice((node.act || 0) + 1, '👹', "The Guardian's Hoard", "Take your prize from the warden's remains.");
                return;
            }
            AR._toMapSoon();
        },

        _ending() {
            const adv = (window.AdventureMap && window.AdventureMap.map) ? window.AdventureMap.map.adventure : null;
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay active';
            overlay.style.zIndex = '10001';
            overlay.dataset.esc = '#advEndBtn'; // Escape = Claim Victory (endGame is the only path forward)
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
