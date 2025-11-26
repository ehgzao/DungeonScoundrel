/**
 * ============================================
 * GAME DECK MODULE
 * ============================================
 * Deck creation, shuffling, and special cards
 * 
 * @module game-deck
 * @version 1.0.0
 * @author Gabriel Lima
 * 
 * Dependências:
 * - game (from game-state.js)
 * - SPECIAL_CARDS, LUCKY_DRAW (from game-constants.js)
 * - window.showMessage, window.playSound, window.createParticles,
 *   window.showDamageNumber, window.screenShake, window.updateUI,
 *   window.earnGold (exposed by game.js/helpers.js)
 */

// ============================================
// IMPORTS
// ============================================
import { game } from './game-state.js';
import { SPECIAL_CARDS, LUCKY_DRAW } from '../config/game-constants.js';

// ============================================
// SPECIAL CARDS DEFINITIONS
// ============================================
export const specialCards = [
    { 
        id: 'dodge', 
        name: '🛡️ Dodge', 
        description: 'Avoid next damage', 
        effect: () => { 
            game.dodgeActive = true; 
            window.showMessage('🛡️ Dodge active!', 'success'); 
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#4ecdc4', 20); 
        } 
    },
    { 
        id: 'double_damage', 
        name: '⚡ Power', 
        description: 'Weapon 2x stronger', 
        effect: () => { 
            game.doubleDamage = true; 
            window.showMessage('⚡ Power Strike!', 'success'); 
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 25); 
        } 
    },
    { 
        id: 'super_heal', 
        name: '💊 Super Potion', 
        description: 'Heal to full HP', 
        effect: () => { 
            const healed = game.maxHealth - game.health; 
            game.health = game.maxHealth; 
            window.showDamageNumber(healed, 'heal'); 
            window.showMessage('💊 HP Full!', 'success'); 
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#6bcf7f', 30); 
        } 
    },
    { 
        id: 'treasure', 
        name: '💰 Treasure', 
        description: '+5 Max HP', 
        effect: () => { 
            game.maxHealth += SPECIAL_CARDS.TREASURE_MAX_HP_BONUS; 
            game.health += SPECIAL_CARDS.TREASURE_MAX_HP_BONUS; 
            window.showDamageNumber('+5 MAX', 'heal'); 
            window.showMessage('💰 Max HP increased!', 'success'); 
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd700', 35); 
        } 
    },
    { 
        id: 'berserk_card', 
        name: '🔥 Berserk', 
        description: 'Next 3 attacks +5 damage', 
        effect: () => { 
            // Hourglass: +1 extra berserk turn
            game.berserkStacks = game.relics.some(r => r.id === 'hourglass') 
                ? SPECIAL_CARDS.BERSERK_HOURGLASS_STACKS 
                : SPECIAL_CARDS.BERSERK_DEFAULT_STACKS; 
            window.showMessage('🔥 BERSERK MODE! Next 3 attacks +5 damage!', 'success'); 
            window.playSound('special');
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 40);
            
            // Track berserk use for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.berserkUses = (lifetimeStats.berserkUses || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        } 
    },
    { 
        id: 'time_warp', 
        name: '⏰ Time Warp', 
        description: 'Draw 2 extra cards this room', 
        effect: () => {
            if (game.dungeon.length >= SPECIAL_CARDS.TIME_WARP_CARDS) {
                const extraCards = game.dungeon.splice(0, SPECIAL_CARDS.TIME_WARP_CARDS);
                game.room.push(...extraCards);
                window.showMessage('⏰ Time Warp! +2 cards drawn!', 'success');
                window.playSound('cardDraw');
                window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 30);
                window.updateUI();
                
                // Track time warp use for achievement
                const saved = localStorage.getItem('scoundrel_lifetime_stats');
                let lifetimeStats = saved ? JSON.parse(saved) : {};
                lifetimeStats.timeWarps = (lifetimeStats.timeWarps || 0) + 1;
                localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
            } else {
                window.showMessage('⏰ Time Warp! Not enough cards in deck!', 'warning');
            }
        } 
    },
    { 
        id: 'card_destroy', 
        name: '💥 Obliterate', 
        description: 'Remove a card permanently', 
        effect: () => {
            if (game.room.length > 0) {
                window.showMessage('💥 Choose a card to OBLITERATE (left-click)!', 'warning');
                game.obliterateMode = true;
                window.playSound('special');
                window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#a8edea', 35);
            } else {
                window.showMessage('💥 No cards to obliterate!', 'warning');
            }
        } 
    },
    { 
        id: 'gamble', 
        name: '🎰 Gamble', 
        description: '50% chance: +15 HP or -10 HP', 
        effect: () => {
            const win = Math.random() < 0.5;
            if (win) {
                const heal = Math.min(15, game.maxHealth - game.health);
                game.health = Math.min(game.maxHealth, game.health + 15);
                window.showDamageNumber(heal, 'heal');
                window.showMessage('🎰 JACKPOT! +15 HP!', 'success');
                window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#6bcf7f', 50);
            } else {
                game.health -= 10;
                window.showDamageNumber(10, 'damage');
                window.showMessage('🎰 Bad luck... -10 HP!', 'danger');
                window.screenShake();
                window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ff6b6b', 30);
            }
            window.playSound('special');
            window.updateUI();
            
            // Track gamble use for achievement
            const saved = localStorage.getItem('scoundrel_lifetime_stats');
            let lifetimeStats = saved ? JSON.parse(saved) : {};
            lifetimeStats.gambleCards = (lifetimeStats.gambleCards || 0) + 1;
            localStorage.setItem('scoundrel_lifetime_stats', JSON.stringify(lifetimeStats));
        } 
    },
    { 
        id: 'lucky_draw', 
        name: '🎲 Lucky Draw', 
        description: 'Draw 3 cards with favorable odds', 
        effect: () => {
            // BALANCED: Draw exactly 3 cards with controlled probabilities
            // 40% potion, 40% weapon, 20% monster (much better than random!)
            const drawnCards = [];
            const cardsToDraw = Math.min(3, game.dungeon.length);
            
            for (let i = 0; i < cardsToDraw; i++) {
                if (game.dungeon.length === 0) break;
                
                // Find cards by type in dungeon
                const potions = game.dungeon.filter(c => c.suitName === 'hearts');
                const weapons = game.dungeon.filter(c => c.suitName === 'diamonds');
                const monsters = game.dungeon.filter(c => c.suitName === 'clubs' || c.suitName === 'spades');
                
                let selectedCard = null;
                const roll = Math.random();
                
                // 40% chance for potion
                if (roll < LUCKY_DRAW.POTION_CHANCE && potions.length > 0) {
                    selectedCard = potions[Math.floor(Math.random() * potions.length)];
                }
                // 40% chance for weapon (cumulative 0.40-0.80)
                else if (roll < LUCKY_DRAW.WEAPON_CHANCE && weapons.length > 0) {
                    selectedCard = weapons[Math.floor(Math.random() * weapons.length)];
                }
                // 20% chance for monster OR fallback if preferred types unavailable
                else if (monsters.length > 0) {
                    selectedCard = monsters[Math.floor(Math.random() * monsters.length)];
                }
                // Fallback: draw any card if specific type unavailable
                else {
                    selectedCard = game.dungeon[Math.floor(Math.random() * game.dungeon.length)];
                }
                
                if (selectedCard) {
                    const index = game.dungeon.indexOf(selectedCard);
                    game.dungeon.splice(index, 1);
                    drawnCards.push(selectedCard);
                }
            }
            
            game.room.push(...drawnCards);
            
            const weaponCount = drawnCards.filter(c => c.suitName === 'diamonds').length;
            const potionCount = drawnCards.filter(c => c.suitName === 'hearts').length;
            
            window.showMessage(`🎲 Lucky Draw! Drew ${drawnCards.length} cards (${weaponCount}⚔️ ${potionCount}❤️)`, 'success');
            window.earnGold(5);
            
            window.playSound('cardDraw');
            window.createParticles(window.innerWidth / 2, window.innerHeight / 2, '#ffd93d', 25);
            window.updateUI();
        } 
    }
];

// ============================================
// DECK FUNCTIONS
// ============================================

/**
 * Shuffle deck using Fisher-Yates algorithm
 * @param {Array} deck - Deck to shuffle
 * @returns {Array} Shuffled deck
 */
export function shuffleDeck(deck) {
    let shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Balance deck for Easy mode (first 10 rooms)
 * 70% weak monsters, 70% mid-range weapons
 * @param {Array} deck - Deck to balance
 * @returns {Array} Balanced deck
 */
export function balanceEasyModeDeck(deck) {
    let balanced = [...deck];
    
    // Find all monsters and weapons
    const monsters = balanced.filter(c => c.suitName === 'clubs' || c.suitName === 'spades');
    const weapons = balanced.filter(c => c.suitName === 'diamonds');
    
    // Balance monsters: 70% should be <5 damage
    const targetLowMonsters = Math.floor(monsters.length * 0.70);
    const lowMonsters = monsters.filter(c => c.numValue < 5);
    const highMonsters = monsters.filter(c => c.numValue >= 5);
    
    if (lowMonsters.length < targetLowMonsters && highMonsters.length > 0) {
        const toReplace = Math.min(targetLowMonsters - lowMonsters.length, highMonsters.length);
        for (let i = 0; i < toReplace; i++) {
            const highMonster = highMonsters[i];
            const index = balanced.indexOf(highMonster);
            const newValue = [2, 3, 4][Math.floor(Math.random() * 3)];
            balanced[index] = {
                ...highMonster,
                value: newValue.toString(),
                numValue: newValue
            };
        }
    }
    
    // Balance weapons: 70% should be 4-8 damage
    const targetMidWeapons = Math.floor(weapons.length * 0.70);
    const midWeapons = weapons.filter(c => c.numValue >= 4 && c.numValue <= 8);
    const offWeapons = weapons.filter(c => c.numValue < 4 || c.numValue > 8);
    
    if (midWeapons.length < targetMidWeapons && offWeapons.length > 0) {
        const toReplace = Math.min(targetMidWeapons - midWeapons.length, offWeapons.length);
        for (let i = 0; i < toReplace; i++) {
            const offWeapon = offWeapons[i];
            const index = balanced.indexOf(offWeapon);
            const newValue = [4, 5, 6, 7, 8][Math.floor(Math.random() * 5)];
            balanced[index] = {
                ...offWeapon,
                value: newValue.toString(),
                numValue: newValue
            };
        }
    }
    
    return balanced;
}

/**
 * Create a new deck with all card types
 * @returns {Array} New shuffled deck
 */
export function createDeck() {
    let deck = [];
    
    // SCOUNDREL ORIGINAL RULES:
    // Remove: Jokers, Red Face Cards (J♥,Q♥,K♥,J♦,Q♦,K♦), Red Aces (A♥,A♦)
    
    // 26 MONSTERS (♠ Spades + ♣ Clubs): A(14), 2-10, J(11), Q(12), K(13)
    const monsterSuits = [
        { suit: '♠', suitName: 'spades' },
        { suit: '♣', suitName: 'clubs' }
    ];
    const monsterValues = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const monsterNumValues = [14, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    
    for (let suit of monsterSuits) {
        for (let i = 0; i < monsterValues.length; i++) {
            deck.push({ 
                value: monsterValues[i], 
                suit: suit.suit, 
                numValue: monsterNumValues[i], 
                suitName: suit.suitName 
            });
        }
    }
    
    // 9 WEAPONS (♦ Diamonds): 2-10 only (NO face cards, NO Ace)
    const weaponValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const weaponNumValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    for (let i = 0; i < weaponValues.length; i++) {
        deck.push({ 
            value: weaponValues[i], 
            suit: '♦', 
            numValue: weaponNumValues[i], 
            suitName: 'diamonds' 
        });
    }
    
    // 9 POTIONS (♥ Hearts): 2-10 only (NO face cards, NO Ace)
    const potionValues = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
    const potionNumValues = [2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    for (let i = 0; i < potionValues.length; i++) {
        deck.push({ 
            value: potionValues[i], 
            suit: '♥', 
            numValue: potionNumValues[i], 
            suitName: 'hearts' 
        });
    }
    
    // SPECIAL CARDS (our addition for gamification)
    // Base: 6 special cards (deck = 50 cards total)
    let specialCount = 6;
    
    // Old Book: +10% more special cards (+1)
    if (game.relics.some(r => r.id === 'book')) specialCount += 1;
    
    // Magic Orb: +100% special cards (2x = +6)
    if (game.relics.some(r => r.id === 'orb')) specialCount += 6;
    
    for (let i = 0; i < specialCount; i++) {
        deck.push({ 
            value: '✨', 
            suit: '', 
            numValue: 0, 
            suitName: 'special', 
            special: specialCards[Math.floor(Math.random() * specialCards.length)] 
        });
    }
    
    // TOTAL: 26 monsters + 9 weapons + 9 potions + 6 specials = 50 cards
    let finalDeck = shuffleDeck(deck);
    
    // EASY MODE BALANCING: First 10 rooms should be beginner-friendly
    if (game.difficulty === 'easy' && game.stats.roomsCleared < 10) {
        finalDeck = balanceEasyModeDeck(finalDeck);
    }
    
    return finalDeck;
}

// ============================================
// GLOBAL EXPOSURE (for compatibility)
// ============================================
window.specialCards = specialCards;
window.createDeck = createDeck;
window.shuffleDeck = shuffleDeck;
window.balanceEasyModeDeck = balanceEasyModeDeck;
