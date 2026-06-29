/* ============================================
   ADVENTURE MODE — per-class narrative & endgame
   Each hero descends for their OWN reason, and each faces a different final
   boss + ending tied to that motivation. Acts are shared; the finale is not.
   ============================================ */

// Shared act structure (the descent). Per-class flavor is layered on top.
export const ACTS = [
    { id: 1, name: 'The Upper Crypts', theme: 'Cold halls and restless bone.' },
    { id: 2, name: 'The Sunken Halls', theme: 'Flooded vaults where the drowned remember.' },
    { id: 3, name: 'The Black Heart', theme: 'Where the dungeon dreams, and waits.' },
];

// Per-class endgame. motivation echoes the class card; finalBoss is the unique
// terminal encounter; ending is shown on victory.
export const ADVENTURES = {
    scoundrel: {
        motivation: 'No honor, no glory — only out, alive, and richer than I came.',
        opening: 'You never wanted to be a hero. You wanted the vault. The door shut behind you anyway.',
        finalBoss: { name: 'The Warden of Debts', flavor: 'The keeper that lets nothing leave with what it owes.' },
        ending: 'No banners, no songs. Just daylight on your face and a heavy purse. You step over the threshold and never look back. That is its own kind of victory.',
    },
    knight: {
        motivation: 'Honor and steel — to fulfill the oath that dragged me down here.',
        opening: 'An oath sworn over a dying king. The trail of that broken promise leads down, always down.',
        finalBoss: { name: 'The Oathbreaker', flavor: 'A lord who chose the dark over his word, now armored in shame.' },
        ending: 'You lower your blade to the broken lord and speak the oath aloud. The shame burns away to ash. Honor is not winning — it is keeping faith when it costs everything.',
    },
    rogue: {
        motivation: 'In shadow and cunning — to steal the one prize no thief has ever taken.',
        opening: 'Every lock in the world has been picked but one. It sits at the bottom of this dark. You intend to be the first.',
        finalBoss: { name: 'The Pale Spymaster', flavor: 'Keeper of every secret the dungeon ever swallowed.' },
        ending: 'You slip the prize into your coat between one heartbeat and the next. The Spymaster never sees the hand that takes it. You were never here. You were never anywhere.',
    },
    dancer: {
        motivation: 'Grace in motion — to dance with death itself and walk away.',
        opening: 'They said no one dances past the dark. You came to prove the dark wrong, one step at a time.',
        finalBoss: { name: 'The Hollow Maestro', flavor: 'Conductor of the danse macabre, baton of bone.' },
        ending: 'You match the Maestro measure for measure until the music itself falters. The danse macabre ends, and you are still moving. Life, it turns out, just dances longer.',
    },
    berserker: {
        motivation: 'Through pain, power — to feed the fury something big enough to fill it.',
        opening: 'The rage never sleeps. You came down here looking for something worthy of it.',
        finalBoss: { name: 'Wrath Incarnate', flavor: 'A beast that grows fat on every scream above and below.' },
        ending: 'You and the beast tear at each other until only one storm remains — and it wears your face. The fury did not break you. You became the thing it feared.',
    },
    priest: {
        motivation: 'The light guides me — to purify the rot at the root of this place.',
        opening: 'The corruption has a source, a heart still beating in the black. You were sent to still it.',
        finalBoss: { name: 'The Profane Idol', flavor: 'The cold god the dungeon prays to in the dark.' },
        ending: 'You press your light against the idol until the dark has nowhere left to hide. The rot recoils, withers, is clean. The dungeon will dream again — but not of this.',
    },
};

export function adventureFor(playerClass) {
    return ADVENTURES[playerClass] || ADVENTURES.scoundrel;
}
