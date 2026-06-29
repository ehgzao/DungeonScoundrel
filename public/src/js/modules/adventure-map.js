/* ============================================
   ADVENTURE MODE — procedural map (Slay-the-Spire style)
   Generates a fresh branching map per run with balance guarantees so a run is
   never impossible: a campfire row before every boss, at least one shop per
   act, difficulty that scales with depth (not random spikes), capped elites,
   and a guaranteed fully-connected path to the finale. Each class ends at its
   own final boss (see data/adventures.js).

   Pure generation + navigation state here; rendering/encounter wiring layer on
   top via window.AdventureMap.
   ============================================ */

import { ACTS, ADVENTURES, adventureFor } from '../data/adventures.js';

// Node types and their map glyphs.
export const NODE_TYPES = {
    combat:    { icon: '⚔️', label: 'Battle' },
    elite:     { icon: '💀', label: 'Elite' },
    event:     { icon: '❓', label: 'Event' },
    shop:      { icon: '🏛️', label: 'Merchant' },
    rest:      { icon: '🔥', label: 'Campfire' },
    treasure:  { icon: '🎁', label: 'Treasure' },
    boss:      { icon: '👹', label: 'Boss' },
    finalboss: { icon: '☠️', label: 'Final Boss' },
};

const ENCOUNTER_ROWS = 7; // rows 0..6 of encounters, then a boss row
const REST_ROW = ENCOUNTER_ROWS - 1; // last encounter row = campfire (pre-boss)

// Weighted pick for the mid rows.
function pickMidType(rng) {
    const table = [
        ['combat', 46], ['event', 20], ['shop', 12], ['elite', 12], ['treasure', 10],
    ];
    let total = table.reduce((s, [, w]) => s + w, 0);
    let roll = rng() * total;
    for (const [type, w] of table) { if ((roll -= w) < 0) return type; }
    return 'combat';
}

// Simple seedable RNG so a run is reproducible if a seed is passed (else random).
function makeRng(seed) {
    if (seed == null) return Math.random;
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function genAct(actIndex, isFinal, finalBoss, rng) {
    const rows = [];
    for (let r = 0; r < ENCOUNTER_ROWS; r++) {
        const count = 2 + Math.floor(rng() * 3); // 2-4 nodes
        const row = [];
        for (let c = 0; c < count; c++) {
            let type;
            if (r === 0) type = 'combat';            // gentle start
            else if (r === REST_ROW) type = 'rest';  // campfire before boss
            else type = pickMidType(rng);
            row.push({ type, col: c, count });
        }
        rows.push(row);
    }
    // Boss row (single node)
    rows.push([{ type: isFinal ? 'finalboss' : 'boss', col: 0, count: 1, boss: isFinal ? finalBoss : null }]);

    // --- Balance guarantees within the act ---
    const midRows = rows.slice(1, REST_ROW); // editable encounter rows
    const flatMid = midRows.flat();
    // >=1 shop per act
    if (!flatMid.some(n => n.type === 'shop') && flatMid.length) {
        flatMid[Math.floor(rng() * flatMid.length)].type = 'shop';
    }
    // cap elites at 2 per act (extras -> combat)
    let elites = flatMid.filter(n => n.type === 'elite');
    while (elites.length > 2) { elites.pop().type = 'combat'; elites = flatMid.filter(n => n.type === 'elite'); }
    // no elite in the very first mid row (row 1) — ease players in
    (rows[1] || []).forEach(n => { if (n.type === 'elite') n.type = 'combat'; });

    return rows;
}

// Connect each row to the next with a column-proximity lattice; guarantee every
// next-row node has at least one incoming edge (no unreachable nodes).
function linkRows(rows, idFor, rng) {
    for (let r = 0; r < rows.length - 1; r++) {
        const cur = rows[r], nxt = rows[r + 1];
        const frac = (n, row) => (row.length === 1 ? 0.5 : n.col / (row.length - 1));
        cur.forEach(n => {
            n.next = n.next || [];
            // nearest next-row node by normalized column
            const sorted = [...nxt].sort((a, b) => Math.abs(frac(a, nxt) - frac(n, cur)) - Math.abs(frac(b, nxt) - frac(n, cur)));
            const links = 1 + (rng() < 0.5 && sorted.length > 1 ? 1 : 0);
            for (let k = 0; k < links; k++) n.next.push(idFor(r + 1, sorted[k].col));
        });
        // orphan fix: any next node with no incoming gets linked from nearest cur node
        nxt.forEach(t => {
            const incoming = cur.some(n => (n.next || []).includes(idFor(r + 1, t.col)));
            if (!incoming) {
                const src = [...cur].sort((a, b) => Math.abs(frac(a, cur) - frac(t, nxt)) - Math.abs(frac(b, cur) - frac(t, nxt)))[0];
                src.next.push(idFor(r + 1, t.col));
            }
        });
        // de-dupe
        cur.forEach(n => { n.next = [...new Set(n.next)]; });
    }
}

export function generateAdventureMap(playerClass, seed = null) {
    const rng = makeRng(seed);
    const adv = adventureFor(playerClass);
    const acts = [];
    for (let a = 0; a < ACTS.length; a++) {
        const isFinal = a === ACTS.length - 1;
        const rows = genAct(a, isFinal, adv.finalBoss, rng);
        // assign ids + tier (difficulty scales with act and depth)
        rows.forEach((row, r) => row.forEach(n => {
            n.id = `a${a}r${r}c${n.col}`;
            n.act = a; n.row = r;
            n.tier = a * ENCOUNTER_ROWS + r; // global depth for combat scaling
        }));
        linkRows(rows, (r, c) => `a${a}r${r}c${c}`, rng);
        acts.push({ ...ACTS[a], index: a, rows });
    }
    // link act boss -> next act row 0
    for (let a = 0; a < acts.length - 1; a++) {
        const boss = acts[a].rows[acts[a].rows.length - 1][0];
        boss.next = acts[a + 1].rows[0].map(n => n.id);
    }
    return { playerClass, adventure: adv, acts };
}

// Flatten all nodes (handy for lookup/validation).
export function allNodes(map) {
    return map.acts.flatMap(a => a.rows.flat());
}

// ============================================
// NAVIGATION STATE
// ============================================
const AdventureMap = {
    map: null,
    currentId: null,   // last entered node; null = run start (act 0 row 0 choices)
    completed: new Set(),
    onNodeSelected: null, // hook(node) set by the integration layer

    start(playerClass, seed = null) {
        this.map = generateAdventureMap(playerClass, seed);
        this.currentId = null;
        this.completed = new Set();
        return this.map;
    },

    node(id) { return allNodes(this.map).find(n => n.id === id) || null; },

    // Nodes the player may enter right now.
    reachable() {
        if (!this.map) return [];
        if (this.currentId == null) return this.map.acts[0].rows[0].map(n => n.id);
        const cur = this.node(this.currentId);
        return (cur && cur.next) ? cur.next : [];
    },

    select(id) {
        if (!this.reachable().includes(id)) return false;
        this.currentId = id;
        this.completed.add(id);
        if (typeof this.onNodeSelected === 'function') this.onNodeSelected(this.node(id));
        return true;
    },
};

// Deterministic per-node horizontal jitter (px) to break the grid look.
AdventureMap._jitter = (id) => {
    let h = 0;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return (h % 33) - 16; // -16..+16
};

// ============================================
// RENDER (map screen)
// ============================================
// Renders the map into a container: acts top→bottom, branching node chips with
// SVG connectors. Reachable nodes are clickable; completed/locked are dimmed.
AdventureMap.renderInto = function (container) {
    const map = this.map;
    if (!map) return;
    const reach = new Set(this.reachable());
    container.innerHTML = '';
    container.style.position = 'relative';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'adv-edges');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
    container.appendChild(svg);

    const elById = {};
    map.acts.forEach((act) => {
        const head = document.createElement('div');
        head.className = 'adv-act-head';
        head.innerHTML = `<span>ACT ${act.index + 1} — ${act.name}</span><small>${act.theme}</small>`;
        container.appendChild(head);
        act.rows.forEach((row) => {
            const rowEl = document.createElement('div');
            rowEl.className = 'adv-row';
            row.forEach((n) => {
                const t = NODE_TYPES[n.type];
                const node = document.createElement('button');
                const state = this.completed.has(n.id) ? 'done' : (reach.has(n.id) ? 'reachable' : 'locked');
                node.className = `adv-node adv-${n.type} adv-${state}`;
                node.dataset.id = n.id;
                node.title = t.label;
                node.innerHTML = `<span class="adv-ico">${t.icon}</span>`;
                if (n.type === 'boss' || n.type === 'finalboss') {
                    node.innerHTML += `<span class="adv-bosslabel">${n.boss ? n.boss.name : t.label}</span>`;
                }
                if (state === 'reachable') {
                    node.onclick = () => { if (this.select(n.id)) this.renderInto(container); };
                } else {
                    node.disabled = true;
                }
                rowEl.appendChild(node);
                elById[n.id] = node;
            });
            container.appendChild(rowEl);
        });
    });

    // Draw connectors after layout.
    const crect = container.getBoundingClientRect();
    const center = (el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left - crect.left + r.width / 2, y: r.top - crect.top + r.height / 2 };
    };
    allNodes(map).forEach((n) => {
        const from = elById[n.id]; if (!from) return;
        const a = center(from);
        (n.next || []).forEach((tid) => {
            const to = elById[tid]; if (!to) return;
            const b = center(to);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', a.x); line.setAttribute('y1', a.y);
            line.setAttribute('x2', b.x); line.setAttribute('y2', b.y);
            line.setAttribute('stroke', this.completed.has(n.id) ? '#c9a961' : 'rgba(201,169,97,0.35)');
            line.setAttribute('stroke-width', '2');
            svg.appendChild(line);
        });
    });
};

// Open the map screen for the CURRENT run (does not regenerate).
AdventureMap.openScreen = function () {
    if (!this.map) return;
    let overlay = document.getElementById('adventureMapModal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'adventureMapModal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:760px;width:92vw;max-height:90vh;overflow-y:auto;">
                <h2 style="text-align:center;">🗺️ The Descent</h2>
                <p id="adventureMapOpening" style="text-align:center;color:#cbb892;font-style:italic;margin-top:-6px;"></p>
                <div id="adventureMapBody"></div>
            </div>`;
        document.body.appendChild(overlay);
    }
    const op = overlay.querySelector('#adventureMapOpening');
    if (op) op.textContent = this.map.adventure.opening;
    overlay.classList.add('active');
    this.renderInto(overlay.querySelector('#adventureMapBody'));
};

AdventureMap.closeScreen = function () {
    const overlay = document.getElementById('adventureMapModal');
    if (overlay) overlay.classList.remove('active');
};

// Self-contained preview overlay (also the basis of the in-game map screen).
AdventureMap.preview = function (playerClass = 'scoundrel', seed = null) {
    this.start(playerClass, seed);
    let overlay = document.getElementById('adventureMapModal');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'adventureMapModal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:760px;width:92vw;max-height:90vh;overflow-y:auto;">
                <button class="modal-close-btn" onclick="document.getElementById('adventureMapModal').classList.remove('active')">✕</button>
                <h2 style="text-align:center;">🗺️ ${this.map.adventure ? '' : ''}The Descent</h2>
                <p style="text-align:center;color:#cbb892;font-style:italic;margin-top:-6px;">${this.map.adventure.opening}</p>
                <div id="adventureMapBody"></div>
            </div>`;
        document.body.appendChild(overlay);
    }
    overlay.classList.add('active');
    this.renderInto(overlay.querySelector('#adventureMapBody'));
};

if (typeof window !== 'undefined') {
    window.AdventureMap = AdventureMap;
    window.generateAdventureMap = generateAdventureMap;
}

export default AdventureMap;
