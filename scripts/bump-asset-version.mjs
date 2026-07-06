#!/usr/bin/env node
/**
 * Rewrites the cache-bust version on EVERY first-party JS/CSS URL:
 *   - <script src> / <link href> references in public/index.html
 *   - relative ES-module import specifiers across public/src/js
 *
 * Why imports too: /src/* is served immutable (1 year). Top-level script
 * tags were ?v=-busted, but module imports (game.js -> modules/*.js) and
 * stylesheet links were unversioned — returning players kept stale modules
 * and CSS for up to a year after a release, mixed with fresh top-level
 * scripts (the v1.7.0 "shipped fixes didn't arrive" bug). Versioning the
 * whole graph makes immutable safe again.
 *
 * CONSISTENCY MATTERS: if one importer of a module carries a different
 * version than another, the browser loads TWO instances of that module
 * (split-brain game state). This script rewrites everything to one version
 * and then verifies no relative import is left unversioned or mismatched.
 *
 * Usage: node scripts/bump-asset-version.mjs [version]
 *        (defaults to the version in package.json)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = process.argv[2] || JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
if (!/^[\w.\-]+$/.test(VERSION)) { console.error(`Bad version: ${VERSION}`); process.exit(1); }

let changed = 0;

// ---------- 1. index.html: version every first-party src/js + src/styles URL ----------
const INDEX = path.join(ROOT, 'public/index.html');
let html = fs.readFileSync(INDEX, 'utf8');
html = html.replace(/(["'])(src\/(?:js|styles)\/[^"'?]+?\.(?:js|css))(?:\?v=[\w.\-]+)?(["'])/g,
    (_, q1, url, q2) => { changed++; return `${q1}${url}?v=${VERSION}${q2}`; });
fs.writeFileSync(INDEX, html);

// ---------- 2. ES module graph: version every relative static import ----------
const jsFiles = [];
(function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.js')) jsFiles.push(p);
    }
})(path.join(ROOT, 'public/src/js'));

const IMPORT_RE = /(from\s+["'])(\.{1,2}\/[^"'?]+?\.js)(?:\?v=[\w.\-]+)?(["'])/g;
for (const f of jsFiles) {
    const src = fs.readFileSync(f, 'utf8');
    const out = src.replace(IMPORT_RE, (_, pre, spec, post) => { changed++; return `${pre}${spec}?v=${VERSION}${post}`; });
    if (out !== src) fs.writeFileSync(f, out);
}

// ---------- 3. Verify: no unversioned/mismatched relative import survives ----------
let bad = 0;
for (const f of jsFiles) {
    const src = fs.readFileSync(f, 'utf8');
    for (const m of src.matchAll(/from\s+["'](\.{1,2}\/[^"']+)["']/g)) {
        if (!m[1].endsWith(`?v=${VERSION}`)) {
            console.error(`UNVERSIONED/MISMATCHED import in ${path.relative(ROOT, f)}: ${m[1]}`);
            bad++;
        }
    }
}
const leftover = [...fs.readFileSync(INDEX, 'utf8').matchAll(/["'](src\/(?:js|styles)\/[^"']+?\.(?:js|css))["']/g)];
for (const m of leftover) { console.error(`UNVERSIONED URL in index.html: ${m[1]}`); bad++; }

if (bad) { console.error(`\n${bad} unversioned reference(s) — FIX BEFORE SHIPPING (split-brain risk).`); process.exit(1); }
console.log(`OK: ${changed} URLs now at ?v=${VERSION}`);
