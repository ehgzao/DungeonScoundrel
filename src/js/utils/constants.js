/**
 * Game Constants
 * All game constants, enums, and configuration values
 */

// Card suits with colors and symbols
export const SUITS = {
    hearts: { name: 'Hearts', symbol: '♥', color: '#e74c3c' },
    diamonds: { name: 'Diamonds', symbol: '♦', color: '#e74c3c' },
    clubs: { name: 'Clubs', symbol: '♣', color: '#2c3e50' },
    spades: { name: 'Spades', symbol: '♠', color: '#2c3e50' }
};

// Card values
export const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Special card types
export const SPECIAL_CARDS = {
    JOKER: 'joker',
    DODGE: 'dodge',
    POWER: 'power',
    POTION: 'potion',
    SUPER_POTION: 'super_potion',
    TREASURE: 'treasure',
    CURSE: 'curse',
    BERSERK: 'berserk',
    TIME_WARP: 'time_warp',
    LUCKY_DRAW: 'lucky_draw',
    MIRROR_SHIELD: 'mirror_shield',
    GAMBLE: 'gamble'
};

// Difficulty settings
export const DIFFICULTIES = {
    easy: {
        name: 'Easy',
        emoji: '🟢',
        description: 'For beginners',
        deckSize: 50,
        startingHealth: 15,
        startingGold: 15,
        hasUndo: true,
        avoidPenalty: 2
    },
    normal: {
        name: 'Normal',
        emoji: '🟡',
        description: 'Balanced challenge',
        deckSize: 50,
        startingHealth: 15,
        startingGold: 10,
        hasUndo: true,
        avoidPenalty: 3
    },
    hard: {
        name: 'Hard',
        emoji: '🔴',
        description: 'For veterans',
        deckSize: 50,
        startingHealth: 10,
        startingGold: 5,
        hasUndo: false,
        avoidPenalty: 5
    },
    endless: {
        name: 'Endless',
        emoji: '♾️',
        description: 'Survive as long as you can',
        deckSize: 50,
        startingHealth: 15,
        startingGold: 10,
        hasUndo: false,
        avoidPenalty: 3,
        reloadDeckOnEmpty: true
    }
};

// Achievement tiers
export const ACHIEVEMENT_TIERS = {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    PLATINUM: 'platinum'
};

// Achievement tier colors
export const ACHIEVEMENT_COLORS = {
    bronze: '#cd7f32',
    silver: '#c0c0c0',
    gold: '#ffd700',
    platinum: '#e5e4e2'
};

// Achievement tier icons
export const ACHIEVEMENT_ICONS = {
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎'
};

// Relic rarities
export const RELIC_RARITIES = {
    COMMON: 'common',
    UNCOMMON: 'uncommon',
    RARE: 'rare',
    LEGENDARY: 'legendary'
};

// Relic rarity colors
export const RELIC_COLORS = {
    common: '#aaa',
    uncommon: '#6bcf7f',
    rare: '#4a9eff',
    legendary: '#ff9800'
};

// Relic rarity icons
export const RELIC_ICONS = {
    common: '⚪',
    uncommon: '🟢',
    rare: '🔵',
    legendary: '🟠'
};

// Player classes
export const CLASSES = {
    scoundrel: {
        name: 'Scoundrel',
        emoji: '🗡️',
        description: 'A cunning thief',
        startingWeapon: null,
        baseHealth: 15,
        baseDamage: 0,
        ability: 'Lucky Draw',
        abilityDescription: 'Draw 3 cards, pick 1 (Cooldown: 5 rooms)',
        abilityCooldown: 5
    },
    knight: {
        name: 'Knight',
        emoji: '🛡️',
        description: 'A noble warrior',
        startingWeapon: { name: 'Rusty Sword', damage: 2 },
        baseHealth: 20,
        baseDamage: 2,
        ability: 'Shield Bash',
        abilityDescription: 'Negate next damage + Deal 3 (Cooldown: 4 rooms)',
        abilityCooldown: 4
    },
    mage: {
        name: 'Mage',
        emoji: '🔮',
        description: 'A mystical spellcaster',
        startingWeapon: { name: 'Magic Wand', damage: 1 },
        baseHealth: 12,
        baseDamage: 1,
        ability: 'Arcane Surge',
        abilityDescription: 'All cards = Damage this room (Cooldown: 6 rooms)',
        abilityCooldown: 6
    },
    ranger: {
        name: 'Ranger',
        emoji: '🏹',
        description: 'A skilled archer',
        startingWeapon: { name: 'Short Bow', damage: 1 },
        baseHealth: 14,
        baseDamage: 1,
        ability: 'Quick Shot',
        abilityDescription: 'Deal 5 damage instantly (Cooldown: 3 rooms)',
        abilityCooldown: 3
    },
    berserker: {
        name: 'Berserker',
        emoji: '⚔️',
        description: 'A raging warrior',
        startingWeapon: { name: 'Battle Axe', damage: 3 },
        baseHealth: 18,
        baseDamage: 3,
        ability: 'Blood Rage',
        abilityDescription: 'Take 2 damage, +5 damage next attack (Cooldown: 4 rooms)',
        abilityCooldown: 4
    }
};

// Storage keys
export const STORAGE_KEYS = {
    GAME_STATE: 'dungeon_scoundrel_game_state',
    PERMANENT_UNLOCKS: 'dungeon_scoundrel_permanent_unlocks',
    LIFETIME_STATS: 'scoundrel_lifetime_stats',
    ACHIEVEMENTS: 'dungeon_scoundrel_achievements',
    LEADERBOARD: 'scoundrel_leaderboard',
    SETTINGS: 'dungeon_scoundrel_settings',
    MUSIC_VOLUME: 'dungeon_scoundrel_music_volume'
};

// Game version
export const VERSION = '1.3.2';

// Firebase config
export const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDKUBsRGT18VJVlsVIPvmPqCmBL-hQTzLE",
    authDomain: "dungeon-scoundrel.firebaseapp.com",
    projectId: "dungeon-scoundrel",
    storageBucket: "dungeon-scoundrel.firebasestorage.app",
    messagingSenderId: "679688032348",
    appId: "1:679688032348:web:7a39b32af6cef0fa5a3d9a"
};

// Music tracks
export const MUSIC_TRACKS = {
    MENU: [
        { name: 'Dark Dungeon Ambience', file: 'assets/music/dark-dungeon-ambience.mp3' },
        { name: 'Medieval Tavern', file: 'assets/music/medieval-tavern.mp3' },
        { name: 'Mysterious Castle', file: 'assets/music/mysterious-castle.mp3' }
    ],
    GAMEPLAY: [
        { name: 'Epic Battle', file: 'assets/music/epic-battle.mp3' },
        { name: 'Dungeon Exploration', file: 'assets/music/dungeon-exploration.mp3' },
        { name: 'Tension Rising', file: 'assets/music/tension-rising.mp3' }
    ],
    SHOP: [
        { name: 'Merchant Theme', file: 'assets/music/merchant-theme.mp3' }
    ],
    VICTORY: [
        { name: 'Victory Fanfare', file: 'assets/music/victory-fanfare.mp3' }
    ],
    DEFEAT: [
        { name: 'Defeat Theme', file: 'assets/music/defeat-theme.mp3' }
    ]
};

// Sound effects
export const SOUND_EFFECTS = {
    CARD_DRAW: 'assets/sounds/card-draw.mp3',
    CARD_FLIP: 'assets/sounds/card-flip.mp3',
    HIT: 'assets/sounds/hit.mp3',
    HEAL: 'assets/sounds/heal.mp3',
    GOLD: 'assets/sounds/gold.mp3',
    ERROR: 'assets/sounds/error.mp3',
    SPECIAL: 'assets/sounds/special.mp3'
};

// UI Messages
export const MESSAGES = {
    DUNGEON_EMPTY: 'Dungeon Empty. Use controls above.',
    GAME_OVER_DEFEAT: 'Defeated...',
    GAME_OVER_VICTORY: 'Victory!',
    INSUFFICIENT_GOLD: 'Not enough gold!',
    ACHIEVEMENT_UNLOCKED: 'Achievement Unlocked!'
};

// Game limits
export const LIMITS = {
    MAX_HEALTH: 999,
    MAX_GOLD: 9999,
    MAX_COMBO: 100,
    MAX_RELICS: 10,
    LEADERBOARD_SIZE: 10
};
