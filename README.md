# sora-firebase

AI 秘書アプリ Sora の Firebase Functions, Firestore, Firebase Hosting に関するファイルをまとめています.

## 環境構築

このリポジトリは [GitHub Codespaces](https://github.com/features/codespaces) および [VSCode Devcontainer](https://code.visualstudio.com/docs/devcontainers/containers) で動作します.

コンテナをビルドすると初期化スクリプト `.devcontainer/devcontainer.json` が実行され, [Firebase CLI](https://firebaseopensource.com/projects/firebase/firebase-tools/) をインストールし, Firebase Functions と Firebase Hosting の依存パッケージを取得します.

初期化コマンドの実行完了後, Firebase CLI で Firebase にログインします.

```bash
firebase login
```

## デプロイ

次を実行すると Firebase Functions と Firebase Hosting のビルドスクリプトが実行され, その後デプロイされます.

```bash
firebase deploy
```
