# RUU//OVERRUN — PUBLIC BETA (v1.22.1)

JACKPOTØ31が制作するオリジナル・ブラウザサバイバルアクション。

**[ゲームを遊ぶ](https://jackpot031.github.io/ruu-overrun/)** / **[公開開始v1.5.3からの更新履歴](./CHANGELOG.md)**

## v1.22.1 — BARRAGE PRESSURE (+20%)

- **敵の弾幕発射頻度を約20%引き上げ。** 予兆＋射撃クールダウンのサイクルを従来の5/6に調整。
- 対象：HALO SENTINEL／HEX CHOIR、DEVORA／NULL EMPERORの通常射撃・PHASE II・PHASE III、TRUE DEVORA 3/5体、RUU : ECLIPSE（LAST LIGHTを含む）。
- 維持：1発のダメージ、弾速、予兆時間、包囲弾幕の安全地帯、同時弾数制限、ボス撃破報酬、HP50%の裏ボス出現条件、FX品質・FPS設定。
- 現場の同時弾数上限・射撃距離などにより、実際の弾数増加率が20%未満になる局面もある。

## v1.22.0 — ECLIPSE BULLET HELL / BOSS SPOILS

- **隠しボスの弾幕強化：** 二連／三連の扇状攻撃、三重リング、連続月蝕カーテン、中心へ収束する包囲弾幕、挟撃、斬撃、警告フィールドを強化。HP20%以下の LAST LIGHT は攻撃間隔をさらに短縮。
- **7種類の専用弾デザイン：** Crescent（月刃）、Halo（月輪）、Needle（結晶針）、Blade（斬撃）、Prism（菱形）、Core（侵食核）、Ember（星形）。通常の丸弾描画から切り替え、最大188発と描画キャッシュで負荷を制御。
- **豪華な撃破報酬（従来の撃破スコアに追加）：**
  - 中ボス DEVORA：追加スコア **+5,000**、XP+90、最大HPの12%回復、シールド+8、DRIVE+30、FINISHER+25。レリックも確定ドロップ。
  - NULL EMPEROR：**+15,000**、XP+170、最大HPの18%回復、シールド+12、DRIVE+40、FINISHER+35。レリックも確定ドロップ。
  - TRUE DEVORA各個体：**+3,750**、XP+62、最大HPの5.5%回復、シールド+5、DRIVE+12、FINISHER+12。
  - TRUE DEVORA全滅：3体では追加 **+16,500**、5体では追加 **+24,500** と、追加XP・回復・シールド・ゲージ特典。
  - RUU : ECLIPSE：**+38,000**、XP+300、最大HPの25%回復、シールド+25、DRIVE+55、FINISHER+55。
- **BOSS REWARDシネマ：** 撃破報酬バナー、光輪・衝撃・スコア表示を追加。最終撃破後は約2.7秒表示してからエンディングに移行する。
- **HP50%の裏ボス判定は維持：** DEVORA最後の1体撃破時点のHPを、撃破報酬の回復より先に判定する。条件未達成なら、後からHPを回復してもRUU : ECLIPSEは出現しない。

## v1.21.0 — ECLIPSE OVERDRIVE

RUU : ECLIPSEに4×4 WebPアトラスで待機・歩行・走行・攻撃モーションを追加。二連扇状弾、二重リング、三連ダッシュ、ライン斬撃、クロスケージ、範囲攻撃とLAST LIGHTを導入。

## v1.20.0 — SECRET BOSS / RUU : ECLIPSE

NULL EMPEROR撃破後のTRUE DEVORA全個体を倒した瞬間、**プレイヤーHPが最大値の50%以上**なら裏ボスが出現。裏ボスの撃破もクリア条件に加わる。ENDLESSは対象外。

## v1.19.1〜v1.19.3 — VISUAL CLARITY / PERFORMANCE / FPS

3体／5体カットインの縦横比修正、高DPI Canvas、描画品質改善、通常敵出現密度の軽減、実測FPS・DRAW ms表示を実装。

---
## v1.19.0 — TRUE END / DEVORA COLLECTIVE APOCALYPSE

### New mission and launch copy

- Removed the specific **100-second** promise from the start screen. The new English tagline is **SURVIVE THE SWARM. BREAK THE THREAT.**
- Japanese launch text now reads: **「移動で自動攻撃。敵を倒して、武器を強化。押し寄せる侵食を生き抜き、最後の脅威を撃ち砕け。」**
- The description explicitly mentions occasional guest support from **『星屑の鎧 -Guardian Genome-』** characters. Their original support lottery remains 25%.

### More colossal PHASE III

- DEVORA and NULL EMPEROR PHASE III artworks are **another 20% larger** than in v1.18.0: phase-three display multiplier is 1.536× the pre-transformation sprite size. Collision radius is approximately 10% larger than the v1.18 PHASE III radius (1.17×1.10 relative to pre-transformation). Existing telegraphed attacks and on-transition grace remain.

### FALSE ENDING → TRUE FINAL BOSS

- When the **final NULL EMPEROR is defeated**, the boss-break cinematic runs as before, **but a victory is not granted yet**. Instead, 3 individually hostile **DEVORA TRUE FORM** bosses materialize. One 10% random draw upgrades the encounter to **5 simultaneously active bosses**.
- Both counts receive distinct and optimized in-game cut-in illustrations: `assets/devora_true_end_three.webp` and `assets/devora_true_end_five.webp`. The 5-boss cut-in has a separate **EXTINCTION PROTOCOL** visual treatment, more intense magenta-red vignetting, screen-edge corruption and extra glitch scan lines. The whole cinematic lasts about **2.65 seconds**, with temporary player protection and a clear attack warning.
- Every true DEVORA is a **real enemy with its own hit points and AI**, visually about **twice Ruu's sprite height** (288 logical px vs Ruu's 144 px), not an ornamental summon. The three base roles are **HUNTER** (aggressive pursuit), **ORACLE** (targeted precision fan), and **SIEGE** (radial blockade with gaps). In rare five-boss encounters, **FRACTURE** (multi-angle spread) and **REAPER** (fast aimed fan) join. Each uses visible charging telegraphs rather than unavoidable instant hits.
- Individual core HP scales with game level (base **555 + 23×level**, with a small role multiplier). All true DEVORA additionally take **26% less incoming damage**. Attack timers are independent, so several bosses may coordinate naturally without a forced synchronized unavoidable wave. Global hostile projectile caps remain in force.
- A dedicated **DEVORA TRUE FORM ×3 / ×5 health meter** displays the collective remaining HP plus **cores remaining**; each true boss also has its own nameplate and personal HP bar. Defeated cores stay defeated.
- The final victory and original ending require **defeating every true boss**, in addition to having already defeated NULL EMPEROR and satisfying the existing minimum survival time. Challenge runs also inherit this final-clear requirement. ENDLESS remains endless.
- ASTRAEA's original **28%-per-boss max-HP cap and nonlethal limit** now apply to true DEVORA too. Support pilot Oz prioritizes them as bosses. No automatic ally buff, additional heal or rescue is introduced.
- If a final boss is defeated while TRUE END is already in progress in ENDLESS, the TRUE END wave does not stack. Each new run resets the random draw and the encounter state.

### Visuals and technical files

- New `devora-true-end.js` provides the true-boss encounter, random count, projectile attacks, world telegraphs, portrait rendering, cinematic effects and completion gating.
- New `assets/devora_true_end_three.webp` and `assets/devora_true_end_five.webp` provide distinct 3- and 5-boss imagery. Existing devora-mutation/PHASE III/swarm scripts remain.
- `index.html` now updates result routing, HUD health bar and launch text; its true-boss world model uses the existing DEVORA official enemy illustration, with a new two-times-player scale.
- Updated `devora-phase3.js` provides the extra +20% visual size; updated `astral-companion.js` and `support-pilots.js` preserve TRUE END boss interactions.

**Preserved:** 16 BGM tracks, JACKPOT MODE 1%, 25% named mass-produced suit chance, existing ASTRAEA emergency conditions, NORMAL / ENDLESS Cloudflare leaderboard routes, CHALLENGE local-only results, all previous cinematics and the full 'さすらえば' ending. **No Cloudflare Worker/D1 migration.**

### Browser testing

1. Hard-refresh GitHub Pages (Ctrl+Shift+R) and confirm v1.19.0 and the new title-screen wording.
2. Complete NULL EMPEROR and confirm the boss-break sequence transitions into a distinct DEVORA TRUE END cut-in and spawns three (or rarely five) full-size bosses. No premature victory.
3. Verify all hostile cores have their own HP bars and independent attacks. Check the large boss HUD decreases to 0 only when the last core is defeated.
4. Check FX LITE and HIGH and ensure attack warnings are readable during heavy-screen-corruption scenes.
5. Re-test NORMAL victory and full ending, CHALLENGE isolation, ENDLESS, soundtrack and companion/ASTRAEA damage caps.

## v1.18.0 — SWARM OVERRUN / COLOSSUS TRANSFORMATION

### Enlarged Ruu's normal SIGNATURE FINISHER cut-ins

- All nine signature cut-ins remain on the **right** and now use a **52%-wide × 82%-high** area (previously 46% × 76%), beginning 16% below the canvas top so the top-left gauges stay clear.
- The original Ruu artwork, nine skills, timing and effects are preserved. No additional start-screen clutter.

### Massive PHASE III bosses and unique boss cinematics

- When DEVORA or NULL EMPEROR reaches **30% HP**, it still enters PHASE III after the original 55%-HP PHASE II. Its **visual artwork is 1.28× larger** and its **physical collision radius is 1.17× larger** than its preceding form.
- New **~1.38-second third-form cut-in** uses the game's original DEVORA/NULL EMPEROR portrait assets, recomposed into a dark-gold corruption/limit-break panel with separate Japanese and English forms. No new boss illustration is falsely implied; the cinematic uses the established enemy character artwork.
- The boss attack and contact timers provide approximately **1.4 seconds of grace** during the transformation, avoiding surprise collisions or projectiles beneath the cinematic.
- The golden PHASE III HUD, aimed fan with warning line, and radial SIEGE NOVA with two green SAFE gaps are preserved. Phase III also grants a brief speed/contact-damage boost, **up to two first-wave guards** on the map perimeter, and recurring **3–4 enemy guard groups** about every 8.4–10.2 seconds while that boss remains alive. Reinforcements have a 0.63-second warning and appear at least 565 game units away from the player.
- The new protection logic caps reinforcements in busy arenas. Boss HP does not refill and bosses gain no invincibility.

### More enemies, more visible formations

- The base enemy spawn interval is shortened by a factor of **0.86** (about **16.3% more spawn events per second**); after 75s it is shortened by a further 10%. Ordinary enemy count caps are increased by roughly **14%**. Late enemy selection also contains a higher proportion of runner / brute / caster / hex varieties.
- `swarm-director.js` independently coordinates **three new, clearly announced perimeter groups**: 35s **SCOUT PACK** (5), 66s **IRON FLOOD** (8), and 82s **NULL TIDE** (12). Each group enters in a short staggered burst after a 0.62s warning rather than instantly appearing near the player.
- These are *additional* to the existing DEVORA INVASION kill-quota events (30 / 60 / 90 seconds). They do not change or grant any new score rewards by themselves.
- Swarm spawns originate approximately **565–669 world units** from Ruu; caps prevent unbounded enemy growth and FX quality does not change enemy numbers or difficulty.

### Technical / compatibility notes

- New required root module: `swarm-director.js`; updated `devora-phase3.js` handles cinematic composition and periodic guards. `index.html` passes original `DEVORA_ART` portraits to the new third-form cinematic.
- Existing NORMAL 100s + final-boss clear, ENDLESS, CHALLENGE local-only results, all 16 BGM tracks, 25% support-pilot lottery, ASTRAEA auto emergency, JACKPOT MODE 1%, original ending, and Cloudflare NORMAL / ENDLESS ranking submission remain connected.
- No Cloudflare Worker or D1 migration is required. GitHub Pages should reflect the new version after the usual deployment and a hard refresh.

### Browser QA checklist

1. Activate one of Ruu's nine SIGNATURE skills: confirm the right-side art is visibly larger without covering the top-left HP/drive/finisher UI.
2. Push either boss through 55% and 30% HP; verify the larger third-form sprite, portrait cut-in and brief attack grace, then defeat the final boss.
3. Check PHASE III's golden target-line and SAFE-sector telegraphs, perimeter guards and staggered reinforcement packs; verify no enemies appear on top of Ruu.
4. Play through 35 / 66 / 82 seconds and confirm SCOUT PACK, IRON FLOOD, NULL TIDE announcements, sizes and performance.
5. Compare FX LITE/HIGH, and recheck NORMAL/ENDLESS rankings, CHALLENGE, companion/ASTRAEA, BGM and original ending.

## v1.17.0 — PHASE III REBELLION / LARGER SIGNATURE CUT-INS

### Enlarged the nine normal signature finisher illustrations

- All **nine Ruu SIGNATURE FINISHER** cut-ins remain on the **right-hand side**, safely below the top HUD, but now use a **46% of canvas width × 76% height** image area (up from 37% × 69%). The right-side edge glow is enlarged to match. Tall cut-ins are approximately 10% taller; other image ratios can take advantage of the extra width.
- The nine approved artwork files, skill damage, invocation conditions, and cut-in durations are unchanged. JACKPOT MODE and support-pilot cut-in positions are unchanged.

### Third form for both major DEVORA bosses

- At **55% HP or below**, both the mid-boss **DEVORA** and final boss **NULL EMPEROR** still shift into **PHASE II** with the existing aimed projectile fan.
- At **30% remaining HP**, both now enter **PHASE III**, with gold-tinted shockwaves, distinct boss-nameplate colors, stronger movement/contact damage, and **up to two reinforcements** (runner-type for DEVORA, hex-caster type for NULL EMPEROR). No surprise healing or full invulnerability.
- **TELEGRAPHED TARGET FAN:** after roughly a **1.02-second visible directional warning**, a tightly aimed 7-shot DEVORA or 9-shot NULL EMPEROR fan is fired. The warning line identifies the attack direction.
- **SIEGE NOVA:** after a **1.17-second warning**, a 16-shot DEVORA or 20-shot NULL EMPEROR radial barrage fires, **leaving two visibly highlighted safe corridors**. The green SAFE arcs mark the gaps before the projectiles are released.
- The special attacks alternate at approximately 3.05s for DEVORA and 2.55s for NULL EMPEROR. The ordinary radial volley remains, with a short warning and safe gaps in PHASE III. Enemy bullets have a fixed cap to avoid uncontrolled frame drops.
- FX LITE, AUTO and HIGH preserve the same attack timings and danger warnings. Only optional decorative particles and glows are reduced on lower settings. Boss HUD and DEVORA FILES now document PHASE III.
- Implemented as `devora-phase3.js`, connected to the original `devora-mutation.js` and game `index.html` via versioned scripts, with the phase transition state isolated per boss for easier balancing.

**Unchanged:** 100-second survival + defeat final boss, ENDLESS and CHALLENGE rules, 25% mass-produced support-pilot lottery, ASTRAEA emergency auto-deployment, original 16 music tracks, JACKPOT 1%, online NORMAL/ENDLESS ranking, local challenge record isolation and the ending. **No Cloudflare Worker/D1 migration** is necessary.

### Recommended smoke tests

1. Trigger a signature finisher and check Ruu's cut-in is visibly larger on the right but does not obscure the top-left gauges.
2. Lower either boss beneath 55%, then 30% HP; confirm SECOND FORM then THIRD FORM and corresponding warning labels.
3. In PHASE III, watch for the golden aimed line and siege ring with two green SAFE arcs; try moving into a safe corridor. Confirm summoned bodyguards and alternating volleys.
4. Check FX LITE and HIGH, NORMAL ending and ranking scores, and whether the harder last boss remains fair.

## v1.16.2 — CLEAN ESCORT SPRITE / HIT BREAKS COMBO

- Removed the **permanent elliptical, pilot-colored outline** around the mass-produced ASTRAL-SUIT. The escort remains 64×94 logical pixels, continues walking and firing, and retains all five temporary skill effects and floating labels.
- **Real HP loss resets the ongoing COMBO to zero** and clears its countdown immediately. If the prior chain contained at least six kills, a brief `COMBO BREAK` message shows the broken chain.
- **Fully shield-absorbed hits and invulnerable hits do not break COMBO** because no HP was lost; partial shield penetration does break it. The run's historic maximum combo (`MAX CHAIN`) is kept.
- Bumped the ASTRAEA script reference to `astral-companion.js?v=1.16.2` to discourage browser caching of the old persistent outline.
- No gameplay changes to the 25% escort roll, ASTRAEA emergency activation, music, rankings, JACKPOT 1%, normal/ENDLESS/CHALLENGE rules or ending. **Cloudflare unchanged.**

### Checks

1. In a pilot-winning run, confirm the ASTRAL-SUIT appears **without the former oval ring**.
2. Build a chain, lose HP and check it resets to zero while MAX CHAIN is preserved.
3. Repeat with a fully absorbed shield hit: COMBO should continue. If the shield is insufficient, it should break.
4. Check that the five pilot abilities can still briefly draw their own effect rings during activation.


## v1.16.1 — SUPPORT PILOT SIGNAL VISIBILITY / CACHE PATCH

- **The mass-produced ASTRAL-SUIT is intentionally absent in 75% of runs.** The per-run support roll remains exactly 25% and is not changed by this patch.
- A small **SUPPORT SIGNAL** status beneath the top-middle timer now distinguishes three cases: `NO SIGNAL (25% CHANCE)` when no ally was drawn; `ELIO/OZ/KAI/SERA/MINA INBOUND` while a chosen pilot is running into the arena; and `ACTIVE` once the pilot has joined. `LOAD ERROR` identifies an unloaded support script. This is gameplay HUD only; the start screen remains minimal.
- When a pilot wins the lottery, the START toast announces **ALLIED REINFORCEMENT / PILOT NAME INBOUND**. The same character arrives from the right using the mass-produced suit walking GIF, then begins supporting the player.
- The ASTRAL-SUIT retains its **64×94 logical pixel size** but has a subtle pilot-colored halo, making it easier to see against the dark arena.
- The HTML now references `support-pilots.js?v=1.16.1` and `astral-companion.js?v=1.16.1` to reduce the chance of browser-cached stale gameplay scripts after an update.
- **Unchanged:** 25% mass-produced suit draw, five uniform named pilots, ASTRAEA's low-HP final-boss emergency trigger, 12-second flight, all 16 music tracks, JACKPOT 1%, offline challenges, cloud rankings and ending.

### How to diagnose nonappearance

1. Refresh GitHub Pages with **Ctrl + Shift + R** and confirm version **v1.16.1** on the title screen.
2. Start a run. If the top-center HUD says **SUPPORT // NO SIGNAL (25% CHANCE)**, the random draw lost: there should be no ASTRAL-SUIT.
3. If the HUD says **SUPPORT // PILOT NAME / INBOUND**, look to the right after approximately one second; the suit should join Ruu within approximately 2.5 seconds.
4. When it reads **ACTIVE**, the colored suit and its pilot name should remain visible beside Ruu. If it says ACTIVE but no suit is visible, that points to a rendering/resource problem rather than the random draw.
5. If **LOAD ERROR** is shown, one of the support JavaScript files has not loaded correctly. Recheck the installed GitHub Pages files.

## v1.16.0 — ASTRAEA EMERGENCY FLIGHT CINEMA

ASTRAEA No.3 is now an **animated flying reinforcement** rather than a static mecha tethered to the player.

### New cinematic assets

- **`assets/astraea_emergency_cutin.webp`** — a 1440×810 Ruu Scrivner + ASTRAEA emergency cut-in, preserving the original Guardian Genome / No.3 aesthetic. The art slides into the right half of the battlefield below the top HUD for about 2.15 seconds.
- **`assets/astraea_flight.gif`** — actual transparent eight-frame flight/laser GIF (120ms per frame), separately viewable as a game character animation.
- **`assets/astraea_flight_atlas.webp`** — a 4-column × 2-row WebP frame atlas from that GIF. The Canvas game advances its frames in game-time, including pauses. If the atlas cannot decode, the prior ASTRAEA SVG remains as fallback.

### Flying combat

- The 12-second emergency reinforcement now **visits 12 distinct positions** across the visible 1200×675 combat view. It smoothly accelerates between the left, right, top and bottom of the screen instead of staying beside Ruu, while maintaining a small enemy-facing offset.
- **Laser rifle volleys about every 0.42 seconds** target up to two nearby living enemies, with magenta-and-white muzzle beams, bright impacts, moving trails and afterimages. Graphics quality changes **visual particles only**, never damage, targeting or attack interval.
- The last ~1.2 seconds retain the original large-area **GUARDIAN RESONANCE** finish.
- **Boss safety remains:** ASTRAEA's cumulative damage against each boss is capped at 28% of that boss's max HP, and it cannot land the final hit.
- The mass-produced escort, when selected by the 25% pilot lottery, continues fighting alongside the flying ASTRAEA.

### Unchanged automatic emergency conditions

- The 25% named-pilot escort draw must have succeeded, and Ruu's HP must be at or below **50% at the exact time a final NULL EMPEROR spawns**.
- One ASTRAEA appearance at most per run, about 1.05s after the qualifying boss spawn. No X-key/manual deployment or additional random draw. Later ENDLESS final bosses can retry qualification if the ability is still unused.

**Preserved:** NORMAL 100-second survival and final-boss defeat, ENDLESS, CHALLENGE local record isolation, original 16 music tracks, JACKPOT MODE 1%, existing five pilot abilities, ending and Cloudflare rankings. **No Cloudflare Worker or D1 update required.**

### Browser smoke tests

1. In a named-pilot run, reach the final boss with HP ≤50% to watch the right-hand emergency cut-in.
2. Verify the small ASTRAEA sprite crosses the camera repeatedly, changes pose and shoots visible lasers from its rifle for ~12 seconds.
3. Confirm the same encounter does not trigger when no pilot is present or HP exceeds 50%; repeated deployment must remain blocked.
4. Check FX LITE and HIGH, boss damage cap, ending, music and leaderboard behavior.
5. Force refresh GitHub Pages with Ctrl + Shift + R after deployment if images are cached.

## v1.15.3 — GUARDIAN EMERGENCY / PILOT EFFECTS SURGE

### ASTRAEA: automatic emergency reinforcement, no X button

The **25% mass-produced ASTRAL-SUIT support roll** determines whether there is any named allied pilot (Elio, Oz, Kai, Sera, Mina; 5% of all starts each). ASTRAEA No.3 now automatically intervenes **only if both conditions hold at the exact moment a FINAL boss is spawned**:

1. **That run won the 25% mass-produced pilot roll** (a named support ASTRAL-SUIT is participating).
2. **Ruu's current HP is 50% of maximum or lower**, and Ruu is alive.

There is **no second random roll**. On qualification, ASTRAEA's pink emergency signal appears and the actual 12s deployment begins about **1.05 seconds after the final boss appears**, leaving time for the boss warning. Only one ASTRAEA appearance is possible per run. In ENDLESS, later final-boss appearances can qualify if a previous final encounter did not; once used, it cannot be used again. If Ruu drops below 50% *after* a final boss spawned, it does not retroactively trigger on that boss. Shield points do not alter the HP ratio.

The **old manual X / touch button**, 75-second condition, first-boss defeat requirement, and 100% SYNCHRO requirement **are removed**. The HUD shows a compact **GUARDIAN EMERGENCY** status instead of a SYNCHRO bar. The original ASTRAEA 12-second cinematics, pink wings and volleys, GUARDIAN RESONANCE finish, and **28% max-HP per-boss damage cap** are retained. The final blow still belongs to the player.

### Five dramatic but readable pilot signature effects

Every named support technique now has stronger short-lived visual feedback: larger color-coded impact rings, brighter burst particles, multi-layered beam lines, geometric target and defense markers, and a **compact right-side skill banner displaying WHO acted and WHAT they did**. Each keeps their own WebAudio SFX.

| Pilot | Enhanced visual | On-screen action |
|---|---|---|
| Elio | Triple expanding cyan hex shields and interception sparks | ELIO / SHIELD COVER — SHIELD + |
| Oz | Strong magenta precision beam, crosshair burst and MARKED status | OZ / EXECUTION MARK — +11% DMG |
| Kai | Triple orange muzzle burst, impact trails and CROSS-FIRE | KAI / BURST ASSIST — CROSS-FIRE |
| Sera | Layered silver field rings, slowing links and gauge feedback | SERA / SUPPORT FIELD — DRIVE +4 / FINISHER +3 |
| Mina | Teal multi-target scan boxes, pickup lines and invasion reward flare | MINA / TARGET SCAN — SCANNED / COLLECT |

All visuals are event-timed rather than permanent screen coverage. LITE still shows the informative labels but reduces particles/glows; AUTO and HIGH are more elaborate. Enemy-danger telegraphs remain the priority. Core skill intervals, damage and shield numbers are otherwise unchanged: the upgrade makes support **more obvious**, not an automatic win.

**Preserved:** normal 100-second clear and final-boss defeat, ENDLESS and CHALLENGE rules, all 16 soundtrack tracks, 1% JACKPOT MODE, the ending, original mass-produced escort probability 25%/75% absent, online NORMAL/ENDLESS ranking and separate offline challenge results. **No Cloudflare Worker/D1 migration is required.**

### v1.15.3 tests to perform in-browser

1. With no pilot selected, confirm no mass-produced suit and no ASTRAEA automatic dispatch.
2. With a pilot selected and HP at **50% or lower when NULL EMPEROR appears** (around 84s), confirm automatic signal and ASTRAEA dispatch about 1s later, without X or tapping.
3. With HP **above 50% at the boss's arrival**, confirm no dispatch even if HP later falls during that encounter. Confirm one use maximum.
4. Observe five pilot support banners and amplified effects; ensure warning circles/aim lines stay visible in FX LITE/HIGH.
5. Recheck NORMAL/ENDLESS scores, CHALLENGE isolation, original soundtrack, and the ending.

## v1.15.2 — FIVE CINEMATIC SUPPORT PILOT CUT-INS

- Adopted the **five full cinematic Guardian Genome recruitment illustrations** from the creator's approved Elio, Oz, Kai, Sera and Mina posters, in this exact order.
- New optimized **AVIF atlas**: `assets/support-pilot-cutins.avif` (**5 × 320×569**, approximately **54 KB** total). The entire tall image is drawn, including faces and bottom nameplates. There is **no face-cropping rectangle**.
- The right-hand entry illustration sits **below the HUD**. A separate readable overlay says **「星屑の鎧 - Guardian Genome - から参戦」**. The original small WebP face atlas remains as a fallback if AVIF is unsupported.
- Preview the five exact game-used posters in **DEVORA FILES → SUPPORT PILOT GALLERY**, with previous/next controls. The title screen is unchanged, avoiding extra start-menu clutter.
- The 25% chance of getting **any** ASTRAL-SUIT, five uniform support pilots (5% of all runs each), signature effects, ASTRAEA No.3, normal/endless/challenge modes, 16-track soundtrack, and rankings are preserved.
- **No Cloudflare or D1 migration**. Browser playthrough and Pages cache-refresh validation are still pending.


## v1.15.1 — MASS-PRODUCED SUPPORT PILOT / EFFECTS UPDATE

**The 25% roll now controls whether the mass-produced ASTRAL-SUIT appears at all.** The other 75% of runs have no escort, no escort shots, and no escort projectile interception. On a success, exactly one named pilot is selected uniformly (5% of all runs per pilot). This corrects the former behavior where an anonymous ASTRAL-SUIT appeared on unsuccessful rolls. **ASTRAEA No.3 remains a separate special reinforcement and can still deploy without any escort.**

All five support actions now have a dedicated **color, short readable action label, geometric effects, target marks, and character-distinct WebAudio sounds** (compatible with SFX OFF). FX AUTO / HIGH / LITE scales particle counts, while danger telegraphs remain visible.

| Pilot | Readable skill label | Visual feedback |
|---|---|---|
| Elio | ELIO / SHIELD COVER | Cyan hexagonal shield around Ruu, blue interception shards and SHIELD +8 |
| Oz | OZ / EXECUTION MARK | Magenta crosshair on the chosen elite/boss, visible MARKED target, sniper beam, +11% damage window |
| Kai | KAI / BURST ASSIST | Orange multi-ray burst, muzzle flash and CROSS-FIRE target hits |
| Sera | SERA / SUPPORT FIELD | Silver expanding support field, SLOW marker under enemies, DRIVE +4 / FINISHER +3 text |
| Mina | MINA / TARGET SCAN | Teal target boxes and scan lines, XP pickup tether / COLLECT feedback, INVASION BONUS label |

**Intro improvement:** The existing five-person portrait atlas is displayed larger with the complete image tile rather than a face-clipping rectangle. The entry panel explicitly says **「星屑の鎧 - Guardian Genome - から参戦」** above the selected pilot's name. The original portrait sheet is still the canonical reference, and the escort continues to run in from the right. The complete five-poster cinematic artwork was subsequently adopted in **v1.15.2**, replacing the initial portrait tiles while retaining them as a compatibility fallback.

Gameplay numbers and mode restrictions from v1.15.0 are otherwise unchanged. Only presentation and the escort-presence probability were corrected. No Cloudflare migration is needed.


## v1.15.0 — MASS-PRODUCED SUPPORT PILOT

**A one-time 25% reinforcement roll at the start of every NORMAL, ENDLESS, or CHALLENGE run.**
If successful, one of the five Guardian Genome / 18th-generation pilots is selected uniformly
(**5% probability per named pilot across all runs**). This is an in-game crossover appearance
and does not change the original story's character status. The other **75%** of runs have **no mass-produced ASTRAL-SUIT escort**.
(For release history: this corrects the initial v1.15.0 anonymous-escort behavior.)

**Arrival cinematic:** ~0.95s after game start, a named pilot portrait appears in the
**right-side cut-in lane**, under the upper HUD. Their mass-produced ASTRAL-SUIT then
**runs in from off-screen right** using the existing walking GIF, reaches Ruu after ~1.55s,
and becomes the companion for that run. The 5 cut-in portraits are cropped from the owner's
five supplied official character sheets and packed into one optimized 6.4 KB WebP atlas.
Cut-ins do not cover the upper-left gauges. The selected pilot is displayed next to the
escort and on the result screen; a failed roll gives the standard escort.

### Distinct pilot support roles (moderate bonuses, no automatic win)

| Pilot | Role | In-game effect |
|---|---|---|
| **Elio Warden** | GUARD / SANCTUARY | Escort interceptions recharge in ~5.5s instead of 9.5s. Grants up to 8 shield points every ~10.3s (18 minimum shield capacity). |
| **Oz Redact** | MARKSMAN / EXECUTION | Every ~6.6s marks a nearby strong enemy for 4.5s, with a precision shot; marked targets take ~11% more damage during the mark. |
| **Kai Trace** | ASSAULT / CROSS-FIRE | Escort fires two smaller shots at a quicker ~0.92s cadence and periodically attacks up to two nearby enemies. |
| **Sera Note** | CONTROL / STILL LIGHT | Every ~8.3s slows nearby enemies and grants +4 DRIVE and +3 FINISHER charge. |
| **Mina Phase** | RECORD / RECOVERY | +24 XP pickup range, +12% collected XP after arrival, bonus recovery pull, and +12% score for successful DEVORA INVASION repels. |

**Rules:** Each run rolls exactly once; character selection is uniform among five,
without repeat prevention or subsequent rerolls. It is a single **named version** of the
existing companion, not a second companion. ASTRAEA No.3's 75s / DEVORA defeat /
100% SYNCHRO special deployment stays separate and unchanged.

**Unchanged:** Normal 100s + final boss clear, ENDLESS, CHALLENGE restrictions and offline
record isolation, all 16 tracks, JACKPOT MODE 1%, the original 53s ending and Cloudflare
NORMAL/ENDLESS leaderboards. **No Cloudflare update required.**

Required new files:
- `support-pilots.js` (pilot randomization, ability timing and cut-in renderer)
- `assets/support-pilot-faces.webp` (5 portraits in Elio / Oz / Kai / Sera / Mina order)
- Existing `astral-companion.js` is updated with run-in choreography and dynamic support rates

### v1.15 validation checklist

1. Across many runs, most starts show the normal escort. A successful 25% roll shows a named right-side portrait and running arrival.
2. Verify each of the five skills and the pilot's name in the result screen.
3. Verify the ordinary escort still shoots and intercepts, and ASTRAEA still deploys after its original requirements.
4. Confirm the 16 tracks, JACKPOT 1%, NORMAL/ENDLESS ranking and CHALLENGE score isolation.
5. Check desktop/mobile layout, FX LITE and the right-side signature cut-ins.

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
- `support-pilots.js`, `assets/support-pilot-faces.webp` — v1.15 named 25%-chance support pilots and their cut-in portrait atlas.
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
