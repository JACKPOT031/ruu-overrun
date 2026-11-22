# RUU//OVERRUN — PUBLIC BETA (v1.8.0)

## v1.8.0 — SHORT SPARKLING ENDING

- Replaces the 10-scene, 3m25s ending with one full-frame collage illustration (`assets/ending_11.webp`) and gentle moving, twinkling light particles.
- Ending music now plays for about 53.45 seconds. The artist-provided short WAV was verified to match the final 53.45 seconds of the existing master; the game seeks to that excerpt of the already-hosted `assets/ending_sasuraeba.mp3` (starting around 151.687s), avoiding duplicate audio downloads.
- Updates ending controls to ±10 seconds. Pause and resume also pause the sparkle animations; Skip and Ending Theater remain available.
- The entire 16-track soundtrack, original visual-combat enhancements, JACKPOT MODE (3%), global rankings, and X sharing are unchanged.
- Game/menu/result version strings updated to **v1.8.0**.



## v1.7.0 — VISUAL OVERDRIVE

- Adds brighter projectile trails, impact flares, colored fragmentation and reinforced weapon beams.
- Nine ultimate finishers receive additional ceremonial light sigils; all three JACKPOT modes receive distinctive energy auras and special strike overlays.
- Effects respect the existing FX AUTO / HIGH / LITE settings and use bounded effect budgets.
- **Visuals only:** weapon damage, enemy HP, game timing, JACKPOT appearance rate (3%), music (16 tracks), ending, shared leaderboard and X posting are unchanged.
- `visual-overdrive.js` must remain in the repository root alongside `index.html`.


JACKPOTØ31 original browser survival game. Includes all 16 approved soundtracks, 3 JACKPOT modes, ending cinema, 9 ultimate signatures, an X share button and a nickname-based ranking interface.

## Files

- `index.html` — GitHub Pages entrypoint. Loads the game and public-ranking UI.
- `assets/` — all game images and music. **Do not omit this directory.**
- `public-features.js`, `public-features.css`, `leaderboard-config.js` — ranking and X share UI.
- `backend/` — separate Cloudflare Workers + D1 API for a **shared** ranking. This folder is code only; GitHub Pages does not run it.
- `.nojekyll` — avoid processing source assets with Jekyll.

## First publish the game to GitHub Pages

1. Create a **new public repository** named `ruu-overrun` under the `JACKPOT031` account. Do not upload these files into unrelated tool repositories.
2. Upload **the contents** of this folder (including `index.html`, `assets/`, `.nojekyll` and `backend/`) to the root of your new repository using GitHub Desktop or Git. The ZIP package itself is for transfer; do **not** upload only the ZIP as your site.
3. In GitHub, open repository **Settings → Pages → Build and deployment → Deploy from a branch → main → /(root) → Save**.
4. Once deployed, GitHub Pages normally shows a URL such as `https://JACKPOT031.github.io/ruu-overrun/`. Check **Visit site** under Pages to confirm the actual URL.
5. Test the start button, BGM, end game, nickname input, and X share.

The game and X text share work without the ranking API. Before the API is connected, the ranking screen clearly says that the shared service is not configured; no fake worldwide rankings are shown.

## Then connect the global ranking backend (Cloudflare Worker + D1)

Cloudflare account and Node.js/npm are required for this optional deployment stage. Commands below run inside `backend/`.

```bash
npx wrangler login
npx wrangler d1 create ruu-overrun-ranking
```

Copy `wrangler.toml.example` to `wrangler.toml`, then replace `database_id` with the ID printed by the create command. If using a different GitHub Pages host, edit `ALLOWED_ORIGINS` accordingly.

```bash
npx wrangler d1 execute ruu-overrun-ranking --remote --file=./schema.sql
npx wrangler deploy
```

The deploy output contains the real `https://...workers.dev` URL. Edit `leaderboard-config.js` **at the repository root**:

```js
window.RUU_PUBLIC_CONFIG = {
  apiUrl: "https://YOUR-ACTUAL-WORKER.workers.dev",
  siteUrl: "https://YOUR-ACTUAL-GITHUB-PAGES-URL/"
};
```

Commit and push that config update. The global ranking will then become active. Never put a Cloudflare API token, database secret, X credential, or a password into client-side files or GitHub commits.

### Leaderboard behavior / privacy

- Ranking is public, by **highest score**. One best score per anonymous browser ID; the ID stays private and is not shown on the ranking screen.
- Names and game records are public. Only use a nickname; avoid real names and personal information. There is no account creation or password.
- X sharing opens a **pre-filled post editor** with results and the game URL; it does not automatically post or upload a screenshot. The separate **result-card PNG** button saves a branded score image for the player to attach manually.
- The server rejects malformed inputs and rapid repeat updates, but **client-reported scores can be falsified**. Treat this as a friendly *beta ranking*, not cheat-resistant competition. Robust competition requires authenticated replay verification or server-authoritative scoring and abuse controls.
- D1 stores an anonymous browser ID, nickname, score, kills, level, survival time, clear flag and submission time. No email or IP is saved by this application.
- Players can remove a record tied to the same browser using the ranking screen’s deletion control; the owner can also manage records in Cloudflare D1. For a larger public service, add moderation, abuse reporting, and stronger anti-cheat controls.

## Rights and distribution

This public repo distributes **game artwork and all 16 audio tracks** to anyone who can visit or download the site. Confirm that the commercial/public hosting rights for each track, artwork and collaborator contribution are secured before making the repository public. In particular, verify any collaborative songwriting or licensing terms.

## Local testing

From the project root:

```bash
python -m http.server 8000
```

Open `http://localhost:8000/` in Chrome or Edge. Browser-based ranking will not connect until the backend is deployed and `leaderboard-config.js` is configured.
