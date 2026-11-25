# RUU//OVERRUN — PUBLIC BETA (v1.40.2)

JACKPOTØ31が制作するオリジナル・ブラウザサバイバルアクション。

**[ゲームを遊ぶ](https://jackpot031.github.io/ruu-overrun/)** / **[公開開始v1.5.3からの更新履歴](./CHANGELOG.md)**

## v1.40.2 — INTERFACE REFINEMENT

- タイトル、戦闘HUD、強化選択、結果、図鑑、実績、衣装、装備・支援、設定、ランキングの視認性・配色・操作を整理。
- 狭い画面で長いメニューが上端で切れる問題を修正。結果からタイトルへ戻るボタンと、操作ガイド・詳細設定の折りたたみを追加。
- 強化確率の説明は折りたたみ式に変更（抽選値はそのまま）。武器HUDの不要なDOM再生成を抑制。
- 音源・楽曲・戦闘進行・難易度・報酬・解放条件は維持。

## v1.40.1 — NEON FRONTLINE

- 新しいキービジュアルを採用。ルー、デヴォーラ、タイトルロゴを隠さない全体表示と、画像下部の独立したメニューへ変更。
- PCは横並びの操作パネル、スマホは縦にスクロールできるレイアウト。既存のメニュー、ランキング、自己ベスト、設定を維持。
- 効果音・楽曲・ゲーム進行・報酬・解放条件は変更なし。

## v1.40.0 — SLASH WIND / G SAMPLE ADOPTION

- 試聴で選定したG「スラッシュ・ウィンド」をゲーム用効果音に採用。短い吸い込み、風を切る刃、交差する斬撃、広がる風の解放を音の軸にする。
- 通常射撃・命中・撃破・回収と基準必殺技には、承認された試聴用WAVの48kHz・16bit・ステレオPCMを直接収録。最初のテイクは元の波形を保持し、役割ごとの音量関係を維持する。
- その他の武器・警告・報酬・必殺技も同じ風と切断の素材から組み立てる。9種類の必殺技と3種類のJACKPOTは、間隔・重なり・広がりを変えて鳴り分ける。
- タイトルとプレイ中の試聴はGの通常射撃音。AUDIOボタン／OキーでBGM・SFX音量を個別に変更でき、ミュートと設定保存も継続する。
- 音源はページと同時に読み込み、必要なPCMを小分けに準備してキャッシュする。音源データが利用できない場合は、簡潔な風切り音で動作を継続する。

検証: `node tests/audio-engine.test.cjs`、`node tests/audio-integration.test.cjs`、`node tests/audio-mixer.test.cjs`、`node tests/title-screen.test.cjs`。承認済み音源との一致、連続発音時の重なり、音量・ミュート・キャッシュを確認する。音源の再生成は `python tools/build_slash_samples.py`。

## v1.39.0 — SPELL RESONANCE / DANMAKU AUDIO

- 発射・命中・撃破・回収を中心に、音程と立ち上がりが明瞭なオリジナルの弾幕STG調効果音へ変更。通常射撃は短い電子音、命中は控えめな刻み、撃破は丸みのある破裂と小さな下降音、回収は短いきらめきにする。
- 倍音が整った音色を中心にし、通常戦闘のノイズ成分と長い余韻を抑える。頻出音のバリエーションは音程差を小さく保ち、連続再生が不規則な旋律にならないよう調整。
- 必殺技には発動直後の明確な合図を置き、その後に鈴・開いた和音・広がる余韻を展開。華やかな音の連なりは必殺技や報酬に配分する。
- 被弾は短い警告、死亡は下降する独立したミスの合図として区別。ゲーム内の各イベントを同じ音量・長さで扱わない。
- タイトルとプレイ中の効果音試聴を、通常射撃音へ変更。戦闘中でも試聴が射撃の発音間隔を消費しないようにする。
- BGM/SFX独立音量、プレイ中のAUDIO/O、ミュート、設定保存、位置による命中音、重要音を聞かせる一時的な音量補正を継続。

検証: `node tests/audio-engine.test.cjs`、`node tests/audio-integration.test.cjs`、`node tests/audio-mixer.test.cjs`、`node tests/title-screen.test.cjs`。音源の波形・反復時の重なり・発音制御、試聴と戦闘の連携、保存とミュートを確認する。信号・操作の検証と主観的な聴感評価は区別する。

## v1.38.0 — SPECTRAL FORGE / LAYERED COMBAT AUDIO

- ルーのエネルギー攻撃と、金属・結晶の破砕を軸に効果音を再構成。立ち上がり、音の芯、細かな質感、余韻を別々に作り、通常攻撃・命中・撃破を聞き分けやすい設計へ変更。
- 中低域を一律に削る処理をやめ、音の役割ごとに帯域と余韻を調整。低い音程へ落ちる太鼓状の共鳴は使わず、非周期的な圧力・摩擦の質感で厚みを作る。
- 頻繁に鳴る音に複数の音色バリエーションを用意。同じ音の連続再生を避け、ゲーム進行の乱数と独立して選択する。
- 大きな演出では通常の戦闘音を短く抑え、必殺技・ボス・報酬の合図を前に出す。チャージと放出、ステレオの余韻は重要な音に配分する。
- ルー自身の射撃音はプレイヤーの位置を基準にし、遠くの標的を狙っても発射音の芯を保つ。命中・撃破は敵の位置に応じて鳴る。
- BGMの一時的な音量補正を演出ごとに調整。必殺技の出だしを支え、JACKPOT専用曲の入りは軽い補正にする。通常の連射や命中ではBGMを下げない。
- プレイ中のAUDIOボタン／Oキー、BGM・SFX独立音量、ミュート、試聴、設定保存を継続。

検証: `node tests/audio-engine.test.cjs`、`node tests/audio-integration.test.cjs`、`node tests/audio-mixer.test.cjs`、`node tests/title-screen.test.cjs`。音源とゲームの連携、波形・発音制御・キャッシュ上限、音量操作を確認する。信号の検証と実際の聴感評価は区別する。

## v1.37.0 — SIGNAL EDGE / DISCHARGE & CUT

- 射撃・命中・撃破・武器音を、短い発射音、放電、切断の質感へ再設計。前版で音の大半を占めていた低い共鳴や、低音へ落ち着く打撃の音源を置き換える。
- 必殺技はチャージからエネルギーが走る構成に変更し、9種類の違いを放電の動き・切断・連射の構成で表す。ボスやJACKPOTの音も同じ音響設計へそろえる。
- 低HP警告とBLOOD VEILの心拍状の低音を、短い電気的な警告・放電へ変更。回収音や操作音は短く保ち、連続する戦闘音に長い響きを重ねない。
- 音を重ねた後にも低域を抑え、歪みで新たな胴鳴りが発生しにくくする。音の強さは中高域の立ち上がり、音の動き、チャージと解放の差で作る。
- タイトルSETTINGSとプレイ中AUDIOの効果音試聴を、同じレール放電音に統一。BGM/SFX個別音量、ON/OFF、保存、Oキーでの開閉は引き続き使える。
- 同時発音上限、重要音の優先、ゲームの乱数と独立した音生成、分割事前生成とキャッシュを継続する。

検証: `node tests/audio-engine.test.cjs`、`node tests/audio-integration.test.cjs`、`node tests/audio-mixer.test.cjs`、`node tests/title-screen.test.cjs`。音源の低域比率と余韻、波形の上限、発音制御、BGM処理、設定UIを確認する。周波数の検証は音色の設計を確かめるためのもので、聴感の評価を代替するものではない。

## v1.36.0 — CYBER IMPACT / LIVE AUDIO MIXER

- 射撃・命中・爆発に、短い立ち上がりと持続する中低域の芯を追加。FM、リング変調、歪み、ゲート状の連射を組み合わせ、重さのあるサイバー音へ再設計。低域は中央、短いステレオ残響は高域に配置する。
- 9種類の必殺技を、二連砲撃・金属の打撃・加速連射・吸い込み・上昇旋回・心拍・規則的なゲート・不規則なグリッチ・三連斬撃という異なる構成に変更。JACKPOT・ボス登場・進化などの重要な合図も厚くする。
- 結晶回収とメニュー音は短く整理。必殺技・JACKPOT・ボス登場・進化時はBGMを一瞬だけ滑らかに下げ、効果音の立ち上がりを聞き取りやすくする。
- **プレイ中の「♫ AUDIO」または O キーで音量パネルを開閉。** BGM / SFXを独立して0〜100%調整、個別ON/OFF、現在の音量で効果音を試聴できる。パネルはゲームを止めずに開け、一時停止中はその状態を保つ。
- 音量は即時反映して自動保存。タイトルのSETTINGSと同期し、ミュートしても選んだ音量を保持。スライダー操作中の矢印キーやSPACEが移動・ダッシュ・EDスキップへ伝わらないようにする。スマホは画面内ボタンとタッチ操作に対応。
- BGMのクロスフェード、ボス撃破、敗北シネマを最新の保存音量に対する倍率で制御。演出の途中で音量を変えても古い値へ戻らず、0%から上げた場合やミュート解除も現在の進行に従う。
- 同時発音上限（通常16音／合計24音）、重要音の優先、キャッシュ、ゲームの乱数と独立した音生成を維持。各PCMのピークを制限し、出力コンプレッサーも調整する。

検証: `node tests/audio-engine.test.cjs`、`node tests/audio-integration.test.cjs`、`node tests/audio-mixer.test.cjs`、`node tests/title-screen.test.cjs`。波形・発音制御・実ゲームのBGM処理・UIの状態遷移をNodeで確認する。実際の聴感と音量操作の可否は再生機器・ブラウザのメディア実装にも依存する。

## v1.35.0 — SOUND OVERDRIVE / AUDIO REFORGE

- 効果音を専用のWeb Audioエンジンに刷新。射撃・命中・撃破・結晶回収・ダッシュ・武器・報酬などのオリジナル多層波形、低域インパクト、金属共鳴、短いステレオ残響を生成。
- 9種類のSIGNATURE FINISHER、3種類のJACKPOT MODE、DEVORA、NULL EMPEROR、TRUE DEVORAの3体／5体編成、ECLIPSE、敵ASTRAEAなどに専用の音。衣装解放音・メニュー選択音・敗北シネマも刷新。
- 命中・撃破・射撃方向・結晶回収は位置による左右定位と距離補正に対応。軽いピッチ変化で連続効果音の単調さを抑える。
- 同時発音24音（通常音16音、重要音用の枠を確保）、サンプルキャッシュと頻出音の分割事前生成。既存のSFXクールダウン、コンプレッサーを維持。旧音響処理はフォールバックとして残す。
- SETTINGSにBGM / SFX音量（各0〜100%、初期80%）と効果音試聴を追加。個別にlocalStorage保存。BGMの再生・クロスフェード・JACKPOT専用曲・ED・撃破シネマの音量処理にも適用。SFX OFFで新しいエンジンの再生中の音も停止する。
- 戦闘・当たり判定・JACKPOT MODE出現率・衣装解放・ランキング・全16曲の音源は変更しない。音量操作の可否はブラウザのメディア実装にも依存する。
- テスト: `node tests/audio-engine.test.cjs`。波形生成とモックWeb Audioによる検証。実機での聴感・端末負荷は未測定。

## v1.34.0 — KEY VISUAL / TITLE REFORGE

- 公式キービジュアルをタイトル画面全体に配置。元イラスト内のロゴをそのまま使用し、ネオンピンクのSTARTとHTML操作メニューを重ねる。スマホの縦画面はイラストの下にタッチ操作用メニューを表示。
- RUU STYLE・ACHIEVEMENTS・DEVORA FILES・EXTRA MODES・ENDING THEATER・SETTINGS・VISUAL ARCHIVE・世界ランキング・プレイヤー名入力を整理。既存のエンディングと追加モードの解放条件を維持。
- SETTINGSは既存のBGM・SFX・歩行・背景・画質・選曲・必殺技設定に接続。旧タイトルのイラストギャラリーはVISUAL ARCHIVEとして残す。
- 元画像は軽量なWebPへ変換。アニメーションは軽いシグナル点滅のみ、モーション低減設定にも対応。戦闘・保存・ランキング・楽曲・衣装の仕様は変更しない。
- 新機能テスト: `node tests/title-screen.test.cjs`。タイトルUI単体のPC・スマホ表示もChromiumで確認。

## v1.33.1 — RUU STYLE / DESIRE COLLECTION

- DESIREの解放条件を「異なる3種類のJACKPOT MODEを累計で発動」に緩和。別々のプレイ・モードでの発動も集計し、同じ種類の重複はカウントしない。クリア不要。
- 種類ごとにlocalStorageへ即時記録する。従来の解放済み衣装・選択衣装・進捗は維持。旧版の最大種類数は下限として保持するが、未記録だった過去の種類は推測せず、新しい記録と重複加算しない。
- JACKPOT出現率・効果・他の衣装解放条件・戦闘性能は変更しない。

## v1.33.0 — RUU STYLE / WARDROBE UNLOCKED

タイトル画面の RUU STYLE から9着（初期衣装＋追加8着）を選択・閲覧。選択中の衣装、解放状況、達成進捗、累計記録をブラウザの localStorage に保存する。衣装は見た目のみで、攻撃・移動・当たり判定は従来通り。結果カードには実際のプレイで装備した衣装を記録する。

| 衣装 | 解放条件 |
|---|---|
| DEFAULT | 初期衣装 |
| ECLIPSE | 完全クリア |
| DESIRE | 異なる3種類のJACKPOT MODEを累計で発動（v1.33.1以降） |
| NEO JAPONISM | NORMAL累計5回クリア（完全クリアを含む） |
| WHITE RESONANCE | NORMAL初クリア |
| NOIR DIVIDE | 異なる4種類の複合攻撃を累計で獲得 |
| GOLDEN SOVEREIGN | 1プレイで500体撃破 |
| SUMMER DRIFT | 累計100回ダッシュ |
| PALE REVENANT | 生存中のHP25%以下で主要ボスを撃破（報酬回復前） |

既存の通常クリア・完全クリア・500体撃破の実績から確認できる最低限の達成状況を引き継ぐ。過去の未記録回数は復元しない。セーブのインポート／エクスポート機能なし。ランキング・完全クリア記念品の判定には衣装保存データを使わない。DEVモードでは衣装実績を保存しない。

画像は既存の1536×1024、256pxセル×24コマのアトラス規格に合わせて透過と位置を補正。装備中のアトラスのみ必要時に読み込む。通常武器、敵性能、BGM、エンディングは変更しない。

検証: `node tests/ruu-style.test.cjs`（12テスト）。ブラウザ実機での表示確認は別途必要。

## v1.32.1 — TRUE DEVORA / HP GATE

- NULL EMPEROR撃破時のルーのHPが最大HPの50%以上なら真DEVORA5体（EXTINCTION PROTOCOL）、50%未満なら3体（DEVORA TRINITY）が確定出現。従来の10%抽選は廃止。
- 判定は撃破報酬のHP18%回復前に実施し、シールド残量は含めない。決定後にHPが変化しても編成は変わらない。
- NORMAL・ENDLESS・CHALLENGE共通。ENDLESSでは新たな真ボス戦が発生する際にも同じ条件を適用する。
- 真DEVORA全滅時のHP50%以上による裏ボス戦への分岐、裏ボスの7体編成、各敵の性能、報酬、ランキング、楽曲、衣装未実装の現状は変更しない。
- 回帰テスト `node tests/takamiya-pressure.test.cjs` に49%・50%・51%、奇数最大HP、撃破報酬による回復、シールド、モード別、決定後のHP変化の境界条件を追加。

## v1.32.0 — OPERATION: TAKAMIYA / 裏ボス戦強化

裏ボス戦の全敵を強化し、敵ASTRAEAの攻撃を6種類へ拡張。遠距離を保ったまま一方向に移動する戦法に、追撃と先回りの弾幕で圧力をかける。

- **主要7体のHPを25%増加。** ECLIPSE3体・増援DEVORA3体・敵ASTRAEA1体が対象。雑魚24体はHPを35%増加し、BRUTEの接触攻撃を10→13、基本速度を70→100、RUNNERは8→11・120→165へ引き上げる。離された敵は連続移動で追いつく。
- **ECLIPSEの弾幕を増量。** v1.31の各パターン1.5倍から2倍へ変更し、発射設定は約33%増加。発射後の待機時間を15%短縮、弾の威力を15%増加（端数切り上げ）、接触攻撃を通常17→21・第2形態21→26へ強化。既存の予兆時間と安全通路を維持する。
- **増援DEVORAの弾幕も強化。** 裏ボス戦に参戦する3体の発射設定を累計1.5倍へ増やし、発射後の待機時間を15%短縮。接触・弾の威力を18%増加（端数切り上げ）し、遠距離での追撃を強める。前段のTRUE END・3体／5体戦にはこの補正を適用しない。
- **ASTRAEAの攻撃と追撃を刷新。** 狙撃→扇状弾幕→3方向レーザー→左右の挟撃→突撃→包囲の6種類を巡回する。移動先を予測して予兆開始時に位置と経路を固定し、遠方からも攻撃を始める。予兆は順に0.95／1.05／1.15／1.15／1.2／1.2秒。HP50%以下と20%以下で弾数・弾速・追撃・攻撃後の待機を段階的に強化するが、予兆時間は維持する。挟撃と包囲は緑色で横方向の出口を表示する。接触攻撃も18→22へ強化。
- **残りHPに応じた防御強化。** 裏ボス戦の4系統すべてに、HP50%以下で追加12%、20%以下で追加28%のダメージ軽減を適用。2段階は重複加算しない。既存のボス耐性に乗算し、味方ASTRAEAの実ダメージ累計28%上限・とどめ不可はその後に適用する。敵の盾マークとHUDのARMOR I／IIで強化状態を示す。
- **弾数を全体960発以内に管理。** ECLIPSE660・DEVORA180・ASTRAEA120の専用枠を設け、他の系統の弾で攻撃枠を使い切らないようにする。上限到達時は追加発射を抑え、ASTRAEAの新しい弾にもキャッシュ描画を使用。撃破・再開始時に攻撃の残留物を片付ける。
- **7体撃破と2ウェーブを継続。** 到着前を含む集合最大HPは戦闘開始時に固定。主要ボス7体で完全クリアし、雑魚は12体×2回の有限増援とする。最終報酬・実績・完全クリアEDは1回だけ開始する。

検証コマンド（Node 18+）：

```sh
node tests/takamiya-pressure.test.cjs
node tests/astraea-siege.test.cjs
node tests/takamiya-operation.test.cjs
node tests/complete-ending.test.cjs
node tests/render-stability.test.cjs
node tests/performance-engine.test.cjs
node --check enemy-astraea.js
node --check secret-ruu-boss.js
node --check devora-true-end.js
```

強化戦20/20、追加戦18/18、既存TAKAMIYA21/21、完全クリアED16/16、描画安定性16/16の計91項目と性能制御テストが成功。変更した外部JS3本とHTML内JSの構文確認も成功した。

最大通常速度約304.53・3秒ごとのダッシュを使って70秒間直進する実ゲーム処理の検証では、ASTRAEAの通常／第2段階／最終段階で12／15／18回の実被弾が発生。予告後に横へ曲がる比較では、同じ最初の狙撃を回避できた。7体・3分間の検証では敵最大31体、雑魚累計24体、敵弾最大712発。別の飽和検証では960発と系統別の660／180／120上限を確認した。通常TRUE ENDの3体／5体は、レベル1・24・100で既存の能力と弾幕を維持している。

検証はNode VMと記録用Canvasによるもの。ブラウザの実表示・実機FPS・実際の攻略難易度は未測定。

## v1.31.0 — OPERATION: TAKAMIYA / ASTRAEA & SCREEN WAVES

裏ボス戦に**弾受けの雑魚2ウェーブ**と、敵側の**ASTRAEA1体**を追加。最終編成はECLIPSE3体・DEVORA3体・ASTRAEA1体になる。

- **雑魚増援は合計2回・24体。** 開戦時（ECLIPSEの登場演出終了時）に12体、ASTRAEA参戦時に12体を出す。各ウェーブはBRUTE8体＋RUNNER4体の近接型。ボスとプレイヤーの間を優先し、プレイヤーから170以上離れた場所へ0.7秒の到着予兆付きで出現する。通常弾や新しい自動照準の標的を受け持ち、ボスへの攻撃を分散する。
- **武器ごとの既存ルールを使用。** 貫通弾、範囲攻撃、すでに別の敵を追尾しているミサイルを一律に無効化する壁は作らない。雑魚は個別HPを持つ通常の攻撃対象で、通常撃破のスコア・XP・コンボに反映される。無限の再出現はない。
- **ASTRAEAは戦闘開始20秒で参戦。** 2秒の到着予兆を経て飛行し、0.95秒予告の狙撃レーザー、1.15秒予告の3方向レーザー、1.2秒予告の突撃を順に使う。予兆中に始点・向き・射程を固定し、表示した経路で判定する。HP50%未満で攻撃間隔を短縮するが、予兆時間は短縮しない。
- **既存のアニメーションを再利用。** 承認済みのASTRAEA飛行アトラスで描画し、赤い敵表示・専用HPバーで識別する。味方のASTRAEA緊急参戦とは別に管理する。
- **完全クリアは主要ボス7体の撃破。** 先に従来の6体を倒した場合は、20秒を待たずASTRAEAと第2ウェーブを出す。ASTRAEAを先に倒しても、ECLIPSE・DEVORAが残っていれば続行する。主要ボス全滅時の残り雑魚は報酬・撃破数を増やさず撤収させ、最終報酬・実績・完全クリアEDを1回だけ開始する。
- **結果とHP表示を更新。** 集合HPには登場前からASTRAEAの最大HPを含める。HUDに3系統の残数とウェーブ数、結果カードにASTRAEAの撃破数とWAVES 0〜2/2を追加する。味方ASTRAEAのボス別累計28%・とどめ不可の制限も、敵ASTRAEAに適用する。
- **追加負荷を制限。** 雑魚は最大24体、ASTRAEAは1体。ASTRAEAのレーザーは最大3本・残像は最大12個に制限し、既存の敵弾上限846発は増やさない。ECLIPSE3体の弾数50%増、DEVORA3体の12秒増援、HP50%以上の出現条件は継続する。

検証コマンド（Node 18+）：

```sh
node tests/astraea-siege.test.cjs
node tests/takamiya-operation.test.cjs
node tests/complete-ending.test.cjs
node tests/render-stability.test.cjs
node tests/performance-engine.test.cjs
node --check enemy-astraea.js
node --check secret-ruu-boss.js
node --check boss-rewards.js
node --check astral-companion.js
node --check support-pilots.js
node --check public-features.js
```

追加戦18/18、既存TAKAMIYA21/21、完全クリアED16/16、描画安定性16/16の計71項目と、性能制御テストを通過。2ウェーブ・7体の撃破順・通常弾の吸収・予兆と攻撃判定・報酬とEDの重複防止・支援上限を実ゲーム関数で確認した。増援の座標重複と、重力武器でASTRAEAの突進が予告経路からずれるケースも修正し、回帰テストを追加。外部JS6ファイルとHTML内JSの構文チェックも通過。検証はNode VMと記録用Canvasで行い、ブラウザの実表示、実機FPS、実際の攻略難易度はこの環境では未測定。

## v1.30.0 — OPERATION: TAKAMIYA

暫定最終アップデート。完全クリアを突破したプレイヤーへの次の挑戦として、裏ボス戦を **RUU : ECLIPSE 3体＋DEVORA増援3体** の総力戦へ変更。

- **ECLIPSEが3体同時に登場。** 各個体は従来と同じHP・攻撃力・耐性を持ち、HP48%以下のPHASE II、20%以下のLAST LIGHTを個別に発動。初手と攻撃開始をずらし、行動・予兆・ダッシュ・アニメーションを独立して管理する。
- **各ECLIPSEの弾幕発射数を50%増量。** 既存の発射頻度倍率1.20は維持し、各攻撃の弾数を1.5倍にする。奇数の端数は個体・攻撃ごとに持ち越す。3体が生存している間の合計発射設定は、旧1体戦の最大4.5倍相当（同時弾数の上限到達時を除く）。各パターンの予兆・安全通路を維持する。
- **戦闘開始12秒後にDEVORA3体が増援。** 登場演出を除くゲーム内戦闘時間で判定し、HUNTER・ORACLE・SIEGEが参戦。各個体に1.2秒の到着予兆を設ける。12秒より前にECLIPSEを3体とも倒した場合は、その時点で増援を出す。
- **完全クリア条件は6体全滅。** 撃破順にかかわらず、ECLIPSE3体と増援DEVORA3体をすべて倒したときだけ、完全クリア実績・最終報酬・記念イラストEDを解放する。中間のECLIPSE撃破では最終報酬や勝利待機を開始しない。増援各体には通常の真DEVORA単体報酬を与え、前の真ボス戦の集合撃破報酬は再付与しない。
- **進捗表示を更新。** タイトルと戦闘HUDにアップデート名を表示。集合HPは未到着の増援分も含めた固定最大値を使う。結果カードにはECLIPSEと増援DEVORAそれぞれの撃破数を記録し、元のTRUE DEVORA3体／5体戦とは区別する。
- **負荷を制限。** 敵弾は全体最大846発、ECLIPSE側750発・増援側96発の枠で管理。弾グラフィックと軌跡をキャッシュして描画し、毎フレームの弾単位のグラデーション生成を避ける。FX LITEでも実弾の数や当たり判定は変えない。
- **既存の解放条件と記録を引き継ぐ。** 通常の真DEVORAを全滅させた時点でHP50%以上という出現条件は継続し、回復報酬より先に判定。ENDLESSは対象外。過去の完全クリア実績・ED再鑑賞の解放は保持する。

検証コマンド（Node 18+）：

```sh
node tests/takamiya-operation.test.cjs
node tests/complete-ending.test.cjs
node tests/render-stability.test.cjs
node tests/performance-engine.test.cjs
node --check secret-ruu-boss.js
node --check devora-true-end.js
node --check boss-rewards.js
node --check public-features.js
```

新編成の回帰テスト21ケース（弾幕81条件、4種類の撃破順、出現条件、報酬・EDの1回性、死亡後の誤クリア防止、弾数上限、描画関数・キャッシュを含む）、ED16ケース、描画安定性16ケースが成功。既存の衝突判定比較・30FPSスケジューラ検証とJavaScript構文確認も成功。描画の検証はNode VMの記録用Canvasによる実行確認であり、ブラウザ上の実表示・実機FPS・クリア難易度はこの環境では未測定。

## v1.29.0 — COMPLETE CLEAR ENDING

裏ボス **RUU : ECLIPSE** を撃破したランに、ユーザー提供の完全クリア記念イラストを追加。

- **現在のランの裏ボス撃破で分岐。** `secretBossCleared` を確定時に保持して完全クリアEDへ。過去に裏ボスを倒していても、その後の通常クリアは通常EDになる。
- **元のPNGをそのまま表示。** 1672×941の画像をトリミング・再描画・再圧縮せず追加。画像内の文字に既存字幕やクレジットを重ねず、操作部を画像の外に配置。スマホでは画面全体を使い、「イラストを拡大」で原寸画像も開ける。
- **結果カードへの導線を維持。** 「結果へ」から従来の結果画面へ進む。結果画面からEDを見直した場合も、同じランの結果へ戻り、カード保存・共有に進める。
- **クリア済みなら再鑑賞可能。** 既存の `eclipse_clear` 実績でタイトルの「COMPLETE ENDING」を解放。更新前に裏ボスを倒した人も対象。通常のENDING THEATERは通常EDを再生する。
- **読み込みを限定。** 約4MBの記念画像は通常起動時には取得せず、裏ボス撃破後または完全クリアED再生時に読み込む。画像の取得に失敗しても結果画面へ進める。
- **「動作が重いとき」を追加。** 操作群の下に折りたたみ式ヘルプを設置。FX LITE／SCENE CALMと、PC版Chromeのグラフィックアクセラレーション設定を案内する。ブラウザ設定をゲーム側から変更する機能は追加していない。

検証コマンド（Node 18+）：

```sh
node tests/performance-engine.test.cjs
node tests/render-stability.test.cjs
node tests/complete-ending.test.cjs
node --check public-features.js
```

完全クリアの分岐・再鑑賞・結果への復帰・保存できない環境・画像読込失敗など16ケースと、既存の描画安定性16ケースを確認。元画像と追加PNGのバイト一致も確認。ブラウザによる画面の実表示確認は、この実行環境からローカルプレビューへ接続できず未完了。

## v1.28.1 — FRAME STABILITY / 暗転修正

v1.28.0の再プレイ録画で、戦闘画面だけが約33〜100ms消える現象を10回、表示FPSが8.7まで落ちる場面を確認。Canvasの消去タイミングとAUTO画質制御を修正した。

- **Canvasのサイズ変更と再描画を同じフレーム内で実施。** 以前は描画後のAUTO調整がCanvasのwidth/heightを書き換え、次のフレームまで画面を黒くしていた。リサイズ通知は予約だけにし、実際の変更は次に確実に描画する直前へ移動。PAUSE・レベルアップ・ED中も、サイズ変更時には停止状態の画面を描き直す。
- **負荷軽減中に画質が上がる条件を修正。** 旧式の下限値により0.72から0.84へ戻っていた分岐を単調な引き下げへ変更。画質の回復には約6秒（5計測区間）連続の余裕を必要とする。
- **AUTOの解像度低下を有効化。** 初期画質は維持し、負荷が続くと内部描画解像度を調整する。従来は最低0.95倍の制約で低下がほぼ効かない表示サイズがあった。最低0.72倍まで許可し、論理座標1200×675と当たり判定は維持。
- **AUTO品質の計測値を追加。** `window.RUU_PERF_SNAPSHOT()`に`autoQuality`を追加し、画質調整と実際の描画解像度を確認できるようにした。

検証コマンド（Node 18+）：

```sh
node tests/performance-engine.test.cjs
node tests/render-stability.test.cjs
```

暗転・AUTO制御の16ケースは実際のゲーム関数を実行して確認（旧版は12ケース失敗、修正版は全ケース成功）。従来の5,625件の衝突判定比較と境界ケース・描画スケジューラのテストも成功。**ユーザーのPC・録画環境でのFPS改善幅は未測定。** UPDATE/DRAWが低いままFPSが下がる場面もあり、GPU合成・表示更新・録画との関係は引き続き実測が必要。

## v1.28.0 — PERFORMANCE REFORGE (PHASE 1)

2026年11月23日のプレイ録画（通常25〜26FPS、激戦時12〜17FPS）をもとに、**戦闘内容を変えずに処理を軽量化する第1弾**を実装。

- **描画スケジューラを修正。** 30FPSの目標時刻を累積する方式と1msの許容幅を採用。60Hz／75Hz／120Hz／144Hz表示で30FPSの枠を維持できる計算を検証。FX AUTOは30FPSを目標、HIGHは40FPS上限、LITEの上限は26→30FPSへ変更。実機での30FPS達成を保証するものではない。
- **詳細パフォーマンス計測。** HUDに実測 FPS / UPDATE ms / DRAW ms を表示。UPDATEはゲーム計算CPU時間、DRAWはCanvas描画命令CPU時間。GPU合成や録画の待ち時間は含まない。FPS欄のツールチップにrAF間隔や敵・弾・解像度を表示。開発者コンソールの window.RUU_PERF_SNAPSHOT() から計測値を確認可能。
- **敵との弾衝突判定に空間グリッド（160px）を導入。** 各弾で全敵を調べる処理を近傍候補のみへ縮小。衝突判定は従来と同じ計算式で行い、候補を従来の敵配列順へ戻して貫通弾の命中優先順も維持。万が一補助JSが読み込めない場合は従来の全件判定へフォールバック。
- **通常弾／氷弾を高解像度のスプライトキャッシュで描画。** 毎フレームの弾単位で生成していたグラデーションとパスを再利用し、キャッシュは128種類までに制限。特殊な色などキャッシュ非対応の弾は従来描画を使用。
- **視覚専用の衝撃波オブジェクトを最大28個に制限。** 当たり判定・攻撃性能には影響しない。AUTO画質の引き下げ条件にUPDATE時間を追加し、単発のFPS低下で24FPSに落としすぎないよう修正。
- **非変更範囲：** 敵・弾の威力、当たり判定半径、ボスAI、出現率、支援パイロット、クリア判定、実績、ランキング、16曲BGM、セーブキー、ED、結果カード、X共有。

### 性能確認の方法

1. 同じブラウザ・表示サイズ・画質モード・録画設定で、更新前と更新後の通常戦闘／ボス戦を比較する。
2. ゲーム下部のFPS・UPDATE・DRAWと、コンソール window.RUU_PERF_SNAPSHOT() のmaxRafGapMs、敵・弾数を確認する。
3. UPDATE / DRAWが短いままFPSだけ落ちる場合は、GPU合成、表示更新、OS負荷、録画負荷などの影響を切り分ける。実録画と同条件の実機ベンチマークは未実施。
4. 開発用の簡易検証はリポジトリ直下から node tests/performance-engine.test.cjs（Node 18+）で実行可能。

**検証済み：** JavaScript構文、ランダム6400ケースの弾衝突候補／命中順一致、スプライトキャッシュの再利用と上限、4種類の表示リフレッシュレートでの30FPS目標スケジューラ。参考用の人工戦況（敵175体・弾150発）では衝突候補比較数が26,250→2,414（約90.8%減）。**これは実ゲームFPSの改善率ではない。**

## v1.27.0 — X RESULT CARD IMAGE SHARE

- **プレイ結果の画像付きX共有**を追加。NORMAL / ENDLESS / CHALLENGEの結果画面の「𝕏 結果カードを投稿」から、従来の1200×675 PNG結果カード（スコア、撃破ボス、クリア状況、ASTRAL-SUITパイロット）を使用する。
- **スマートフォン：** 画像ファイル共有が使える端末はOS標準の共有画面を開く。共有先にXを選択して投稿前に確認する。
- **PC：** 画像をクリップボードにコピーし、スコア・ハッシュタグ・ゲームURLが入ったXの投稿画面を開く。画像はCtrl+V（Macは⌘V）で貼り付ける。クリップボード非対応・失敗時はPNGをダウンロードして手動添付。
- 「🖼 結果カード保存」は継続。Xの共有リンクだけではPNGを直接添付できないため、**公開操作はプレイヤー自身がX側で行う**。X APIの認証や課金、Worker/D1変更は不要。
- ランキング、クリア判定、ボス、支援パイロット、セーブキー、戦闘バランスを変更しない。

## v1.26.0 — FAIR ODDS / RESULT CARD BOSS RECORD

- **レベルアップの確率表記を抽選実装に合わせて整理。** 通常81%、+2候補15%、+3候補3%、+4候補1%は「1回の選択肢生成で引く強化ボーナス枠」の基本確率であり、各カードの独立出現率ではないことを明記。
- **残りレベル不足・強化可能な候補不足の場合**は+2/+3/+4が格下げ／不成立になることを記載。+3強化の表示名を「JACKPOT +3」から「LEGENDARY +3」へ変更。**JACKPOT MODE 1%は条件を満たす場合の別抽選**と明確化。REROLLでも再抽選される。
- **実際の乱数・ボーナス比率・JACKPOT MODE発動率は変更なし。**
- **結果カード（PNG 1200×675）を刷新。** NORMAL / CHALLENGE / ENDLESSのクリア状況、DEVORA／NULL EMPEROR撃破、TRUE DEVORA 3・5体の撃破数／全滅、RUU : ECLIPSEの遭遇／撃破を一枚に表示。
- **量産型ASTRAL-SUITが選ばれた場合の搭乗パイロット名**と日本語名、合流済みかINBOUNDかを表示。参戦していないプレイは NO SUPPORT と表示。
- クリア・撃破判定は**今回のプレイ中のイベントだけ**で記録。過去の獲得実績・称号を「今回撃破した」ものとして誤表示しない。オンラインランキングの送信データ／サーバー仕様、既存セーブキー、装備内容、戦闘バランスは維持。
- GitHub Pagesだけで反映。Cloudflare Worker / D1の追加変更は不要。

## v1.25.0 — LIVE LOADOUT & SUPPORT INTEL

- プレイ中に **現在装備・支援効果を一覧できる「LOADOUT / 装備・支援情報」画面**を追加。PCは **Iキー**、ゲーム画面内の **⌑ LOADOUT**、下部の **⌑ 装備 / SUPPORT** ボタンから開く。スマホもタップで確認できる。
- 装備画面を開くとゲーム時間・敵・弾幕を一時停止。閉じると戦闘再開。通常のPAUSE画面から開いた場合は、閉じた後にPAUSEへ戻る。ESC / P / Iにも対応。
- 武器、残響追撃、パッシブ・防御、進化6種、複合技4種のうち**今のプレイで実際に取得しているものだけ**を表示。武器・強化はLVと最大LV・説明文を表示。瞬間回復は装備として扱わない。HP・SHIELD・攻撃・会心・速度なども確認可能。
- **量産型ASTRAL-SUITが参戦している場合だけ**、実際の搭乗パイロットと固有支援効果を表示。エリオ／オズ／カイ／セラ／ミナの射撃・迎撃・マーキング・ゲージ補給・XP回収・侵攻報酬の各仕様を、現行のコードに合わせた説明で表示。ASTRAEA緊急出撃の状態も併記。
- 未参戦のプレイは **NO ALLIED SIGNAL** と抽選率25%を明示。開幕のINBOUND状態と合流後ACTIVE状態を区別。
- **閲覧専用の機能追加**。抽選率、支援性能、ボス、スコア、ランキング、BGM、実績の解除条件、EDに変更なし。ゲーム本体と同じフォルダに `run-inspector.js` と `run-inspector.css` が必要。

## v1.24.0 — MASS-PRODUCED ASTRAL-SUIT / SPRITE REFORGE

- 『星屑の鎧 -Guardian Genome-』の**量産型ASTRAL-SUIT**を提供された公式機体設定画に合わせて刷新。白灰色の装甲、黒い関節、肩の第18世代マーク、背面ユニット、携行火器を統一。
- **4×4・計16コマの透過WebPスプライト**を実装。前進、側面歩行、後退、ライフル射撃の4行をゲーム時間で切り替える。
- 従来のブラウザ依存GIFデコーダーを撤去し、Canvas上でフレームを直接選択。**立ち止まった瞬間に旧SVGの正面絵へ戻る問題を解消**。描画品質や一時停止に左右されず、歩行の各コマを選択できる。
- 表示サイズは**136論理px（透明マージン込み）**。ルー本人（通常144論理px）より少し小さい設計。
- 変更は随伴機の見た目とアニメーションのみ。**支援パイロットの登場率25%・5人の抽選・各自の能力・ASTRAEA緊急参戦条件・弾幕・スコア・ランキング・BGM・ED**は維持。
- 新規必須画像 `assets/astral_suit_support_atlas.webp` を追加。旧GIF・旧SVG素材は互換用に残すが、正常に読み込める環境では使用しない。

## v1.23.1 — STABILITY & CONSISTENCY

全体レビューで確認した進行・表示・記録の不具合を修正。

- **進行停止の修正：** 遠く離れた通常／最終ボスが消える問題、同じ攻撃で複数ボスを倒したときにTRUE ENDへ進まない問題、ENDLESSの報酬演出後に通常スポーンとレベルアップが止まる問題を解消。
- **戦闘表示の整合：** TRUE ENDの集合HPバーの最大値を固定し、コア撃破後にバーが回復して見える表示を修正。FRACTUREの緑の安全通路と実弾、ECLIPSE収束弾の警告円と攻撃中心を一致させた。TRUE DEVORAの予兆・発射音も接続。
- **報酬と支援：** ボス報酬で95%を超えたゲージが逆に95%へ減らないよう修正。ASTRAEAの最大HP28%・とどめ不可の制約を、DRIVE・クリティカル・マーキング・耐性を計算した後の実HP損傷へ適用。ECLIPSEも同じ制約の対象。
- **エンディング／BGM：** 無音のエンディング自動終了で起きる例外、一時停止中のシーク表示、無音から有音へ切り替える際の位置ずれを修正。遅れて完了した選曲がJACKPOT・ED・新しいプレイを上書きしない。読み込み中の一時停止後も選択した曲を再開。
- **描画：** 一時停止・レベルアップ・非表示タブをAUTO画質低下の判定から除外。
- **記録／文言：** 壊れた自己ベストでタイトルが開かない問題を修正。通常クリア実績をNORMALに限定し、支援参戦実績は実際の合流時に解除。操作説明・チャレンジ説明・NULL EMPERORの撃破条件表記を現在の動作に合わせた。旧実績IDと保存キーは維持。
- **ランキング：** NORMAL／ENDLESSの応答混在、古いエラーによる表示上書き、登録連打、削除中のモード切替を修正。一時的な通信失敗後も対応モードを再確認できる。
- **開発者版：** 公開用の実績・称号・チャレンジ記録・自己ベストへ書き込まず、ED解放キーも分離。直ボステスト後に通常開始すると侵攻・支援処理を復帰。Windows起動時の版／コミット検査とPowerShell文字コード互換、HP49%／50%分岐テスト、パネルの折りたたみを修正。

`backend/src/index.js` にはランキング取得件数を整数化する修正も含む。既存のフロントは整数を使用するため互換性は保たれる。**Worker側へ適用する場合は別途デプロイが必要**で、DBスキーマ変更は不要。

> 以下のバージョン別説明は当時の変更履歴。現在の仕様は本節と最新のゲーム実装を参照。

## v1.23.0 — ACHIEVEMENT REFORGE

- 実績が **12種から24種** に。STORY（4）、COMBAT（9）、SURVIVAL（3）、GUARDIAN（2）、SECRET（6）の5カテゴリ。
- TRUE DEVORA 1体撃破／3体・5体撃破、RUU : ECLIPSEの出現・LAST LIGHT・撃破、ASTRAEA緊急参戦、支援パイロット参戦、通常必殺技、第三形態目撃、1プレイ500体撃破、ENDLESS 300秒生存を追加。
- アーカイブに達成率、カテゴリタブ、BRONZE〜MYTHICのランク、今回のコンボ・撃破数・生存時間の進捗バーを追加。
- 未獲得のSECRET実績は名称と解除条件を伏せ、解除後に内容と称号を公開。
- 既存12実績のIDと獲得記録キー `RUU_ACHIEVEMENTS_V1`、装備称号キー `RUU_TITLE_V1` は変えず、旧記録を引き継ぐ。新規実績は実際に条件を満たした時点から解除。
- CHALLENGE専用称号、ゲーム難易度、既存ボス報酬、オンラインランキング、16曲のBGM、クリア条件は維持。

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
- `run-inspector.js`, `run-inspector.css` — プレイ中の装備確認・量産型ASTRAL-SUIT支援効果の表示。
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
