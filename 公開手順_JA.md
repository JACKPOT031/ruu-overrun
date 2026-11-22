# RUU//OVERRUN — GitHub公開・更新手順（v1.19.0 PUBLIC BETA）

## v1.19.0 — 真のボスDEVORA・三体／五体同時戦闘

- スタート画面の説明から「100秒を生き残り、最後のボスを倒せ。」を撤去。「押し寄せる侵食を生き抜き、最後の脅威を撃ち砕け。」に変更。「一定確率で『星屑の鎧 -Guardian Genome-』のキャラクターが参戦。」も追加。
- ボスの第3形態を現行版から**さらに見た目20％拡大**（初期サイズ比1.536倍）。当たり判定は前版から約10％拡大。予兆・既存カットインを維持。
- NULL EMPEROR撃破後、従来のボス撃破演出に続き**真のボスDEVORAが通常3体、10％の確率で5体出現**。中ボスからは出現しない。出現判定は1回だけ。
- **3体／5体で別々の専用カットイン画像**を表示。5体ではさらに暗い赤紫の侵食・画面端の発光・ノイズ線・専用文言を加える。約2.65秒の演出中はルーに短い無敵を付け、正体不明の敵が見えない間の理不尽な被弾を防ぐ。
- 真のボスは装飾ではなく**独立したHPと攻撃AIを持つ実際の敵**。キャラクターの見た目はルーのおよそ2倍（288px）。追跡型、狙撃型、包囲型に加え、5体モードでは拡散型と連射型を追加。
- 耐久力はレベルで上昇し、**被ダメージ26％軽減**。全個体を撃破しない限りNORMAL／CHALLENGEの勝利・エンディングへ移行しない。全体HPバーと各個体のHPバーで残数を示す。
- ボスの攻撃には方向線・円形予兆と逃げ道を残す。5体時は敵弾上限を維持して処理落ちを抑え、強力ながら避けられる戦闘を目指す。
- ASTRAEAのボス最大HP28％支援ダメージ上限と止めを刺さない制限は、真のDEVORAにも適用。Ozの狙撃支援も真のボス扱い。
- 新規モジュール `devora-true-end.js` と画像 `assets/devora_true_end_three.webp`、`assets/devora_true_end_five.webp` を追加。`index.html`、`devora-phase3.js`、`astral-companion.js`、`support-pilots.js` を更新。
- **Cloudflare Worker／D1変更不要**。GitHub Pagesで `Ctrl + Shift + R` を押してタイトルがv1.19.0になったか確認。NORMALクリア・エンディング、CHALLENGE、ENDLESS、16曲、ランキングも確認する。

## v1.18.0 — SWARM OVERRUN / ボス大型化・群れ強化

- ルーの通常必殺技9種類のカットインを**右側横52％・縦82％**に拡大。上端は画面の16％位置から始まり、左上のHP・ゲージを隠さない。
- DEVORAとNULL EMPERORの**第3形態（残HP30％以下）**を見た目1.28倍、実際の当たり判定半径1.17倍に拡大。ボスHPの全回復や無敵化は行わない。
- 第3形態移行時に既存のDEVORA／NULL EMPERORキャラクター素材を使った約1.38秒の**ボス専用カットイン**を表示。日英の専用タイトルと金色の侵食エフェクトを加える。変身演出中はボス攻撃に短い猶予を設定。
- 第3形態の既存の予兆付き狙撃・SAFE付き包囲弾幕・黄金色ボスバーを維持。ボスごとに最初の護衛を最大2体、さらに約8〜10秒間隔で3〜4体の雑魚増援を出す。
- 通常敵の基本スポーン間隔を約14％短縮し、**出現回数を約16％増加**。75秒以降はさらに10％短縮。通常敵の同時出現上限は約14％上げ、後半はrunner・brute・caster・hexの割合を増やす。
- **新しい群れ増援**：35秒にSCOUT PACK（5体）、66秒にIRON FLOOD（8体）、82秒にNULL TIDE（12体）。0.62秒程度の予告から外周に時間差で出現し、ルーの目前には突然出さない。
- 既存のDEVORA INVASION（30／60／90秒）とは別イベント。重複を想定して群れの上限・出現間隔を設定。FX LITEでも危険攻撃の予兆を優先して描画する。
- **追加必須ファイル**：`swarm-director.js`。更新ファイル：`devora-phase3.js`、`index.html`、README、本書。
- NORMALのクリア条件・ENDLESS・CHALLENGE・量産機25％・ASTRAEA緊急参戦・JACKPOT 1％・BGM16曲・ランキング・EDは従来どおり。
- **Cloudflare更新は不要**。GitHub Pages公開後 `Ctrl + Shift + R` で再読み込みし、タイトルにv1.18.0が表示されるか確認する。

## v1.17.0 — 第3形態のボス戦・通常必殺技カットイン拡大

- ルーの通常必殺技9種の右側カットインを**横46％×縦76％**の表示領域に拡大（旧・横37％×縦69％）。左上のHP・各種ゲージを隠さないよう、表示開始位置は画面上端から18％に維持。
- DEVORA（中ボス）とNULL EMPEROR（最終ボス）は、従来のHP55％での第2形態に加え、**残HP30％以下で第3形態**へ移行。
- 第3形態では金色の強化エフェクト、護衛の追加（混雑状況に応じ最大2体）、より強い通常弾幕、狙撃扇状弾幕と広域包囲弾幕を交互に展開する。
- **狙撃**は約1.02秒の直線予兆、**包囲弾幕**は約1.17秒の円形予兆を表示。包囲弾幕には**緑色で示す2方向の安全な抜け道（SAFE）**を残す。
- ボスの第三形態は、回復・無敵によって無理やり長引かせない。避けられる攻撃で高難度を目指す。
- 新しい`devora-phase3.js` を `index.html` と同じ場所へ追加。`devora-mutation.js`・`index.html` も同期して更新。GitHub Pagesの再読み込み後に確認する。
- FX LITE / HIGHのどちらも重要な予兆表示を維持する。既存のクリア条件、量産機25％、ASTRAEA、JACKPOT 1％、全16曲、ランキング、EDは変更なし。
- Cloudflare Worker / D1に変更は不要。公開後は `Ctrl + Shift + R` でキャッシュを更新し、タイトルに **v1.17.0** が表示されることを確認。

## v1.16.2 — 量産機の常時表示の○を撤去、被弾時にコンボをリセット

- 量産機の周囲に常時表示していたパイロット色の楕円発光枠を削除した。量産機の歩行、射撃、固有スキル発動時の一時的なエフェクトは維持。
- **HPダメージを受けた時点でCOMBOを0、コンボタイマーを0にする。** 6コンボ以上で被弾した場合は短時間「COMBO BREAK」と表示。
- シールドで完全吸収した場合・無敵中の攻撃ではリセットしない。シールドを突破してHPが減った場合はリセット。最大コンボ記録は維持。
- `index.html` と `astral-companion.js` を更新。量産機用スクリプトにはキャッシュ更新用のバージョン指定を付けた。
- 量産機の出現率25％、ASTRAEAの緊急自動参戦、ランキング、JACKPOT 1％、16曲、エンディングは変更なし。Cloudflare側の更新は不要。
- GitHub Pagesで `Ctrl + Shift + R` を押し、タイトルが **v1.16.2** と表示されることを確認する。


## v1.16.1 — 量産機の抽選結果・表示状態を可視化

- 量産機の出現率は従来どおり **各プレイ25％**。75％のプレイでは量産機が登場しないのが仕様で、出現率は変更していない。
- プレイ中の画面上部・中央に **SUPPORT // NO SIGNAL (25% CHANCE)**（抽選外れ）、**SUPPORT // パイロット名 / INBOUND**（登場中）、**ACTIVE**（合流後）を表示。
- JavaScriptを読み込めなかった場合は **SUPPORT // LOAD ERROR** と表示するため、抽選外れと不具合を区別できる。
- 当選したゲームでは、開始時の通知にもパイロット名と「INBOUND」を表示。量産機はゲーム開始約1秒後に右側から走り、約2.5秒でルーに合流。
- 量産機のサイズは従来の64×94のまま。薄い色付きの発光枠で見えやすくした。
- `index.html` から読み込む `support-pilots.js` と `astral-companion.js` にバージョン指定を付け、古いキャッシュが残りにくいようにした。
- GitHub Pagesに反映後、**Ctrl + Shift + R** で再読み込み。タイトルに **v1.16.1** と表示されたか確認。
- 25％の抽選、5人の固有能力、ASTRAEAの緊急自動参戦、JACKPOT 1％、16曲、ランキング、EDは変更なし。Cloudflare更新も不要。

## v1.16.0 — ASTRAEA 飛行GIFとレーザー戦闘

- ASTRAEAの緊急参戦カットインに、ルー・スクリヴナーとASTRAEA No.3の新しい16:9イラストを採用。右側・上部HUDより下で表示。
- 追加素材は `assets/astraea_emergency_cutin.webp`（カットイン）、`assets/astraea_flight.gif`（8コマ・透過飛行GIF）、`assets/astraea_flight_atlas.webp`（ゲーム描画用8コマアトラス）。
- 12秒の支援中は画面の上下左右を巡回する飛行パターンを実装。銃口からの桃色レーザーが約0.42秒ごとに敵を追尾し、着弾光・飛行残像も描く。
- 量産機サポート当選（25％）＋最終ボス出現時にルーのHPが50％以下、という自動出撃条件は維持。出撃は1プレイ最大1回。
- ASTRAEA単独ではボスに止めを刺さず、ボスの最大HP28％までの累積支援ダメージ上限も継続。FINISHER等の既存機能、16曲、JACKPOT 1％、ランキングは維持。
- `astral-companion.js`、`index.html`、READMEと本案内をGitHubに更新。画像素材3ファイルもルートの `assets/` に追加。
- ブラウザで `Ctrl + Shift + R` を押してキャッシュを更新し、飛行経路とレーザー発射、12秒後の消失を確認する。Cloudflareの設定変更は不要。

## v1.15.3 — GUARDIAN EMERGENCY / SUPPORT PILOT強化

- 量産型ASTRAL-SUITの出現確率は引き続き25％。当たったときだけ5人のパイロットから均等抽選。**量産機なしの75％ではASTRAEAも自動発動しない**。
- **最終ボス（NULL EMPEROR）出現時のルーのHPが最大HPの50％以下**、かつ量産機のパイロットが参戦している場合、ASTRAEA No.3の緊急出撃を予約。約1.05秒後に自動発動する。別の乱数抽選は行わない。
- 最終ボス出現時にHPが51％以上なら、同じボス戦の途中でHPが減っても後追い発動はしない。ENDLESSの次の最終ボス出現時には改めて判定可能。ただしASTRAEA発動は1プレイ最大1回。
- SYNCHRO 100％・75秒生存・最初のDEVORAボス撃破・Xキー／専用ボタンによる手動出撃は廃止。HUDには「GUARDIAN EMERGENCY」の状態だけ表示する。
- ASTRAEAの12秒の支援・専用演出・一体のボスへの最大28％ダメージ上限（止めを刺さない仕様）は維持する。
- 量産機の5人のスキル発動時は、色付きの大きな衝撃波・弾道・装甲破片・照準／解析マーク・短い右側のスキル名表示を追加。専用SEも継続。
- 変更対象：`index.html`、`astral-companion.js`、`support-pilots.js`。READMEと本書のバージョンも合わせて更新。
- GitHub Pages公開後に`Ctrl + Shift + R`で再読み込みし、最終ボスの出現時刻とHP判定を確認する。Cloudflare Worker / D1の再設定は不要。

## v1.15.2 — 5人の映画風カットインを正式採用

- エリオ／オズ／カイ／セラ／ミナの映画風ポスターを、ゲーム内の実際のカットイン画像として採用。
- 追加ファイル `assets/support-pilot-cutins.avif` は5枚をまとめた軽量画像（320×569px×5、約54KB）。顔・髪・名前の下部まで画像を**切らずに表示**する。
- カットインは従来どおり画面右側、上部HUDより下。別の読みやすい文字として「星屑の鎧 - Guardian Genome - から参戦」を併記。
- **DEVORA FILES → SUPPORT PILOT GALLERY** から5人全員の実際のカットインをいつでも鑑賞できる。スタート画面には新しいボタンを増やさない。
- 旧WebP顔アトラスはAVIF非対応環境の予備表示用に残す。
- 量産機の出現率25%／75%は量産機なし、5人均等、各キャラの固有エフェクト、ASTRAEA No.3の独立出撃は変更しない。
- GitHubの `main` へ反映。Cloudflare側の追加設定は不要。ブラウザで `Ctrl + Shift + R` して最新化を確認。

## v1.15.1 — MASS-PRODUCED SUPPORT PILOT 演出強化

- **量産型ASTRAL-SUITの出現自体が25％**。75％のプレイでは量産機も通常射撃・敵弾迎撃も発生しない。
- 出現時は5人均等抽選。エリオ／オズ／カイ／セラ／ミナ各5％（全プレイに対する割合）。
- 右側カットインの肖像を拡大し、顔画像の全体と「星屑の鎧 - Guardian Genome - から参戦」を表示。
- 5人それぞれに色・専用SE・スキル名・エフェクト・対象マーカーを追加。FX LITEでも危険予兆を隠さない。
- **ASTRAEA No.3は量産機の抽選と独立**。従来の条件で出撃可能。
- 変更ファイルは `support-pilots.js`、`astral-companion.js`、`index.html`。他にREADME・本手順を更新。
- GitHub Pagesで公開後 `Ctrl + Shift + R` で再読み込み。Cloudflareの更新は不要。

## v1.15.0 MASS-PRODUCED SUPPORT PILOT の更新

- 新規 `support-pilots.js` と `assets/support-pilot-faces.webp` を配置。あわせて更新版 `index.html`、`astral-companion.js`、`survival-trials.js` を使う。
- 各ランの開始時に1回だけ **25％** の確率で増援抽選。選ばれた場合はエリオ・オズ・カイ・セラ・ミナの5人から均等抽選（各人5％）。外れた場合は従来の匿名量産機が同行する。
- 当選すると右側のカットイン（提供されたキャラクターシートから加工した顔写真）を表示し、量産型ASTRAL-SUITが右側から走ってルーに合流する。以後、パイロット別の支援性能が適用される。
- ASTRAEA No.3は別枠の特殊支援機。従来の出撃条件・12秒継続を維持。
- スタート画面は簡潔なままにする。抽選条件を長文で書き足さない。
- CloudflareのデータベースやWorkerには変更なし。既存のNORMAL／ENDLESSランキングとCHALLENGEローカル記録はそのまま。
- GitHub Pagesの反映後、`Ctrl + Shift + R` でキャッシュを更新して確認。

## v1.14.0 SURVIVAL TRIALS 追加情報

- 新しい `survival-trials.js` を `index.html` と同じリポジトリ直下に置く。GitHub Pages上では通常の自動更新対象になる。
- 戦闘中の30秒、60秒、90秒のDEVORA INVASION、HP25%以下のLAST STAND、およびクリア後のCHALLENGE MISSIONS（3種）を実装。
- チャレンジ記録はブラウザのlocalStorageで管理し、**NORMAL/ENDLESSのオンラインランキングには絶対に送信しない。** 専用称号を解放して選択できる。
- チャレンジ中も元の100秒生存・最終ボス撃破という条件は維持する。
- JAM/PACKなど既存のゲームモード、BGM16曲、JACKPOT MODE 1％、ASTRAEA出撃、53秒EDは継続。
- Cloudflare D1 / Workerには新しい作業は不要。GitHub側の `index.html`、`public-features.js`、`survival-trials.js` が整合していればよい。
- ブラウザで `Ctrl + Shift + R` を実行し、タイトルのv1.14.0表記、通常戦闘の侵攻予告、クリア後のチャレンジメニュー、結果のランキング送信防止を確認する。

## 既存の公開環境を更新する場合（v1.12.0）

- 更新するのは **GitHub の `main` ブランチ** のゲームコード。GitHub Pages が `main/(root)` 公開設定なら、通常は変更後に自動反映されます。
- 新しい `devora-mutation.js` は **必須ファイル**。`index.html`、`visual-overdrive.js`、`premium-overdrive.js` などと同じリポジトリ直下に置きます。
- 敵の変異（FRENZY / OVERLOAD / FRACTURE / BULWARK）、ボス第二形態（HP55%以下）、新しい撃破演出はゲーム側の更新だけで有効です。
- **v1.12.0のためのCloudflare D1 / Workerの追加更新は不要**です。2026-11-22にv1.11.0のランキングマイグレーションを済ませているため、既存のNORMAL/ENDLESSランキングをそのまま使います。
- 通常モード100秒、ENDLESS、16曲、JACKPOT MODE 1%、13秒無敵、53秒EDなどは継続。
- 変更後はブラウザで `Ctrl + Shift + R` を押して強制再読み込みし、DEVORA FILESに変異4系統の説明が現れるか確認してください。
- 不具合時は GitHub の変更履歴から `index.html` と `devora-mutation.js` の整合する版に戻してください。

---

## 新規に公開する場合（初回向け手順）


## まずは「URLで誰でも遊べる」状態へ

このフォルダには16曲と画像がすべて含まれています。**外部公開に必要な楽曲・画像の権利を確認したうえで**作業してください。GitHubで公開すると音源・画像ファイル自体も一般公開されます。

1. `https://github.com/new` を開き、所有者 `JACKPOT031`、リポジトリ名を `ruu-overrun`、公開範囲を **Public** にして作成。既存の音楽ツール用リポジトリは使わない。
2. このフォルダ（`RUU_OVERRUN_PUBLIC_BETA`）をPC上で展開する。
3. Gitが入っている場合、展開先のフォルダでPowerShellまたはGit Bashを開いて次を実行。

```bash
git init
git branch -M main
git add .
git commit -m "Release RUU//OVERRUN public beta"
git remote add origin https://github.com/JACKPOT031/ruu-overrun.git
git push -u origin main
```

※ すでにGit管理されているフォルダでは不要な初期化をしないでください。`git remote -v` で接続先を確認してください。GitHubへのログインが求められたら、画面の案内に従って認証します。

4. 作成したリポジトリで **Settings → Pages → Build and deployment → Source: Deploy from a branch → main / (root) → Save**。
5. Pages欄の **Visit site** から実際の公開URLを確認。予想される形式は `https://JACKPOT031.github.io/ruu-overrun/` ですが、**公開を確認するまでこのURLが利用可能とは断言できません。**

これでゲームと「X投稿画面を開く」「結果画像を保存」は使えるようになります。共通ランキングは次の設定が必要です。

## 共通ランキング（Cloudflare Worker + D1）

GitHub Pagesは静的サイトなので、全員のスコアを保存するには別のデータベースが必要です。

1. Cloudflareアカウントを用意し、Node.jsをインストール。
2. ゲームの `backend` フォルダ内でターミナルを開く。
3. 以下を実行。

```bash
npx wrangler login
npx wrangler d1 create ruu-overrun-ranking
```

4. `wrangler.toml.example` をコピーして `wrangler.toml` に改名。表示された `database_id` を設定。
5. リポジトリを `JACKPOT031` 以外で公開した場合、`ALLOWED_ORIGINS` を**実際のGitHub Pagesのオリジン**に変更（`/ruu-overrun/` のようなパスは付けない）。
6. 次を実行。

```bash
npx wrangler d1 execute ruu-overrun-ranking --remote --file=./schema.sql
npx wrangler deploy
```

7. 出力された実際の Worker URL（`https://...workers.dev`）を、ルートにある `leaderboard-config.js` の `apiUrl` に記入。`siteUrl` には確認済みのGitHub Pages URLを記入。
8. `leaderboard-config.js` の変更をcommit/push。Pagesが再公開されたら「ランキングを見る」で確認。

パスワード、APIトークン、Xの秘密鍵はGitHubの公開ファイルに**絶対に書かない**でください。

## 仕様と注意

- プレイヤー名は最大16文字（本名を使わずニックネーム推奨）。結果画面から手動送信。
- ブラウザごとに最高スコアを保存し、全体ランキング上位30人を表示。
- 記録の削除は同じブラウザからの操作を用意しています。
- Xのボタンは投稿文とURLをセットした**投稿画面**を開く。自動投稿はしません。
- 結果画像は「結果カード保存」からPNG形式で取得し、Xで手動添付できます。
- 現状はログイン不要の**交流向けランキングβ版**です。クライアント側のスコアを検証できないため、不正なスコアの送信を完全には防止できません。大会や賞品に関わるランキングとして使う前にはサーバー側での検証が必要です。
- GitHub公開によりゲーム内のBGM・画像を第三者も取得可能です。『Moonphase Refrain - Lyrics by 立春』など協力制作が含まれる場合、公開配布条件を確認してください。

## 将来的に追加できるもの

- アカウント認証・ランキング通報・不正スコアの検知
- 今週／今月／累計ランキング
- 難易度やモード別のランキング
- X結果画像のワンアクション共有（API認可が必要）
