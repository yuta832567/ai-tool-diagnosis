# 現在の構成まとめ（2026-04-09 時点）

## サイト方針

| サイト名 | 方針 |
|---|---|
| **ai-tool-diagnosis-2** | ✅ 現在の作業対象。今後はここを更新する |
| ai-tool-diagnosis | 🚫 触らない。旧サイトとして放置 |

---

## リポジトリ構成

```
ai-tool-diagnosis/                ← Git リポジトリルート
├── netlify.toml                  ← 新サイト用（base=app を指定）
├── app/                          ← Next.js プロジェクト本体
│   ├── netlify.toml              ← 旧サイト用（UI で Base dir=app が設定されているサイト向け）
│   ├── app/                      ← Next.js App Router
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
│   ├── data/                     ← 静的マスタデータ（JSON）
│   ├── lib/
│   │   ├── types.ts
│   │   ├── scoring.ts            ← ルールベーススコアリング
│   │   └── websiteParser.ts      ← HTML取得・本文抽出
│   └── package.json
└── docs/                         ← Obsidian 管理ドキュメント
```

---

## Netlify の設定考え方

### ai-tool-diagnosis-2（現在の作業対象）

- **netlify.toml の読み込み**：リポジトリルートの `netlify.toml` が有効
- **UI の Base directory**：設定しない（空欄）
- `netlify.toml` が `base = "app"` を指定し、Netlify が `app/` でビルドを実行する

```toml
# ai-tool-diagnosis/ の netlify.toml（有効）
[build]
  base    = "app"
  command = "npm run build"
  publish = ".next"
```

### ai-tool-diagnosis（旧サイト・触らない）

- Netlify UI で「Base directory: app」が設定されているため `app/netlify.toml` が読まれる
- `app/netlify.toml` の `[[plugins]]` で `@netlify/plugin-nextjs` を適用済み

---

## Next.js API Routes

Next.js Route Handler として実装。`@netlify/plugin-nextjs` が Netlify Functions に変換する。

| エンドポイント | 役割 |
|---|---|
| `POST /api/analyze` | フォーム送信 → ルールベーススコア計算 → LLM文章生成 → DiagnosisResult 返却 |
| `POST /api/parse-url` | URL → HTML取得・本文抽出 → LLM要約 → 事業内容テキスト返却 |

**LLM フォールバック**：`ANTHROPIC_API_KEY` が未設定 or LLM 呼び出し失敗時は、ルールベース結果をそのまま返す。

---

## 必要な環境変数

| 変数名 | 説明 | 設定場所 |
|---|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API キー（`sk-ant-...`） | Netlify ダッシュボード > Environment variables |

- ローカル開発：`app/.env.local` に記述（`.gitignore` の `.env*` で除外済み）
- **値自体はここには記載しない**

---

## 現在確認できていること

- ✅ ローカルビルド成功（`npm run build` エラーなし）
- ✅ ローカルで診断フロー動作確認（フォーム → API → LLM結果表示）
- ✅ ローカルで URL 自動入力ボタン動作確認
- ✅ Netlify ビルド成功（`@netlify/plugin-nextjs` で API Routes が Functions として認識）
- ✅ PDF 保存機能（印刷用レイアウト + window.print）動作確認

---

## 次に確認すべきこと

1. **本番 URL でトップページが表示されるか**
2. **本番で診断フローを最後まで実行できるか**（LLM連携含む）
3. **Netlify 環境変数に `ANTHROPIC_API_KEY` が設定されているか**
4. スマホ実機での表示確認
5. Chrome / Safari / Edge での印刷プレビュー確認
