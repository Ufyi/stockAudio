
# 日経先物 音声読み上げ（Web プロトタイプ）

このリポジトリは iPhone Safari 等のモバイルブラウザで動く Web プロトタイプです。Web Speech API を使って音声読み上げを行います。

セットアップ:

```bash
npm install
npm run dev
```

ローカルでプロキシを使う手順（CORS回避用）:

```bash
cd server
npm install
npm start
# 別ターミナルで
npm run dev
```

注意:
- iPhone Safari ではブラウザがバックグラウンドでスクリプトを停止するため、確実に継続させることは困難です。画面がロックされるとTTSが中断される場合があります。
- アプリ内の「バックグラウンド維持用オーディオを有効化」はユーザー操作で AudioContext にゼロ長のバッファをループ再生し、iOSで音声継続を助けることがあります（確実ではありません）。


動作の注意点（重要）:
- Web ではバックグラウンド（画面ロックやタブ非アクティブ）でのタイマー実行や TTS の継続はブラウザ/OS 側で制限されます。特に iOS Safari では制約が厳しく、短周期での継続実行は保証されません。
- Yahoo Finance の非公式エンドポイントを使用しています。CORS によって直接取得できない場合は自前のプロキシ（無料でも可）を用意してください。

推奨改善:
- PWA化してホーム画面に追加すると少し有利になる場合があります（ただし iOSでは制約が残ります）。
- バックグラウンドで確実に音声を流す必要がある場合はネイティブアプリを推奨します。

プロキシのクラウドデプロイ例:

- Railway / Render / Heroku などに `server` フォルダをデプロイすると、CORS の心配が少なくなります。
- デプロイ後は `src/api.js` の `proxyUrl` を `https://your-proxy.example.com/api/quote` に書き換えてください（または環境変数で切替）。

具体的なデプロイ手順（例: Railway）:

1. Git リポジトリに `server` フォルダを含めて push します。
2. Railway にログインして新しいプロジェクトを作成 → GitHub リポジトリを接続。
3. デプロイ設定で `server` を `root` または `server` パスとして指定（Railway の UI に従ってください）。
4. 環境変数 `PORT` は自動設定されます。デプロイ完了後、プロキシのエンドポイント URL（例: `https://your-proxy.up.railway.app/api/quote`）を確認します。
5. クライアント側で Vite のビルド時に環境変数 `VITE_PROXY_URL` を設定してビルドします。

ローカルでビルドして `VITE_PROXY_URL` を使う例:

```bash
VITE_PROXY_URL="https://your-proxy.up.railway.app/api/quote" npm run build
# 生成された静的ファイルを任意のホスティングに配置
```

注意: Vite はビルド時に `import.meta.env` を埋め込みます。ランタイムで変更する場合はクライアント側で設定を読み取れる仕組み（サーバーサイド設定エンドポイントなど）を用意してください。

自動デプロイ設定:

- GitHub Actions は次の自動処理を行います:
	1. `server` を Docker イメージとして GHCR にビルド・push（既存ワークフロー）
	2. クライアントをビルドして `gh-pages` にデプロイ（既存ワークフロー）
	3. 追加ワークフローで `DEPLOY_HOOK_URL` シークレットが設定されていれば、その URL に新しいイメージ情報を POST します（Render/Railway/任意のデプロイフックに対応）。

設定方法:

1. リポジトリの `Settings > Secrets` に `DEPLOY_HOOK_URL` を追加します（Render や Railway のデプロイフック URL）。
2. main ブランチに push するとワークフローが走ります。デプロイ先プロバイダ側でフック受信→デプロイの設定が必要です。

独自ドメイン（GitHub Pages）:

- `CNAME` ファイルをリポジトリに追加しました。`CNAME` の中身を実際のドメインに書き換え、DNS の A / CNAME レコードを GitHub Pages 用に設定してください。



