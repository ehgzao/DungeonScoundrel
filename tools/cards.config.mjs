// ============================================
// CARD ART GENERATION — full deck manifest
// ============================================
// Cards in the game are anonymous (suit + numeric value). Art is keyed by
// TYPE + VALUE and shared across the two monster suits (♠/♣). Power scales with
// value, so the bestiary/loot scales too. 13 monsters + 9 weapons + 9 potions.
//
// id scheme: monster_<v> | weapon_<v> | potion_<v>  (v = numValue)
// The 3 approved samples map to monster_10, weapon_7, potion_5.

export const STYLE =
  'dark medieval dungeon-synth tarot illustration, hand-inked woodcut style, ' +
  'candlelit, muted earth/stone tones with deep blood-red accents, aged ' +
  'parchment background, ornate gothic arch frame with twin candles and ' +
  'gargoyle-root motifs at the base, a single centered subject, symmetrical, ' +
  'painterly yet graphic, no text, no lettering, no numbers';

const ACCENT = { monster: '#8b3a3a', weapon: '#c9a961', potion: '#7a9b5a' };

// monster bestiary by power (numValue). A=14 strongest ... 2 weakest.
const MONSTERS = {
  14: 'an ancient horned dragon coiled around a ruined altar, smoke and embers',
  13: 'a crowned lich king wreathed in cold flame, skeletal hands raised',
  12: 'a pale vampire queen in tattered royal gown, bats circling',
  11: 'a black-armored death knight with a greatsword wreathed in shadow',
  10: 'a gaunt skeletal knight in rusted armor holding a notched sword, empty eye sockets glowing faint red',
  9: 'a hulking armored ogre with a spiked club, chained and scarred',
  8: 'a hooded wraith of torn cloth and smoke with hollow glowing eyes',
  7: 'a rotting ghoul crawling from broken flagstones, claws bared',
  6: 'a giant cave spider with glinting eyes over a web-choked archway',
  5: 'a skeleton warrior with cracked shield and rusted blade',
  4: 'a swarm of leathery cave bats spiralling from the dark',
  3: 'a mangy giant rat baring yellow teeth among bones',
  2: 'a small crawling severed hand scuttling over cracked stone',
};

const WEAPONS = {
  2: 'a rusty notched dagger driven into cracked stone',
  3: 'a crude bearded hand axe resting on a stone block',
  4: 'a plain short sword planted point-down in rubble',
  5: 'a heavy iron flanged mace leaning on an altar',
  6: 'a double-bladed battle axe embedded in a stump',
  7: 'a worn iron longsword planted point-down into cracked stone, faint runes on the blade',
  8: 'a massive two-handed war hammer head resting on stone',
  9: 'a long steel halberd standing against a gothic pillar',
  10: 'an ornate greatsword raised on a stone pedestal, runes aglow',
};

const POTIONS = {
  2: 'a tiny chipped vial of dim red liquid, cork stopper',
  3: 'a small round flask of glowing rose liquid tied with twine',
  4: 'a stoppered bottle of herbal draught with dried leaves',
  5: 'a glass vial of glowing crimson liquid stoppered with cork, dried herbs tied around the neck',
  6: 'a faceted bottle of luminous deep-red elixir on stone',
  7: 'a tall apothecary bottle of warm amber-red tonic, wax seal',
  8: 'a large bulbous flask of bubbling scarlet brew',
  9: 'an ornate footed chalice brimming with glowing blood-red liquid',
  10: 'a grand sealed decanter of radiant crimson elixir, gold filigree',
};

function build() {
  const out = [];
  for (const [v, subject] of Object.entries(MONSTERS))
    out.push({ id: `monster_${v}`, type: 'monster', value: +v, accent: ACCENT.monster, subject });
  for (const [v, subject] of Object.entries(WEAPONS))
    out.push({ id: `weapon_${v}`, type: 'weapon', value: +v, accent: ACCENT.weapon, subject });
  for (const [v, subject] of Object.entries(POTIONS))
    out.push({ id: `potion_${v}`, type: 'potion', value: +v, accent: ACCENT.potion, subject });
  return out;
}

export const CARDS = build();
export const promptFor = (card) => `${STYLE}. Subject: ${card.subject}.`;
