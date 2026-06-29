// ============================================
// CARD ART GENERATION — full deck manifest
// ============================================
// Cards in the game are anonymous (suit + numeric value). Art is keyed by
// TYPE + VALUE and shared across the two monster suits (♠/♣). Power scales with
// value, so the bestiary/loot scales too. 13 monsters + 9 weapons + 9 potions.
//
// id scheme: monster_<v> | weapon_<v> | potion_<v>  (v = numValue)
// The 3 approved samples map to monster_10, weapon_7, potion_5.

// Shared look (palette + medium) WITHOUT a fixed frame/composition — the rigid
// single arch + dead-centre subject made the original deck look too uniform
// (CARD-3). Frame now varies by TYPE and composition varies per CARD.
export const STYLE =
  'dark medieval dungeon-synth tarot illustration, hand-inked woodcut style, ' +
  'candlelit, muted earth/stone tones with deep blood-red accents, aged ' +
  'parchment background, painterly yet graphic, no text, no lettering, no numbers';

// CARD-3: per-type frame so a glance reads the type and the deck feels less same-y.
const FRAMES = {
  monster: 'inside a blood-red gothic arch with gargoyle-root motifs and twin guttering candles at the base',
  weapon:  'inside a gilded filigree arch with a crossed-blade crest and riveted iron corners',
  potion:  'inside a verdant apothecary arch wreathed in dried vines, herbs and hanging bottles',
};

// CARD-3: rotate the shot so subjects aren\'t all the same dead-centre portrait.
const COMPOSITIONS = [
  'dramatic low angle looking up at the subject',
  'tight menacing close-up filling the frame',
  'symmetrical centered portrait',
  'three-quarter view, subject turned slightly',
  'wide establishing shot, subject deeper in the scene',
  'dutch tilted angle, uneasy and off-kilter',
  'high angle looking down on the subject',
  'subject emerging from heavy shadow at the edge',
];

const ACCENT = { monster: '#8b3a3a', weapon: '#c9a961', potion: '#7a9b5a', boss: '#a32020' };

// Boss centerpieces. Two generic act guardians (act 1/2) reused for the
// procedural act bosses, plus one unique final boss per class (see
// data/adventures.js). id scheme: boss_act1 | boss_act2 | boss_<class>.
const BOSSES = {
  act1: 'a colossal crowned bone guardian assembled from a thousand fused skulls, cold blue grave-light pouring from its ribcage, barring a crypt gate',
  act2: 'a bloated drowned leviathan-knight draped in seaweed and barnacles, dark water streaming from rents in its rusted armor, looming in a flooded vault',
  scoundrel: 'a towering spectral warden bound in chains of golden coins and iron ledgers, hollow lantern-eyes, one hand pressed flat against a sealed vault door — the keeper that lets nothing leave with what it owes',
  knight: 'a fallen lord in cracked black plate fused with rusted shame, gripping a shattered oathblade, a broken crown sinking into his brow, head bowed under the weight of his betrayal',
  rogue: 'a pallid faceless figure cloaked in whispering pages of stolen secrets, countless iron keys hanging from its robes, a single pale finger raised to where its lips would be',
  dancer: 'a skeletal conductor in tattered opera finery raising a baton of bone, marionette strings of the restless dead fanning from its hands, mid-flourish in a danse macabre',
  berserker: 'a colossal muscled beast of scar tissue and living fire, fists like boulders, screaming mouths opening across its hide, an avatar of pure unfillable fury',
  priest: 'a cold monolithic dark-god idol of black stone with too many folded arms and a single weeping eye, ringed by guttering black candles, rot oozing from its seams',
};

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

// ============================================
// RELIC ICONS — small inventory-style art keyed by relic id (see
// public/src/js/data/game-data.js RELICS). Square, single object, woodcut.
// ============================================
const RELIC_ACCENT = { common: '#9a9a9a', uncommon: '#6bbf6b', rare: '#5aa0e0', legendary: '#e0913a' };
const RELIC_ART = {
  // common
  small_shield: ['a small round iron buckler shield', 'common'],
  bronze_ring: ['a plain bronze ring', 'common'],
  heal_charm: ['a green heart-shaped charm on a leather cord', 'common'],
  coin_pouch: ['a small leather coin pouch spilling gold coins', 'common'],
  lucky_penny: ['a single shining old copper penny', 'common'],
  leather_boots: ['a pair of worn leather boots', 'common'],
  bandage: ['a roll of cloth bandage with a single blood spot', 'common'],
  weak_thorns: ['a coiled length of thorny green bramble', 'common'],
  compass: ['an old brass compass, lid open', 'common'],
  dice: ['a pair of carved bone dice', 'common'],
  feather: ['a single pale grey feather', 'common'],
  candle: ['a lit wax candle in an iron holder', 'common'],
  rope: ['a neatly coiled hemp rope', 'common'],
  stone: ['a smooth grey river stone', 'common'],
  herb: ['a fresh sprig of green healing herb', 'common'],
  map: ['a partly unrolled parchment map', 'common'],
  gloves: ['a pair of worn leather gloves', 'common'],
  book: ['a thick leather-bound spellbook', 'common'],
  bell: ['a small brass hand bell', 'common'],
  key: ['an old iron skeleton key', 'common'],
  mirror_shard: ['a jagged shard of silvered mirror glass', 'common'],
  charm: ['a softly glowing golden amulet', 'common'],
  tooth: ['a large curved monster fang', 'common'],
  clover: ['a four-leaf clover', 'common'],
  lantern: ['a glowing iron storm lantern', 'common'],
  // uncommon
  silver_shield: ['a polished round silver shield', 'uncommon'],
  silver_ring: ['a silver ring set with a small gem', 'uncommon'],
  healer: ['a green healing amulet glowing softly', 'uncommon'],
  greedy: ['a small golden idol statue', 'uncommon'],
  vampire: ['a long curved vampire fang dripping blood', 'uncommon'],
  meditation: ['a balanced cairn of smooth meditation stones', 'uncommon'],
  armor: ['a riveted iron breastplate', 'uncommon'],
  boots: ['a pair of winged speed boots', 'uncommon'],
  gauntlet: ['a heavy iron power gauntlet, fist clenched', 'uncommon'],
  necklace: ['a holy beaded prayer necklace with a cross', 'uncommon'],
  crystal: ['a faceted glowing crystal', 'uncommon'],
  hourglass: ['an ornate hourglass running red sand', 'uncommon'],
  magnet: ['a horseshoe magnet drawing in coins', 'uncommon'],
  ring_fire: ['a ring wreathed in small flames', 'uncommon'],
  cloak: ['a hooded traveler\'s cloak', 'uncommon'],
  berserker_ring: ['a dark iron ring set with a blood-red rage gem', 'uncommon'],
  // rare
  gold_shield: ['an ornate golden tower shield', 'rare'],
  blade: ['an elegant slender sword caught mid-spin', 'rare'],
  lucky: ['a radiant four-leaf clover charm', 'rare'],
  warrior: ['a thunder gauntlet crackling with lightning', 'rare'],
  tank: ['a fortress-shaped suit of heavy plate armor', 'rare'],
  master_smith: ['a blacksmith\'s hammer resting on an anvil', 'rare'],
  crown: ['a jeweled golden crown', 'rare'],
  orb: ['a glowing magic crystal orb on a small stand', 'rare'],
  // legendary
  phoenix: ['a burning phoenix feather trailing embers', 'legendary'],
  durable_weapons: ['an eternal forge anvil glowing with molten runes', 'legendary'],
};

function build() {
  const out = [];
  for (const [v, subject] of Object.entries(MONSTERS))
    out.push({ id: `monster_${v}`, type: 'monster', value: +v, accent: ACCENT.monster, subject });
  for (const [v, subject] of Object.entries(WEAPONS))
    out.push({ id: `weapon_${v}`, type: 'weapon', value: +v, accent: ACCENT.weapon, subject });
  for (const [v, subject] of Object.entries(POTIONS))
    out.push({ id: `potion_${v}`, type: 'potion', value: +v, accent: ACCENT.potion, subject });
  for (const [key, subject] of Object.entries(BOSSES))
    out.push({ id: `boss_${key}`, type: 'boss', accent: ACCENT.boss, subject });
  for (const [id, [subject, rarity]] of Object.entries(RELIC_ART))
    out.push({ id: `relic_${id}`, type: 'relic', rarity, accent: RELIC_ACCENT[rarity], subject });
  return out;
}

export const CARDS = build();

// Stable composition pick per card (deterministic so re-runs match): hash the id.
const compFor = (card) => {
  const s = String(card.id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return COMPOSITIONS[h % COMPOSITIONS.length];
};

// Relic icons: a single object centred in a square, simple dark niche — reads
// at small inventory size, same palette/ink as the deck.
const RELIC_STYLE =
  'hand-inked woodcut game inventory icon, a single centered object, ' +
  'set in a shallow dark stone niche with soft candlelight from below, ' +
  'muted earth/stone tones, painterly yet graphic, plain dark background, ' +
  'no text, no lettering, no numbers, no border';

// Bosses keep an imposing full-frame treatment; deck cards get a per-type frame
// and a per-card composition (CARD-3 variety); relics are square icons.
export const promptFor = (card) => {
  if (card.type === 'boss')
    return `${STYLE}, ornate gothic arch frame with twin candles, imposing full-frame menacing boss filling the arch, dramatic scale, looming. Subject: ${card.subject}.`;
  if (card.type === 'relic')
    return `${RELIC_STYLE}. Subject: ${card.subject}.`;
  return `${STYLE}, ${FRAMES[card.type] || ''}, ${compFor(card)}. Subject: ${card.subject}.`;
};
