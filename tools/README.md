# Card art tooling (offline / build-time)

Generates card illustrations with **your** OpenAI or Gemini key, then wraps each
in the game's SVG frame. This runs **on your machine**, never in the deployed
site — no API key ever reaches the static front-end.

Cards are a fixed set, so you generate once and commit the finished assets:
no per-player cost, no runtime keys.

## Requirements
- Node 18+ (uses global `fetch`, no npm deps).

## 1. Generate art
```bash
# OpenAI (gpt-image-1)
export OPENAI_API_KEY=sk-...
node tools/generate.mjs --provider openai

# Gemini (gemini-2.5-flash-image)
export GEMINI_API_KEY=...
node tools/generate.mjs --provider gemini

# See the exact prompts without spending anything:
node tools/generate.mjs --provider openai --dry-run
```
Raw art lands in `tools/art/<provider>/<id>.png`. Run both providers and compare.

Model ids are overridable if the APIs change:
`OPENAI_IMAGE_MODEL`, `GEMINI_IMAGE_MODEL`.

## 2. Compose into frames
```bash
node tools/compose.mjs --provider openai
```
Writes self-contained `tools/out/<id>.svg` (art embedded). Open them in a browser
to review. Cards without generated art are skipped.

## 3. Ship the ones you like
Move the approved SVGs into `public/assets/cards/` and wire them to the card
renderer (Adventure mode; Classic keeps its current look).

## Cost
The deck is ~52 cards + bosses/relics. At roughly $0.01–0.05/image that's a
one-time ~$0.60–$3 for the whole set. Start with the 3 samples in
`cards.config.mjs` to pick a provider/look before generating everything.

## Notes
- `tools/art/` and `tools/out/` are git-ignored (regenerable, can be large).
- Provider/model names reflect the APIs as of writing — verify against current
  docs; adjust the model env vars if a name changed.
