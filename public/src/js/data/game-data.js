/* ============================================
   GAME DATA - RELICS & SHOP
   Relics definitions and Shop items
   Extracted from game.js
   ============================================ */

// ============================================
// RELICS, SHOP, EVENTS (Ported Logic)
// ============================================
const RELICS = [
    // === COMUM (25) - Efeitos básicos e úteis ===
    { id: 'small_shield', name: '🛡️ Small Shield', description: '+3 maximum health', rarity: 'common', effect: 'smallHealth' },
    { id: 'bronze_ring', name: '💍 Bronze Ring', description: '+1 damage to all weapons', rarity: 'common', effect: 'smallPower' },
    { id: 'heal_charm', name: '💚 Healing Charm', description: 'Potions heal +1 HP', rarity: 'common', effect: 'smallHealBonus' },
    { id: 'coin_pouch', name: '💰 Coin Pouch', description: 'Gain 2 gold per room cleared', rarity: 'common', effect: 'smallGoldPerRoom' },
    { id: 'lucky_penny', name: '🪙 Lucky Penny', description: '+20% gold from all sources', rarity: 'common', effect: 'smallGoldBonus' },
    { id: 'leather_boots', name: '👢 Leather Boots', description: 'Avoid costs 2 cards instead of 3', rarity: 'common', effect: 'betterAvoid' },
    { id: 'bandage', name: '🩹 Bandage', description: 'Heal 0.5 HP per room cleared', rarity: 'common', effect: 'tinyRegen' },
    { id: 'weak_thorns', name: '🌿 Weak Thorns', description: 'Reflect 1 damage to attackers', rarity: 'common', effect: 'weakThorns' },
    { id: 'compass', name: '🧭 Compass', description: '10% more events', rarity: 'common', effect: 'moreEvents' },
    { id: 'dice', name: '🎲 Lucky Dice', description: 'Shop items 5% cheaper', rarity: 'common', effect: 'tinyDiscount' },
    { id: 'feather', name: '🪶 Light Feather', description: 'Hold 2 cards instead of 1', rarity: 'common', effect: 'extraHold' },
    { id: 'candle', name: '🕯️ Candle', description: 'Reveal the next card in deck (top-left counter)', rarity: 'common', effect: 'peek' },
    { id: 'rope', name: '🪢 Rope', description: 'Start with 1 extra HP', rarity: 'common', effect: 'tinyHealth' },
    { id: 'stone', name: '🪨 Stone', description: 'Reduce first damage by 1', rarity: 'common', effect: 'firstShield' },
    { id: 'herb', name: '🌱 Herb', description: 'Potions usable twice per dungeon', rarity: 'common', effect: 'doublePot' },
    { id: 'map', name: '🗺️ Map', description: 'See next 3 cards', rarity: 'common', effect: 'cardPreview' },
    { id: 'gloves', name: '🧤 Gloves', description: 'Weapons last 1 extra use', rarity: 'common', effect: 'extraDurability' },
    { id: 'book', name: '📖 Old Book', description: 'Special cards +10% more common', rarity: 'common', effect: 'moreSpecials' },
    { id: 'bell', name: '🔔 Bell', description: 'Gold visible on cards', rarity: 'common', effect: 'goldSight' },
    { id: 'key', name: '🗝️ Old Key', description: 'Unlock 1 free shop item', rarity: 'common', effect: 'freeItem' },
    { id: 'mirror_shard', name: '🪞 Mirror Shard', description: 'Reflect 2 damage once per room', rarity: 'common', effect: 'weakReflect' },
    { id: 'charm', name: '✨ Charm', description: 'Start with 10 extra gold', rarity: 'common', effect: 'startGold' },
    { id: 'tooth', name: '🦷 Monster Tooth', description: 'Monsters give +1 gold', rarity: 'common', effect: 'monsterGold' },
    { id: 'clover', name: '☘️ Four Leaf Clover', description: 'Avoid can be used 2x in row', rarity: 'common', effect: 'doubleAvoid' },
    { id: 'lantern', name: '🏮 Lantern', description: 'Events give +2 gold', rarity: 'common', effect: 'eventGold' },
    
    // === INCOMUM (15) - Efeitos moderados ===
    { id: 'silver_shield', name: '🛡️ Silver Shield', description: '+5 maximum health', rarity: 'uncommon', effect: 'maxHealth' },
    { id: 'silver_ring', name: '💍 Silver Ring', description: '+2 damage to all weapons', rarity: 'uncommon', effect: 'power' },
    { id: 'healer', name: '💚 Healing Amulet', description: 'Potions heal +2 HP', rarity: 'uncommon', effect: 'healBonus' },
    { id: 'greedy', name: '💰 Golden Idol', description: 'Gain 3 gold per room cleared', rarity: 'uncommon', effect: 'goldPerRoom' },
    { id: 'vampire', name: '🧛 Vampiric Fang', description: 'Heal 2 HP when defeating monsters', rarity: 'uncommon', effect: 'lifesteal' },
    { id: 'meditation', name: '🧘 Meditation Stone', description: 'Heal 1 HP per room', rarity: 'uncommon', effect: 'passive_heal' },
    { id: 'armor', name: '🦾 Iron Armor', description: 'Reduce all damage by 1', rarity: 'uncommon', effect: 'damageReduction' },
    { id: 'boots', name: '👟 Speed Boots', description: 'Draw 1 extra card per dungeon', rarity: 'uncommon', effect: 'extraDraw' },
    { id: 'gauntlet', name: '🥊 Power Gauntlet', description: 'First attack each room +3 damage', rarity: 'uncommon', effect: 'firstStrike' },
    { id: 'necklace', name: '📿 Holy Necklace', description: 'Events heal 2 HP', rarity: 'uncommon', effect: 'eventHeal' },
    { id: 'crystal', name: '💎 Crystal', description: 'Shop items 15% cheaper', rarity: 'uncommon', effect: 'discount' },
    { id: 'hourglass', name: '⏳ Hourglass', description: 'Berserk lasts 1 extra turn', rarity: 'uncommon', effect: 'longerBerserk' },
    { id: 'magnet', name: '🧲 Magnet', description: '+40% gold from all sources', rarity: 'uncommon', effect: 'goldBonus' },
    { id: 'ring_fire', name: '🔥 Fire Ring', description: 'Combo damage +1 per stack', rarity: 'uncommon', effect: 'comboBoost' },
    { id: 'cloak', name: '🧥 Cloak', description: 'First damage each room is 0', rarity: 'uncommon', effect: 'firstDodge' },
    { id: 'berserker_ring', name: '💢 Berserker Ring', description: '+2 damage to all weapons', rarity: 'uncommon', effect: 'power' },
    
    // === RARA (8) - Efeitos poderosos ===
    { id: 'gold_shield', name: '🛡️ Golden Shield', description: '+10 maximum health', rarity: 'rare', effect: 'bigHealth' },
    { id: 'blade', name: '🗡️ Dancing Blade', description: '+3 weapon damage', rarity: 'rare', effect: 'bigPower' },
    { id: 'lucky', name: '🍀 Lucky Charm', description: '+60% gold from all sources', rarity: 'rare', effect: 'bigGoldBonus' },
    { id: 'warrior', name: '⚡ Thunder Gauntlet', description: '20% chance to deal double damage', rarity: 'rare', effect: 'criticalChance' },
    { id: 'tank', name: '🏰 Fortress Armor', description: 'Start each room with 1 HP shield', rarity: 'rare', effect: 'roomShield' },
    { id: 'master_smith', name: '🔨 Master Smith', description: 'Repairs weapon at end of each room', rarity: 'rare', effect: 'auto_repair' },
    { id: 'crown', name: '👑 Crown', description: 'Double all stat bonuses from relics', rarity: 'rare', effect: 'doubleRelics' },
    { id: 'orb', name: '🔮 Magic Orb', description: 'Special cards appear 2x more', rarity: 'rare', effect: 'manySpecials' },
    
    // === LENDÁRIA (2) - Game-changing ===
    { id: 'phoenix', name: '🐦 Phoenix Feather', description: 'Revive once with 10 HP', rarity: 'legendary', effect: 'revive', oneTime: true, used: false },
    { id: 'durable_weapons', name: '🛠️ Eternal Forge', description: 'Weapons never break', rarity: 'legendary', effect: 'infinite_durability' }
];

const EVENTS = [
    { id: 'shrine', title: '🔮 Mysterious Shrine', text: 'You find a glowing shrine. An ancient voice offers you a choice...',
        choices: [
            { text: '❤️ Sacrifice 5 HP for +2 weapon damage permanently (Gain Berserker Ring)',
                effect: () => {
                    if (game.health > 5) { 
                        takeDamage(5); 
                        game.relics.push({...RELICS.find(r => r.id === 'berserker_ring')}); 
                        showMessage('Gained Berserker Ring!', 'success'); 
                        updateRelicsDisplay(); 
                    } 
                    else { showMessage('Not enough HP!', 'danger'); }
                }},
            { text: '💰 Offer 20 gold for +5 max HP',
                effect: () => {
                    if (game.gold >= 20) { game.gold -= 20; game.maxHealth += 5; game.health += 5; showMessage('+5 Max HP!', 'success'); } 
                    else { showMessage('Not enough gold!', 'danger'); }
                }},
            { text: '🚪 Leave quietly', effect: () => { showMessage('You leave the shrine untouched.', 'info'); }}
        ]},
    { id: 'merchant', title: '🎒 Traveling Merchant', text: 'A friendly merchant offers you a deal!',
        choices: [
            { text: '💊 Buy healing potion for 15 gold (heal 8 HP)',
                effect: () => {
                    if (game.gold >= 15) { game.gold -= 15; game.health = Math.min(game.maxHealth, game.health + 8); showMessage('Healed 8 HP!', 'success'); } 
                    else { showMessage('Not enough gold!', 'danger'); }
                }},
            { text: '🔮 Buy random relic for 30 gold',
                effect: () => {
                    if (game.gold >= 30) { game.gold -= 30; giveRandomRelic(); } 
                    else { showMessage('Not enough gold!', 'danger'); }
                }},
            { text: '👋 Say goodbye', effect: () => { showMessage('Maybe next time!', 'info'); }}
        ]},
    { id: 'fountain', title: '💧 Whispering Fountain', text: 'You find a shimmering fountain. The water looks pure.',
        choices: [
            { text: 'Drink (Heal 5 HP)', effect: () => { 
                const heal = Math.min(5, game.maxHealth - game.health);
                game.health += heal;
                showMessage(`💧 You feel refreshed! +${heal} HP`, 'success');
                updateUI();
            }},
            { text: 'Ignore', effect: () => { showMessage('You move on.', 'info'); }}
        ]},
    { id: 'gambler', title: '🎲 Shady Gambler', text: 'A figure offers a game. "Bet 10 Gold. Win 25 or lose it all."',
        choices: [
            { text: 'Bet (Requires 10 Gold)', effect: () => { 
                if (game.gold < 10) { showMessage('🎲 "You don\'t have enough gold!" he scoffs.', 'warning'); return; }
                game.gold -= 10;
                if (Math.random() < 0.4) { showMessage('🎲 You won! +25 Gold!', 'success'); earnGold(25); } 
                else { showMessage('🎲 You lost! -10 Gold!', 'danger'); }
                updateUI();
            }},
            { text: 'Refuse', effect: () => { showMessage('You walk away from the game.', 'info'); }}
        ]},
    { id: 'treasure', title: '🏺 Cursed Treasure', text: 'A golden chest glimmers before you... but dark energy surrounds it.',
        choices: [
            { text: '💰 Take the risk (+50 gold, -10 HP)', effect: () => { 
                if (game.health > 10) { takeDamage(10); earnGold(50); showMessage('💰 +50 gold! But the curse hurts...', 'success'); }
                else { showMessage('⚠️ Too risky! You need more than 10 HP!', 'danger'); }
                updateUI();
            }},
            { text: '🔮 Try to cleanse it (50% chance)', effect: () => {
                if (Math.random() < 0.5) { earnGold(60); showMessage('✨ Cleansed! +60 gold with no curse!', 'success'); }
                else { takeDamage(15); showMessage('💔 The curse backfired! -15 HP!', 'danger'); }
                updateUI();
            }},
            { text: '🚪 Leave it alone', effect: () => { showMessage('Wisdom over greed.', 'info'); }}
        ]},
    { id: 'witch', title: '🧙 Mysterious Witch', text: 'An old witch offers her services: "I can upgrade your equipment... for a price."',
        choices: [
            { text: '⚔️ Upgrade weapon (+2 damage, 25 gold)', effect: () => {
                if (game.gold >= 25 && game.equippedWeapon) { 
                    game.gold -= 25; 
                    game.equippedWeapon.numValue += 2; 
                    showMessage('⚔️ Weapon upgraded!', 'success'); 
                    updateUI(); 
                }
                else if (!game.equippedWeapon) { showMessage('No weapon to upgrade!', 'warning'); }
                else { showMessage('Not enough gold!', 'danger'); }
            }},
            { text: '❤️ Restore all HP (30 gold)', effect: () => {
                if (game.gold >= 30) { game.gold -= 30; game.health = game.maxHealth; showMessage('❤️ Fully healed!', 'success'); updateUI(); }
                else { showMessage('Not enough gold!', 'danger'); }
            }},
            { text: '🏃 Decline', effect: () => { showMessage('"Your loss, scoundrel!"', 'info'); }}
        ]},
    { id: 'library', title: '📚 Ancient Library', text: 'You discover a library filled with magical tomes.',
        choices: [
            { text: '📖 Study combat techniques (+1 damage permanent)', effect: () => {
                game.relics.push({ id: 'study_bonus', name: '📖 Combat Study', description: '+1 damage', rarity: 'common', effect: 'smallPower' });
                showMessage('📖 You learned new techniques!', 'success');
                updateRelicsDisplay();
            }},
            { text: '🔮 Learn healing magic (+1 HP/room)', effect: () => {
                game.relics.push({ id: 'healing_study', name: '🔮 Healing Magic', description: '+1 HP per room', rarity: 'uncommon', effect: 'passive_heal' });
                showMessage('🔮 You mastered healing!', 'success');
                updateRelicsDisplay();
            }},
            { text: '🚪 Leave quickly', effect: () => { showMessage('No time for reading!', 'info'); }}
        ]},
    { id: 'beggar', title: '🙏 Poor Beggar', text: 'A starving beggar asks for help. "Please... just 5 gold for food..."',
        choices: [
            { text: '❤️ Give 5 gold (Karma reward)', effect: () => {
                if (game.gold >= 5) { 
                    game.gold -= 5; 
                    game.health = Math.min(game.maxHealth, game.health + 3);
                    showMessage('❤️ Good deed! +3 HP (karma)', 'success'); 
                } else { showMessage('Not enough gold!', 'danger'); }
                updateUI();
            }},
            { text: '💰 Give 20 gold (Great karma)', effect: () => {
                if (game.gold >= 20) { 
                    game.gold -= 20;
                    giveRandomRelic('uncommon');
                    showMessage('✨ Your kindness is rewarded! (Relic gained)', 'success');
                } else { showMessage('Not enough gold!', 'danger'); }
            }},
            { text: '🚶 Ignore', effect: () => { showMessage('You walk past...', 'info'); }}
        ]},
    { id: 'blacksmith', title: '⚒️ Dwarven Blacksmith', text: 'A skilled dwarf offers to fix your gear. "I can repair or enhance!"',
        choices: [
            { text: '🔧 Repair weapon (Full durability, 15 gold)', effect: () => {
                if (game.gold >= 15 && game.equippedWeapon && game.equippedWeapon.durability < game.equippedWeapon.maxDurability) {
                    game.gold -= 15;
                    game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                    showMessage('🔧 Weapon fully repaired!', 'success');
                    updateUI();
                } else if (!game.equippedWeapon) { showMessage('No weapon!', 'warning'); }
                else if (game.equippedWeapon.durability >= game.equippedWeapon.maxDurability) { showMessage('Already at full durability!', 'info'); }
                else { showMessage('Not enough gold!', 'danger'); }
            }},
            { text: '⭐ Enhance durability (+2 max uses, 25 gold)', effect: () => {
                if (game.gold >= 25 && game.equippedWeapon) {
                    game.gold -= 25;
                    game.equippedWeapon.maxDurability += 2;
                    game.equippedWeapon.durability = game.equippedWeapon.maxDurability; // Always set to max
                    showMessage('⭐ Weapon enhanced and fully repaired!', 'success');
                    updateUI();
                } else if (!game.equippedWeapon) { showMessage('No weapon!', 'warning'); }
                else { showMessage('Not enough gold!', 'danger'); }
            }},
            { text: '👋 No thanks', effect: () => { showMessage('"Suit yourself!"', 'info'); }}
        ]},
    { id: 'dragon', title: '🐉 Sleeping Dragon', text: 'A dragon sleeps atop a massive hoard of gold. Do you dare...?',
        choices: [
            { text: '💎 Steal carefully (60% success)', effect: () => {
                if (Math.random() < 0.6) { 
                    earnGold(40); 
                    showMessage('🤫 +40 gold stolen! The dragon sleeps...', 'success'); 
                } else { 
                    takeDamage(20); 
                    showMessage('🐉 The dragon wakes! -20 HP!', 'danger'); 
                }
                updateUI();
            }},
            { text: '🗡️ Fight the dragon! (-15 HP, +80 gold)', effect: () => {
                if (game.health > 15) {
                    takeDamage(15);
                    earnGold(80);
                    showMessage('🐉 Victory! +80 gold!', 'success');
                } else { showMessage('Too dangerous!', 'danger'); }
                updateUI();
            }},
            { text: '🏃 Run away', effect: () => { showMessage('Discretion is the better part of valor.', 'info'); }}
        ]},
    { id: 'mirror', title: '🪞 Magic Mirror', text: 'A mystical mirror shows your reflection. "Touch me and face yourself..."',
        choices: [
            { text: '✨ Accept the challenge (Mirror match)', effect: () => {
                const damage = Math.floor(game.health * 0.3);
                takeDamage(damage);
                earnGold(30);
                showMessage(`🪞 You defeat your reflection! -${damage} HP, +30 gold`, 'success');
                updateUI();
            }},
            { text: '🔮 Ask for wisdom (+5 HP)', effect: () => {
                game.health = Math.min(game.maxHealth, game.health + 5);
                showMessage('🔮 The mirror grants clarity. +5 HP', 'success');
                updateUI();
            }},
            { text: '🚪 Leave', effect: () => { showMessage('You look away from the mirror.', 'info'); }}
        ]},
    { id: 'ghost', title: '👻 Friendly Ghost', text: 'A spectral figure appears. "I can help you... or hurt you. Your choice!"',
        choices: [
            { text: '🎁 Accept help (Random buff)', effect: () => {
                const buffs = ['dodge', 'berserk', 'goldBonus'];
                const buff = buffs[Math.floor(Math.random() * buffs.length)];
                if (buff === 'dodge') { game.dodgeActive = true; showMessage('👻 Next attack dodged!', 'success'); }
                else if (buff === 'berserk') { game.berserkStacks += 3; showMessage('👻 +3 Berserk stacks!', 'success'); }
                else { earnGold(20); showMessage('👻 +20 gold!', 'success'); }
                updateUI();
            }},
            { text: '⚔️ Attack the ghost (Risk/reward)', effect: () => {
                if (Math.random() < 0.5) {
                    earnGold(50);
                    showMessage('👻 The ghost vanishes, dropping gold! +50', 'success');
                } else {
                    takeDamage(8);
                    showMessage('👻 The ghost counterattacks! -8 HP', 'danger');
                }
                updateUI();
            }},
            { text: '🙏 Show respect', effect: () => { showMessage('👻 "Wise choice, mortal."', 'info'); }}
        ]},
    { id: 'portal', title: '🌀 Mysterious Portal', text: 'A swirling portal appears. Where does it lead?',
        choices: [
            { text: '🎲 Jump in! (Random outcome)', effect: () => {
                const outcomes = ['good', 'great', 'bad'];
                const result = outcomes[Math.floor(Math.random() * outcomes.length)];
                if (result === 'good') { game.health += 8; showMessage('🌀 Portal leads to healing springs! +8 HP', 'success'); }
                else if (result === 'great') { giveRandomRelic(); showMessage('🌀 You found a treasure room! Relic gained!', 'success'); }
                else { takeDamage(5); showMessage('🌀 Ouch! Rough landing. -5 HP', 'danger'); }
                updateUI();
            }},
            { text: '🔍 Study it first (Safer)', effect: () => {
                earnGold(15);
                showMessage('🌀 You analyze the portal and find gold nearby. +15', 'success');
                updateUI();
            }},
            { text: '🚫 Avoid it', effect: () => { showMessage('You don\'t trust strange portals.', 'info'); }}
        ]},
    { id: 'altar', title: '🕯️ Sacrificial Altar', text: 'An ancient altar radiates dark power. "Offer something... gain something greater."',
        choices: [
            { text: '❤️ Sacrifice 10 HP (Rare relic)', effect: () => {
                if (game.health > 10) {
                    takeDamage(10);
                    giveRandomRelic('rare');
                    showMessage('🕯️ The altar accepts! Rare relic gained!', 'success');
                } else { showMessage('Not enough HP!', 'danger'); }
                updateUI();
            }},
            { text: '💰 Sacrifice 30 gold (+10 max HP)', effect: () => {
                if (game.gold >= 30) {
                    game.gold -= 30;
                    game.maxHealth += 10;
                    game.health += 10;
                    showMessage('🕯️ Power flows through you! +10 max HP', 'success');
                } else { showMessage('Not enough gold!', 'danger'); }
                updateUI();
            }},
            { text: '🏃 Flee', effect: () => { showMessage('You back away slowly.', 'info'); }}
        ]},
    { id: 'trap', title: '⚠️ Hidden Trap Room', text: 'You trigger a trap! Spikes, arrows, or treasure?',
        choices: [
            { text: '🛡️ Defend (-5 HP, safe)', effect: () => {
                takeDamage(5);
                showMessage('⚠️ You block most damage! -5 HP', 'warning');
                updateUI();
            }},
            { text: '🤸 Dodge! (50% avoid all)', effect: () => {
                if (Math.random() < 0.5) {
                    earnGold(25);
                    showMessage('🤸 Perfect dodge! Found hidden gold! +25', 'success');
                } else {
                    takeDamage(12);
                    showMessage('⚠️ Failed! Hit by trap! -12 HP', 'danger');
                }
                updateUI();
            }},
            { text: '💰 Check for treasure (Risk)', effect: () => {
                if (Math.random() < 0.3) {
                    giveRandomRelic();
                    showMessage('🎁 Trap was a ruse! Relic found!', 'success');
                } else {
                    takeDamage(15);
                    showMessage('💔 Trap activates! -15 HP', 'danger');
                }
                updateUI();
            }}
        ]}
];

// ===================================
// NEW SHOP_ITEMS LIST
// ===================================
const SHOP_ITEMS = [
    {
        id: 'heal_small', name: '💊 Small Potion', description: 'Restore 8 HP', price: 18,
        buy: () => {
            if (game.health >= game.maxHealth) {
                showMessage('⚠️ HP is already full!', 'warning');
                return false;
            }
            game.health = Math.min(game.maxHealth, game.health + 8);
            showMessage('Healed 8 HP!', 'success');
            return true;
        }
    },
    {
        id: 'heal_large', name: '🍾 Large Potion', description: 'Restore 15 HP', price: 30,
        buy: () => {
            if (game.health >= game.maxHealth) {
                showMessage('⚠️ HP is already full!', 'warning');
                return false;
            }
            game.health = Math.min(game.maxHealth, game.health + 15);
            showMessage('Healed 15 HP!', 'success');
            return true;
        }
    },
    {
        id: 'heal_full', name: '✨ Elixir', description: 'Restore to full HP', price: 50,
        buy: () => {
            if (game.health >= game.maxHealth) {
                showMessage('⚠️ HP is already full!', 'warning');
                return false;
            }
            game.health = game.maxHealth;
            showMessage('Fully healed!', 'success');
            return true;
        }
    },
    {
        id: 'max_health', name: '❤️ Heart Container', description: '+5 maximum HP', price: 35,
        buy: () => { game.maxHealth += 5; game.health += 5; showMessage('+5 Max HP!', 'success'); return true; }
    },
    {
        id: 'max_health_big', name: '❤️❤️ Large Heart', description: '+10 maximum HP', price: 60,
        buy: () => { game.maxHealth += 10; game.health += 10; showMessage('+10 Max HP!', 'success'); return true; }
    },
    {
        id: 'weapon_upgrade', name: '⚔️ Weapon Polish', description: 'Upgrade current weapon by +2', price: 40,
        buy: () => {
            if (game.equippedWeapon) {
                game.equippedWeapon.numValue += 2;
                showMessage('Weapon upgraded!', 'success');
                updateUI();
                return true;
            } else {
                showMessage('No weapon equipped!', 'danger');
                return false;
            }
        }
    },
    {
        id: 'weapon_big_upgrade', name: '⚔️⚔️ Master Forge', description: 'Upgrade current weapon by +5', price: 70,
        buy: () => {
            if (game.equippedWeapon) {
                game.equippedWeapon.numValue += 5;
                showMessage('Weapon greatly upgraded!', 'success');
                updateUI();
                return true;
            } else {
                showMessage('No weapon equipped!', 'danger');
                return false;
            }
        }
    },
    {
        id: 'common_relic', name: '⚪ Common Relic', description: 'Gain a random common relic', price: 25,
        buy: () => { giveRelicByRarity('common'); return true; }
    },
    {
        id: 'uncommon_relic', name: '🟢 Uncommon Relic', description: 'Gain a random uncommon relic', price: 50,
        buy: () => { giveRelicByRarity('uncommon'); return true; }
    },
    {
        id: 'rare_relic', name: '🔵 Rare Relic', description: 'Gain a random rare relic', price: 100,
        buy: () => { giveRelicByRarity('rare'); return true; }
    },
    {
        id: 'legendary_relic', name: '🟠 Legendary Relic', description: 'Gain a random legendary relic', price: 200,
        buy: () => { giveRelicByRarity('legendary'); return true; }
    },
    {
        id: 'repair_weapon', name: '🔧 Weapon Repair', description: 'Restore weapon durability to full', price: 25,
        buy: () => {
            if (game.equippedWeapon && game.equippedWeapon.durability < game.equippedWeapon.maxDurability) {
                game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                showMessage(` Weapon repaired! (${game.equippedWeapon.durability}/${game.equippedWeapon.maxDurability})`, 'success');
                updateUI();
                return true;
            } else if (!game.equippedWeapon) {
                showMessage('⚠️ Equip a weapon first!', 'danger');
                return false;
            } else {
                // Weapon at full durability: increase max durability by 1!
                game.equippedWeapon.maxDurability += 1;
                game.equippedWeapon.durability = game.equippedWeapon.maxDurability;
                showMessage(' Weapon reinforced! Max durability increased!', 'success');
                updateUI();
                return true;
            }
        }
    }
];

// Expose globally for codex.js
window.RELICS = RELICS;
window.SHOP_ITEMS = SHOP_ITEMS;
window.EVENTS = EVENTS;

// Log module load
