# RUU//OVERRUN — PUBLIC BETA (v1.14.1)

## v1.14.1 — RIGHT-SIDE CUT-INS / CLEAN START SCREEN

- All **nine SIGNATURE FINISHER** illustrations now enter from the **right**. Their image lane starts at approximately 19% down from the top, keeping the top-left HP / FINISHER / SYNCHRO gauges free of cut-in art.
- All **three JACKPOT MODE** introduction illustrations also use the same right-side layout. Right-side score HUD remains above the image lane.
- Cinematic overlays still use the original artwork, music, damage, timings and controls; **only presentation geometry was changed**.
- The title screen removes the long feature catalog and outdated ZIP startup advice. It now shows one short description (automatic attacks, 100-second survival and final boss), key controls, existing menu buttons and personal best.
- DEVORA FILES, ACHIEVEMENTS, CHALLENGE MISSIONS, ENDLESS MODE and ENDING THEATER stay available through their existing title buttons.
- No Cloudflare / D1 update required. The game and result version displays are now **v1.14.1**.

## v1.14.0 — SURVIVAL TRIALS (DEVORA INVASION / LAST STAND / CHALLENGE MISSIONS)

### DEVORA INVASION — special raids at 30 / 60 / 90 seconds

- A **RUST SWARM** (30s), **IRON SIEGE** (60s), and **NULL ONSLAUGHT** (90s) arrive during both NORMAL and ENDLESS and during CHALLENGE play.
- Invaders arrive from off-player positions over time, with a warning banner, color-coded attack identity, and a kill-quota / time-left UI. No enemy appears directly on the player.
- Complete each raid's quota **7 / 10 / 12** kills within **17 / 19 / 20** seconds to earn a score / XP / DRIVE / FINISHER bonus. Mere survival does not earn the bonus.
- Rewards are 1,600 / 3,200 / 5,000 score plus XP and modest gauge boosts. Failed invasions award no bonus. No additional bosses are created.

### LAST STAND — low-HP danger presentation

- Activates when HP falls to **25% or less** (with 31% recovery hysteresis). Adds a subtle red vignette, pulse-warning text, and two quiet synthesized heartbeat notes through the existing SFX engine.
- Only a **presentation** change: does not increase damage, trigger healing, extend invincibility or interfere with enemy attack readability. Follows SFX ON/OFF and FX LITE / AUTO / HIGH.

### CHALLENGE MISSIONS — local-only high-difficulty runs

- After clearing NORMAL once, **CHALLENGE MISSIONS** appears on the title screen alongside ENDLESS MODE and ENDING THEATER.
- **UNTOUCHED:** Complete 100 seconds plus final boss with zero HP damage. Shield-absorbed hits do not count as HP damage.
- **ZERO LUCK:** JACKPOT MODE cannot appear in level-up choices. Other upgrades remain available.
- **SINGLE BARREL:** Only the starting 零式ネオン・バラージ can be upgraded as a weapon. Additional weapons, fusion, evolution and JACKPOT MODE are unavailable; survival and passive upgrades remain.
- Each successful trial awards an original **challenge-only title**; clear count and highest qualifying score live in browser localStorage. Titles may be equipped from the challenge archive.
- **IMPORTANT:** CHALLENGE mode does **not** write or update NORMAL personal best, ENDLESS personal best or either Cloudflare global ranking. The result view offers X sharing and a PNG result card, not online score submission. Retry preserves the selected challenge.
- Losing, or completing the base game after failing a challenge's additional restriction, never unlocks the challenge title.

**Unchanged:** NORMAL 100s + final boss clear, ENDLESS rules, full 16-track playlist, 1% JACKPOT MODE, 13s invulnerability, 53-second ending, all v1.12 mutations and v1.13 ASTRAL companion features. **No Cloudflare migration is required for v1.14.0.**

**Required new file:** `survival-trials.js` alongside `index.html`, `astral-companion.js`, `devora-mutation.js` and related assets.

### Quick QA

1. Play NORMAL through 30, 60 and 90 seconds and observe raid waves, countdowns, and bonus for successful repels.
2. Drop below 25% HP and verify danger feedback; heal above 31% to exit LAST STAND.
3. Clear NORMAL, select each challenge, check jackpot and weapon restrictions, and verify success/failure titles.
4. Verify challenge results never enter a public ranking and do not overwrite NORMAL / ENDLESS records.
5. Confirm the original ending, mobile layout, FX LITE and 16 soundtracks.

## v1.13.1 — MASS-PRODUCED ASTRAL-SUIT WALK ANIMATION

- **Smaller companion:** Mass-produced ASTRAL-SUIT now renders at 64×94 logical pixels (previously 86×125), approximately 25% smaller. ASTRAEA No.3 remains at its original special-reinforcement scale.
- **Walking GIF:** The supplied 8-frame side-walking animation has been optimized into `assets/astral-suit-walk.gif` (44×65 source pixels, 120ms per frame, transparent, approximately 7 KB) and installed in the game. The original uncompressed source remains separate.
- **Motion-aware animation:** The escort walks while it is moving and freezes its idle pose when stationary. The right-facing animation is mirrored during leftward movement. Frame advance follows in-game simulation time, so pause/level-up also pauses animation when decoded frames are available.
- **Compatibility:** Modern browsers use ImageDecoder for stable frame-by-frame Canvas playback; other browsers fall back to the GIF image with the previous SVG as the stationary backup. Support shooting, projectile interception, SYNCHRO, and ASTRAEA deployment gameplay are unchanged.
- **No Cloudflare update is needed.** The main entry point and results version are now v1.13.1.

## v1.13.0 — ASTRAL COMPANION PROTOCOL

Based on the creator's existing 星屑の鎧 -Guardian Genome- character sheets. ASTRAEA No.3 remains piloted by ルー・スクリヴナー in the original work. The game assets are simplified reference-inspired SVG sprites, not changes to the official canonical design.

- **Mass-produced ASTRAL-SUIT:** Automatically accompanies Ruu from the start, follows the player, fires moderate support shots roughly every 1.5 seconds, and can intercept one nearby hostile projectile with a cooldown of roughly 9.5 seconds.
- **SYNCHRO:** Earn gauge from enemy kills; extra gains from mutations, combos, elite kills and the first DEVORA boss.
- **ASTRAEA No.3:** Unlocks when the 45-second DEVORA boss is defeated, survival reaches 75 seconds, and SYNCHRO is 100%. Press **X** or click/tap **ASTRAEA DEPLOY**. Only once per run, and not while a JACKPOT or finisher is active.
- **MEMORY INHERITANCE:** Twelve seconds of pink winged effects, targeted volleys and a GUARDIAN RESONANCE finale. ASTRAEA's total damage to each boss is limited to 28% of that boss's maximum HP and cannot deliver the lethal blow.
- **Assets:** New root JavaScript module and two small SVG sprites. Visual particles adapt to FX LITE / AUTO / HIGH; no new soundtrack is introduced.

Preserved: NORMAL 100-second clear + final boss defeat, ENDLESS, all 16 tracks, 1% JACKPOT MODE and its 13-second invulnerability, 53-second ending, v1.12 mutations, achievements and Cloudflare rankings. No Cloudflare database/Worker migration is needed.

### v1.13 browser test checklist

1. Confirm ASTRAL-SUIT follows Ruu and fires at enemies from the start.
2. Defeat the DEVORA boss, survive 75 seconds and fill SYNCHRO to unlock ASTRAEA.
3. Press X or the on-screen button; confirm the 12-second intervention, capped boss damage, and single use.
4. Check FX LITE and mobile layout, then retry a new run to ensure state resets.
5. Verify NORMAL/ENDLESS scores, online ranking submissions and the original ending in the browser.

## v1.12.0 — DEVORA MUTATION / IMPACT SURGE

**Goal: tougher but readable combat, and more satisfying enemy destruction.** This update adds four mutated variants to the existing DEVORA enemies from ~24s onward (their frequency increases later, with an active cap):

- **FRENZY** — charges up an aimed rush. A red directional warning gives time to move or dash before it accelerates.
- **OVERLOAD** — begins a ~1s explosive countdown at close range. The amber danger ring indicates the actual blast radius; defeating it first causes a visual-only victory explosion.
- **FRACTURE** — splits into two weaker, non-mutating enemies on defeat (or one if the arena is crowded).
- **BULWARK** — has additional health and temporary damage resistance. Repeated hits break its armor and briefly stun it.

Both existing bosses now have modestly increased HP (+10% for the DEVORA boss, +13% for NULL EMPEROR). At **55% HP**, they shift to **PHASE II**, attack faster and add a **clearly telegraphed aimed projectile fan**. Their current radial attacks are preserved with a projectile cap.

**IMPACT SURGE** adds enhanced death sparks, colored shatter rings, short hit-stop on special kills, screen-edge impact feedback, armor-break effects, and a readable on-screen mutation marker. New visual effects scale with existing **FX AUTO / HIGH / LITE** preferences, and no new artwork or audio files are needed.

**Preserved:** NORMAL 100-second clear conditions, ENDLESS mode, all 16 soundtrack files, three JACKPOT modes at **1%** per level-up / reroll, 13s JACKPOT invulnerability, 53-second ending, achievements, and cloud leaderboards. This gameplay-only update requires **no Cloudflare migration**. Keep `devora-mutation.js` beside `index.html`; deleting it disables the new mutation system.

### v1.12 smoke-test checklist

1. Play NORMAL past 24 seconds and look for colored mutation labels. FRENZY and OVERLOAD should show warning lines/rings before their attacks.
2. Destroy FRACTURE and BULWARK enemies and verify split offspring, armor breaks and hit effects.
3. Lower a boss below 55% HP and check the PHASE II callout and aimed volleys, then defeat the final boss to confirm the original ending.
4. Check FX LITE on a lower-power device and verify that warnings remain visible, then check NORMAL and ENDLESS online rankings.



## Balance hotfix — JACKPOT MODE 1% (2026-11-22)

JACKPOT MODE now appears with a **1% chance per level-up choice screen** (each reroll independently rechecks), reduced from 3%. All three JACKPOT modes still last 13 seconds and retain their exclusive music and effects. The separate **JACKPOT +3** rare-upgrade rate remains **3%**. No Cloudflare backend update is necessary for this gameplay-only adjustment.

## v1.11.0 — OVERDRIVE EXPANSION (5-FEATURE UPDATE)

1. **Boss destruction cinema** — standard DEVORA boss: “DEVORA BREAK” (~1.85s), final NULL EMPEROR: “FINAL ANNIHILATION” (~2.65s). The battlefield freezes temporarily and returns to play or starts the ending as appropriate.
2. **4 new fusion attacks** — 氷雷絶唱 (frost+lightning), 天焦焔華 (meteor+fireworks), 断界弾道 (rail+rift), 終末共鳴 (sonic+cross). These are earned from level-up choices once both component weapons are at LV2+. The six pre-existing evolutions remain available.
3. **Combo celebration** — 50 / 100 / 200 / 500 CHAIN overlays and a new audio cue; max combo appears in the result screen.
4. **12 local achievements & selectable titles** — the title-screen ACHIEVEMENTS archive stores unlocks in localStorage. Players may choose an earned title for their results and X posts, and for the shared ranking once the updated backend is deployed.
5. **ENDLESS MODE** — unlocked after the original 100-second campaign is cleared, with escalating waves and a new boss every ~45 seconds after the initial 100 seconds. Independent local high score; ENDLESS never triggers the original 100-second win condition.

### Global ranking — v1.11 migration completed (2026-11-22)

The production Cloudflare D1/Worker migration has been performed. The owner verified `/api/health` with `rankingModes:["normal","endless"]`, three preserved NORMAL records, and a valid empty ENDLESS list. Real ENDLESS score submission still needs an in-game end-to-end test. Existing NORMAL records were retained.

Follow [backend/UPGRADE_v111_JA.md](./backend/UPGRADE_v111_JA.md):
- Run `backend/migrate_v111.sql` **once** in the existing Cloudflare D1 Console (adds an optional title field to normal scores and a separate `endless_scores` table).
- In the **existing** `ruu-overrun-leaderboard` Worker, replace the code with [backend/src/index.js](./backend/src/index.js) and Deploy.
- Check `/api/health` for `"rankingModes":["normal","endless"]`.

Your game URL, shared NORMAL leaderboard, original 16 music tracks, 3 JACKPOT modes, 1% JACKPOT chance (updated by the balance hotfix), 53-second ending and X result share are preserved.



## v1.10.0 — SIGNAL LOST / DEFEAT CINEMATIC

- A lethal hit now freezes the world and plays a **3.05-second defeat sequence** before displaying GAME OVER.
- Light fractures, drifting shards, expanding broken shock rings, interference scanlines, a darkening frame and an in-world **SIGNAL LOST** title replace the abrupt transition.
- Music fades out over ~1.75 seconds, accompanied by two new layered WebAudio cues: impact and fading signal. Respects SFX ON/OFF.
- Press **Enter/Escape** or tap/click the game screen after the initial impact to skip to the results.
- Gameplay time and score stop progressing during the cinematic. Personal best is saved at the lethal hit; global leaderboard and X result sharing remain compatible.
- No change to weapon damage, 16 soundtracks, JACKPOT (3% chance / 13s invulnerability), short ending, or attack FX.
- Keep `death-cinema.js` alongside `index.html`, `premium-overdrive.js`, and `visual-overdrive.js`.



## v1.9.0 — JACKPOT ROYALE / PREMIUM SOUND

- Adds three distinct JACKPOT presentation themes: **DUO SIGNAL** (violet/crimson crossfire), **WHITE POP** (pearl/gold starburst), **BLACK TRACE** (red/black glitch slash).
- While JACKPOT is active, the screen gains custom animated corner crests, musical pulse accents, countdown jewels, ornamental edge artwork, a moving player corona and additional world-space attack effects. The central playfield remains readable and cut-in art is preserved.
- General weapon impact, beam and ultimate effects receive complementary visual detail without affecting damage.
- `premium-overdrive.js` provides an original, runtime-synthesized layered SFX engine, replacing simplistic single-oscillator bleeps for **40 in-game SFX events**, including separate sound signatures for all three JACKPOT modes.
- Effects respect **FX AUTO / HIGH / LITE**; SFX ON/OFF still works. Original game music continues separately.
- **Visual/audio-only update:** 16 tracks, short ending (53s), JACKPOT chance (3%), 13-second invulnerability, combat stats, online leaderboard and X sharing are unchanged.
- Keep `premium-overdrive.js` at the repository root alongside `index.html` and `visual-overdrive.js`.



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
- `devora-mutation.js` — mutation variants, boss PHASE II attack behavior and IMPACT SURGE effects (required for v1.12.0).
- `astral-companion.js`, `assets/astral-suit-companion.svg`, `assets/astraea-companion.svg` — v1.13 companion features and reference-inspired sprites.
- `survival-trials.js` — v1.14 invasion waves, LAST STAND danger feedback and challenge mission rules, saved locally.
- `assets/astral-suit-walk.gif` — optimized 8-frame walking companion GIF (required for animated escort in v1.13.1).
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
