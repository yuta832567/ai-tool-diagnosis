# 再開プロンプト（2026-04-09 作業終了時点）

以下をそのまま Claude Code に貼ってください。

---

## 貼り付け用プロンプト

```
docs/current-setup.md と docs/tasks.md と docs/worklog-2026-04-09.md を読んでください。

前回の続きから再開します。

## 現在の状態

- Next.js 16 + TypeScript + Tailwind v4 のプロジェクトが app/ に存在します
- フォームUI（3ステップ）・スコアリングロジック・結果画面（簡易提案レポート形式）完成済み
- PDF保存機能（window.print）実装済み
- LLM 連携（analyze API）・URL 解析（parse-url API）実装済み（@anthropic-ai/sdk + claude-sonnet-4-6）
- Netlify デプロイ済み（サイト名：ai-tool-diagnosis-2）
- Git 初期化済み・GitHub push 済み（main ブランチ）
- ローカルでの動作確認済み（LLM連携・URLから自動入力）

## 修正対象サイト

**ai-tool-diagnosis-2 のみ**。元の ai-tool-diagnosis は触りません。

## 今回やりたいこと（優先順）

1. Netlify の本番 URL でトップページが表示されるか確認
2. Netlify 環境変数に `ANTHROPIC_API_KEY` が設定されているか確認
3. 本番で診断フローを最後まで実行できるか確認（LLM連携含む）
4. スマホ実機での表示確認
5. Chrome / Safari / Edge での印刷プレビュー確認

## 制約・注意点

- npm run dev は実行しない（開発サーバーは別ターミナルで起動中）
- 修正対象は ai-tool-diagnosis-2 サイトのみ
- root の netlify.toml が ai-tool-diagnosis-2 用（base="app"、@netlify/plugin-nextjs なし）
- app/netlify.toml が旧サイト ai-tool-diagnosis 用（base="app" + @netlify/plugin-nextjs）

## ファイル構成（現在）

ai-tool-diagnosis/                ← Git リポジトリルート
├── netlify.toml                  ← 新サイト用（base=app）
├── app/                          ← Next.js プロジェクト本体
│   ├── netlify.toml              ← 旧サイト用（@netlify/plugin-nextjs 付き）
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── api/
│   │       ├── analyze/route.ts  ← POST /api/analyze（スコア計算 + LLM文章生成）
│   │       └── parse-url/route.ts← POST /api/parse-url（URL解析 + LLM要約）
│   ├── components/
│   │   ├── form/DiagnosisForm.tsx
│   │   ├── steps/Step1〜3
│   │   ├── result/DiagnosisResult.tsx
│   │   └── ui/
│   ├── data/
│   ├── lib/
│   │   ├── types.ts
│   │   ├── scoring.ts
│   │   └── websiteParser.ts
│   └── package.json
└── docs/                         ← Obsidian 管理ドキュメント

## 必要な環境変数

| 変数名 | 説明 | 設定場所 |
|---|---|---|
| ANTHROPIC_API_KEY | Anthropic API キー | Netlify ダッシュボード > Environment variables |

まず本番URLでの確認状況を教えてください。
```
