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

// Bosses keep an imposing full-frame treatment; deck cards get a per-type frame
// and a per-card composition (CARD-3 variety).
export const promptFor = (card) =>
  card.type === 'boss'
    ? `${STYLE}, ornate gothic arch frame with twin candles, imposing full-frame menacing boss filling the arch, dramatic scale, looming. Subject: ${card.subject}.`
    : `${STYLE}, ${FRAMES[card.type] || ''}, ${compFor(card)}. Subject: ${card.subject}.`;
