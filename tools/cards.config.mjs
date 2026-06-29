// ============================================
// CARD ART GENERATION — config / manifest
// ============================================
// Offline/build-time only. Lists the cards to generate and the prompt for each.
// Start with these 3 samples to compare providers cheaply, then expand to the
// full deck (13 values x 4 suits + bosses/relics).

// Shared style preamble — keep IDENTICAL across cards for a cohesive deck.
export const STYLE =
  'dark medieval dungeon-synth tarot illustration, hand-inked woodcut style, ' +
  'candlelit, muted earth/stone tones with deep blood-red accents, aged ' +
  'parchment background, ornate but restrained, a single centered subject, ' +
  'symmetrical, painterly yet graphic, no text, no lettering, no frame, no border';

// accent = frame accent color reused by the SVG compositor (matches game tokens)
export const CARDS = [
  {
    id: 'monster_bone_knight',
    name: 'BONE KNIGHT', value: '10', suit: '♠', type: 'MONSTER', accent: '#8b3a3a',
    flavor: 'A hollow warrior, bound by old curses.',
    subject: 'a gaunt skeletal knight in rusted armor holding a notched sword, empty eye sockets glowing faint red',
  },
  {
    id: 'weapon_iron_blade',
    name: 'IRON BLADE', value: '7', suit: '♦', type: 'WEAPON', accent: '#c9a961',
    flavor: 'Notched steel, thirsty for the deep.',
    subject: 'a worn iron longsword planted point-down into cracked stone, faint runes on the blade',
  },
  {
    id: 'potion_crimson_draught',
    name: 'CRIMSON DRAUGHT', value: '5', suit: '♥', type: 'POTION', accent: '#7a9b5a',
    flavor: 'Bitter herbs over warm copper.',
    subject: 'a glass vial of glowing crimson liquid stoppered with cork, dried herbs tied around the neck',
  },
];

export const promptFor = (card) => `${STYLE}. Subject: ${card.subject}.`;
