#!/usr/bin/env node
/**
 * Minify public/src JS + CSS IN PLACE — meant to run inside Netlify's build
 * (the deploy copy is ephemeral; the repo keeps readable sources). Netlify's
 * [build.processing] post-processing is a deprecated no-op, so production was
 * shipping ~672KB of unminified JS with full comments.
 *
 * JS uses whitespace+syntax minification ONLY (no identifier renaming): most
 * files are classic scripts whose top-level names ARE the window.* contract
 * the hand-maintained load order depends on — renaming is the one transform
 * that could break it, and it's not worth the last few percent.
 *
 * Local verification: `npm run minify && node tests/smoke.mjs`, then restore
 * with `git restore public/`.
 */
import { transform } from 'esbuild';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const files = [];
(function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (e.name.endsWith('.js') || e.name.endsWith('.css')) files.push(p);
    }
})(path.join(ROOT, 'src'));
files.push(path.join(ROOT, 'sw.js'));

let before = 0, after = 0, failed = 0;
for (const f of files) {
    const src = fs.readFileSync(f, 'utf8');
    const isCss = f.endsWith('.css');
    try {
        const out = await transform(src, {
            loader: isCss ? 'css' : 'js',
            minifyWhitespace: true,
            minifySyntax: true,
            minifyIdentifiers: false, // never rename: window.* contract + load order
            charset: 'utf8',
        });
        before += src.length;
        after += out.code.length;
        fs.writeFileSync(f, out.code);
    } catch (e) {
        failed++;
        console.error(`SKIP (parse error) ${path.relative(ROOT, f)}: ${String(e.message || e).slice(0, 200)}`);
        before += src.length;
        after += src.length;
    }
}

console.log(`Minified ${files.length - failed}/${files.length} files: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB (${(100 - after / before * 100).toFixed(0)}% smaller)`);
if (failed) { console.error(`${failed} file(s) failed to parse — build aborted.`); process.exit(1); }
