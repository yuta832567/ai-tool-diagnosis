# 再開プロンプト（2026-04-08 作業終了時点）

以下をそのまま Claude Code に貼ってください。

---

## 貼り付け用プロンプト

```
docs/spec.md と docs/decisions.md と docs/tasks.md と docs/worklog-2026-04-08.md を読んでください。

昨日の続きから再開します。

## 現在の状態

- Next.js 16 + TypeScript + Tailwind v4 のプロジェクトが app/ に存在します
- フォームUI（3ステップ）・スコアリングロジック・結果画面（簡易提案レポート形式）まで完成しています
- ビルドは通っています（npm run build で確認済み）
- Git はまだ初期化していません
- Netlify Functions / URL解析 / LLM連携 は未実装です

## 今日やりたいこと（優先順）

1. Git 初期化と初回コミット
   - app/ ディレクトリ内で git init
   - .gitignore の確認（node_modules / .env など）
   - 初回コミット

2. Netlify Functions の analyze API 実装
   - netlify/functions/analyze.ts を作成
   - 現在 client-side にある buildDiagnosisResult を server-side に移行
   - netlify.toml を作成

3. URL解析機能の実装
   - lib/websiteParser.ts：HTML取得・本文抽出
   - フォーム Step 1 のQ4（事業内容）への自動補完

4. LLM連携（テキスト生成）
   - 診断結果の自然文（総合所見・活用業務カード・推薦理由）を LLM で生成
   - 使用するモデル: claude-sonnet-4-6（APIキーは環境変数 ANTHROPIC_API_KEY）

## 制約・注意点

- npm run dev は実行しない（開発サーバーは別ターミナルで起動中）
- Netlify Free で動かす前提で依存を増やしすぎない
- データ保存なし、スパム対策なし、PDF出力なし は変わらない
- LLM はスコア計算には使わない（テキスト生成のみ）

## ファイル構成（現在）

app/                        ← プロジェクトルート
├── app/                    ← Next.js App Router
│   ├── page.tsx            ← トップページ
│   └── layout.tsx
├── components/
│   ├── form/
│   │   ├── DiagnosisForm.tsx   ← フォーム全体のステート管理
│   │   └── ProgressBar.tsx
│   ├── steps/
│   │   ├── Step1Company.tsx    ← Q1〜Q9
│   │   ├── Step2Environment.tsx ← Q10〜Q15
│   │   └── Step3Security.tsx   ← Q16〜Q24
│   ├── result/
│   │   └── DiagnosisResult.tsx ← 簡易提案レポートUI
│   └── ui/
│       ├── SelectCard.tsx
│       └── MultiSelectChip.tsx
├── data/
│   ├── tools.json
│   ├── environmentFit.json
│   └── usecaseFit.json
└── lib/
    ├── types.ts            ← FormData / DiagnosisResult 等の型定義
    └── scoring.ts          ← ルールベーススコアリング（全ロジック）

docs/                       ← Obsidian 管理（プロジェクトルートの外）
├── spec.md
├── decisions.md
├── tasks.md
└── worklog-2026-04-08.md
```

まず git init と .gitignore の確認から始めてください。
```
