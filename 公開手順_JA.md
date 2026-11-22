# RUU//OVERRUN — GitHub公開・更新手順（v1.12.0 PUBLIC BETA）

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
