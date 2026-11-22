# RUU//OVERRUN v1.11.0 — Cloudflareランキング更新手順

**GitHub Pagesのゲーム本体は更新済みですが、ENDLESSの共通ランキングを利用するには、現在運用中のCloudflare D1とWorkerをそれぞれ更新してください。**
通常モードの既存記録は残ります。既存の`scores`テーブルは削除しません。

## STEP 1：D1に新しいテーブルと称号列を追加する

Cloudflare Dashboard → **Storage & databases → D1 → ruu-overrun-ranking → Console** に進む。

下記SQLを入力して **Execute** する（**一度だけ**）。

```sql
ALTER TABLE scores ADD COLUMN title TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS endless_scores (
  player_id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL CHECK (score>=0),
  kills INTEGER NOT NULL CHECK (kills>=0),
  level INTEGER NOT NULL CHECK (level>=1),
  time_seconds INTEGER NOT NULL CHECK (time_seconds>=0),
  won INTEGER NOT NULL CHECK (won=0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_endless_scores_rank
ON endless_scores (score DESC, time_seconds DESC, kills DESC);
```

ファイルとしては [migrate_v111.sql](./migrate_v111.sql) と同一内容。**既に実行済みの場合は再実行しない**（`ALTER TABLE`は同じ列を二度追加できない）。既存の`scores`のデータは変更しない。

確認用SQL:

```sql
SELECT name FROM sqlite_master
WHERE type='table' AND name IN ('scores','endless_scores');
```

`scores`と`endless_scores`の2行が出ればテーブルは揃っている。`PRAGMA table_info(scores);` で`title`列も確認可能。

## STEP 2：Workerのコードを更新

1. Cloudflare → **Workers & Pages → ruu-overrun-leaderboard → Edit code**。
2. 既存のコードを新しい [backend/src/index.js](./src/index.js) に**全文置換**する。
3. **Deploy** を押して反映する。
4. Workersの**Settings → Bindings** に `DB → ruu-overrun-ranking` が残っているか確認する。
5. 環境変数 `ALLOWED_ORIGINS=https://jackpot031.github.io` も維持。

WorkerはGitHubにコードを置くだけでは自動更新されない（Hello WorldからCloudflare上で作成したWorkerなので、Cloudflare側のDeployも必要）。

## STEP 3：動作確認

- **Health**：`https://ruu-overrun-leaderboard.iverson06200.workers.dev/api/health`
- **通常**：`https://ruu-overrun-leaderboard.iverson06200.workers.dev/api/leaderboard?mode=normal`
- **ENDLESS**：`https://ruu-overrun-leaderboard.iverson06200.workers.dev/api/leaderboard?mode=endless`

Healthに `"rankingModes":["normal","endless"]` があれば新しいWorkerが稼働中。ENDLESSの `{"mode":"endless","entries":[]}` はまだ誰も登録していない正常な状態。

ゲームURL：`https://jackpot031.github.io/ruu-overrun/`。再読み込みして「∞ ENDLESS MODE」やランキング画面の **NORMAL / ENDLESS** 切替を確認。

## 補足

- ENDLESSは**通常モードのクリア後に解放**される。
- クラウド側の更新が終わる前は、ゲームのENDLESS自己ベストはブラウザに保存されるが、**通常ランキングへ誤送信されないよう送信をブロック**している。
- ニックネームと称号は一般に公開される。タイトルは所定の実績を獲得したうえで選ぶ仕様だが、クライアント報告型のβランキングであり不正送信防止の保証はない。
- Cloudflareのトークン、パスワード等はGitHubのファイルへ入力しないこと。
