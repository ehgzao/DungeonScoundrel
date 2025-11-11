/**
 * ============================================
 * GAME CONSTANTS
 * ============================================
 * Centralized configuration for all game mechanics.
 * All magic numbers and hardcoded values should be defined here.
 * 
 * @module GameConstants
 * @version 1.5.0
 */

// ============================================
// HEALTH & DAMAGE
// ============================================
export const HEALTH = {
    /** Default starting health */
    DEFAULT_START: 20,
    /** Default maximum health */
    DEFAULT_MAX: 20,
    /** HP threshold for critical warning */
    CRITICAL_THRESHOLD: 5,
    /** HP for "Iron Will" achievement (win with exactly 1 HP) */
    IRON_WILL_HP: 1
};

// ============================================
// GOLD & ECONOMY
// ============================================
export const GOLD = {
    /** Default starting gold */
    DEFAULT_START: 0,
    /** Shop price increase multiplier per purchase */
    SHOP_PRICE_MULTIPLIER: 1.08,
    /** Initial shop price multiplier */
    INITIAL_MULTIPLIER: 1.0
};

// ============================================
// CARDS & DECK
// ============================================
export const CARDS = {
    /** Number of cards to draw per room (default) */
    DEFAULT_DRAW_COUNT: 4,
    /** Number of cards to avoid (discard) when using Avoid */
    AVOID_COST: 3,
    /** Maximum cards that can be held (base) */
    DEFAULT_HOLD_CAPACITY: 1,
    /** Rogue class hold capacity */
    ROGUE_HOLD_CAPACITY: 2,
    /** Feather relic bonus hold slots */
    FEATHER_BONUS_SLOTS: 1
};

// ============================================
// COMBO SYSTEM
// ============================================
export const COMBO = {
    /** Minimum combo for visual effects */
    MIN_VISUAL_COMBO: 3,
    /** Combo required for "Perfect Run" achievement */
    PERFECT_RUN_COMBO: 10,
    /** Combo God permanent unlock starting combo */
    COMBO_GOD_START: 2,
    /** Combo Master permanent unlock starting combo */
    COMBO_MASTER_START: 1
};

// ============================================
// BOSS SYSTEM
// ============================================
export const BOSS = {
    /** Room number for first miniboss */
    MINIBOSS_1_ROOM: 15,
    /** Room number for second miniboss */
    MINIBOSS_2_ROOM: 25,
    /** Final boss number identifier */
    FINAL_BOSS_NUMBER: 99
};

// ============================================
// DIFFICULTY SCALING
// ============================================
export const DIFFICULTY = {
    /** Easy mode: Beginner help for first N rooms */
    EASY_BEGINNER_ROOMS: 5,
    /** Easy mode: Deck balancing for first N rooms */
    EASY_BALANCE_ROOMS: 10,
    /** Endless mode: Max difficulty scaling multiplier */
    ENDLESS_MAX_SCALING: 2.0,
    /** Endless mode: Scaling increment per level */
    ENDLESS_SCALING_INCREMENT: 0.15
};

// ============================================
// EVENTS & RANDOM
// ============================================
export const EVENT_CONFIG = {
    /** Base event chance (percentage) */
    BASE_CHANCE: 0.15,
    /** Easy mode event chance reduction */
    EASY_REDUCTION: 0.05,
    /** Hard mode event chance increase */
    HARD_INCREASE: 0.05,
    /** Compass relic event chance bonus */
    COMPASS_BONUS: 0.10,
    /** Event trigger delay (ms) */
    TRIGGER_DELAY: 800
};

// ============================================
// POTIONS
// ============================================
export const POTIONS = {
    /** Default maximum potions usable per room */
    DEFAULT_MAX_PER_ROOM: 1,
    /** Dancer class: maximum potions usable per room */
    DANCER_MAX_PER_ROOM: 2,
    /** Potion Mastery relic: max potions per room */
    MASTERY_MAX: 3
};

// ============================================
// RELICS
// ============================================
export const RELICS = {
    /** Maximum relics a player can have */
    MAX_RELICS: 10,
    /** Four Leaf Clover: consecutive avoid limit */
    CLOVER_AVOID_LIMIT: 2
};

// ============================================
// ACHIEVEMENTS
// ============================================
export const ACHIEVEMENTS = {
    /** Rooms required for "Perfect Run" */
    PERFECT_RUN_ROOMS: 10,
    /** Total achievements in game */
    TOTAL_COUNT: 50
};

// ============================================
// UI & ANIMATIONS
// ============================================
export const UI = {
    /** Particle count for room clear */
    ROOM_CLEAR_PARTICLES: 40,
    /** Particle count for secondary effects */
    SECONDARY_PARTICLES: 30,
    /** Message z-index (above modals) */
    MESSAGE_Z_INDEX: 10001,
    /** Modal z-index range */
    MODAL_Z_INDEX_MIN: 1000,
    MODAL_Z_INDEX_MAX: 10000
};

// ============================================
// TIMING
// ============================================
export const TIMING = {
    /** Delay before triggering events (ms) */
    EVENT_DELAY: 800,
    /** Particle animation delay 1 (ms) */
    PARTICLE_DELAY_1: 150,
    /** Particle animation delay 2 (ms) */
    PARTICLE_DELAY_2: 300,
    /** Message display duration - danger (ms) */
    MESSAGE_DANGER_DURATION: 4000,
    /** Message display duration - success (ms) */
    MESSAGE_SUCCESS_DURATION: 3000,
    /** Message display duration - info (ms) */
    MESSAGE_INFO_DURATION: 2000
};

// ============================================
// SHOP ITEMS (Prices)
// ============================================
export const SHOP_PRICES = {
    HEAL_SMALL: 18,
    HEAL_LARGE: 30,
    HEAL_FULL: 50,
    MAX_HEALTH: 35,
    MAX_HEALTH_BIG: 60,
    WEAPON_UPGRADE: 40,
    WEAPON_BIG_UPGRADE: 70,
    COMMON_RELIC: 25,
    RARE_RELIC: 50,
    EPIC_RELIC: 100,
    REPAIR_WEAPON: 25,
    EXTRA_GOLD: 15
};

// ============================================
// SHOP ITEMS (Values)
// ============================================
export const SHOP_VALUES = {
    HEAL_SMALL: 8,
    HEAL_LARGE: 15,
    MAX_HEALTH: 5,
    MAX_HEALTH_BIG: 10,
    WEAPON_UPGRADE: 2,
    WEAPON_BIG_UPGRADE: 5,
    EXTRA_GOLD: 20
};

// ============================================
// CLASS ABILITIES
// ============================================
export const CLASS_COOLDOWNS = {
    /** Warrior ability cooldown (Shield Bash) */
    WARRIOR: 3,
    /** Rogue ability cooldown (Shadow Strike) */
    ROGUE: 4,
    /** Dancer ability cooldown (Healing Dance) */
    DANCER: 5,
    /** Berserker ability cooldown (Rage Strike) */
    BERSERKER: 4
};

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
export const KEYS = {
    DRAW: 'd',
    AVOID: 'a',
    ABILITY: 'q',
    UNDO: 'u',
    SHOP: 's',
    ESCAPE: 'Escape',
    CARD_1: '1',
    CARD_2: '2',
    CARD_3: '3',
    CARD_4: '4',
    CARD_5: '5'
};

// ============================================
// STORAGE KEYS
// ============================================
export const STORAGE_KEYS = {
    TUTORIAL_COMPLETED: 'dungeon_scoundrel_tutorial_completed',
    TUTORIAL_SKIPPED: 'dungeon_scoundrel_tutorial_skipped',
    PLAYED_BEFORE: 'dungeon_scoundrel_played_before',
    PERMANENT_STATS: 'scoundrel_permanent_stats',
    LIFETIME_STATS: 'scoundrel_lifetime_stats',
    PERMANENT_UNLOCKS: 'scoundrel_permanent_unlocks',
    ACHIEVEMENTS: 'scoundrel_achievements',
    SETTINGS: 'scoundrel_settings'
};

// ============================================
// GAME MODES
// ============================================
export const GAME_MODES = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard',
    ENDLESS: 'endless'
};

// ============================================
// CARD TYPES
// ============================================
export const CARD_TYPES = {
    MONSTER: 'monster',
    WEAPON: 'weapon',
    POTION: 'potion',
    SPECIAL: 'special'
};

// ============================================
// SUITS
// ============================================
export const SUITS = {
    CLUBS: 'clubs',
    SPADES: 'spades',
    HEARTS: 'hearts',
    DIAMONDS: 'diamonds'
};

// ============================================
// LOG TYPES
// ============================================
export const LOG_TYPES = {
    INFO: 'info',
    DAMAGE: 'damage',
    HEAL: 'heal',
    EQUIP: 'equip',
    DANGER: 'danger',
    SUCCESS: 'success'
};

// ============================================
// MESSAGE TYPES
// ============================================
export const MESSAGE_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    DANGER: 'danger',
    WARNING: 'warning',
    ERROR: 'error'
};

// ============================================
// EXPORT ALL
// ============================================
export default {
    HEALTH,
    GOLD,
    CARDS,
    COMBO,
    BOSS,
    DIFFICULTY,
    EVENTS,
    POTIONS,
    RELICS,
    ACHIEVEMENTS,
    UI,
    TIMING,
    SHOP_PRICES,
    SHOP_VALUES,
    CLASS_COOLDOWNS,
    KEYS,
    STORAGE_KEYS,
    GAME_MODES,
    CARD_TYPES,
    SUITS,
    LOG_TYPES,
    MESSAGE_TYPES
};
