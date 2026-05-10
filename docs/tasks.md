# Tasks

## Phase 1: 環境構築
- [x] app フォルダで Next.js プロジェクトを作成する（Next.js 16 + TypeScript + Tailwind v4）
- [x] Git 管理を開始する（ai-tool-diagnosis/ ルートで初期化済み・GitHub push 済み）
- [x] Claude Code をインストールする
- [x] ローカルでアプリを起動できるようにする

## Phase 2: 仕様の反映
- [x] docs/spec.md の内容を確認する
- [x] docs/decisions.md を更新する
- [x] 画面構成を決める
- [x] フォーム項目を型として定義する（`lib/types.ts`）

## Phase 3: UI実装
- [x] トップページを作る（ヒーローセクション・ツール紹介・フォームエリア）
- [x] 3ステップの診断フォームを作る（`DiagnosisForm.tsx`）
- [x] 進捗バーを表示する（`ProgressBar.tsx`）
- [x] 各設問の入力UIを作る（Step1〜3 各コンポーネント）
- [x] その他選択時の自由記述欄を表示する
- [x] 結果画面の見た目を作る
  - [x] 初期版（カジュアルな診断UI）
  - [x] 「簡易提案レポート」形式にリデザイン（2026-04-08 完了）

## Phase 4: データ設計
- [x] 比較対象ツールの静的データを作る（`data/tools.json`）
- [x] 環境相性データを作る（`data/environmentFit.json`）
- [x] 用途別相性データを作る（`data/usecaseFit.json`）
- [ ] 導入準備度ルールを独立ファイルで管理する（現状は scoring.ts にインライン実装）
- [x] レポート文テンプレートを作る（scoring.ts 内の生成ロジックで対応）

## Phase 5: 診断ロジック
- [x] ツール適合性スコア計算を実装する（`lib/scoring.ts`）
- [x] 導入準備度スコア計算を実装する
- [x] 診断信頼度を実装する（high / medium / low）
- [x] 推薦順位を返す処理を作る
- [x] 結果画面にスコアを反映する
- [x] 5軸スコア（正規化 0〜100）の計算と表示
- [x] 活用業務カード（UsecaseCard）の生成ロジック
- [x] 総合所見・導入スタンス・推薦理由の生成ロジック

## Phase 6: URL解析とレポート生成 ← **2026-04-09 完了**
- [x] `app/app/api/analyze/route.ts` を作る（Next.js Route Handler）
- [x] `app/lib/websiteParser.ts` を作る（HTML取得・本文抽出）
- [x] `app/app/api/parse-url/route.ts` を作る（URL要約）
- [x] 診断結果の自然文レポートをLLMで生成する（`claude-sonnet-4-6`）
- [x] `netlify.toml` を作成する（root + app/ の2ファイル構成）
- [x] `@netlify/plugin-nextjs` を追加・設定する

## Phase 6b: 結果画面UI強化・PDF対応 ← **2026-04-09 完了**
- [x] ツール比較を横スクロール対応の3列テーブルに変更
- [x] 導入準備度にSVGゲージ（円形）を実装
- [x] セクションヘッダーを数字バッジ+大文字ラベルに統一
- [x] 総合所見を左サイドボーダースタイルに変更
- [x] 印刷専用ヘッダー（会社名・診断日・信頼度）を追加
- [x] 「レポートを保存」ボタン実装（window.print + ツールチップ案内）
- [x] @media print スタイル追加（globals.css）
- [x] DiagnosisResult に companyName props 追加・DiagnosisForm から受け渡し

## Phase 7: 公開準備 ← **2026-04-09 Netlify デプロイ完了**
- [x] Netlify に接続してデプロイする（ai-tool-diagnosis-2）
- [x] GitHub にリポジトリを作成して push する
- [ ] **Netlify 環境変数に `ANTHROPIC_API_KEY` を設定する** ← 要確認
- [ ] 本番URLで動作確認する（トップページ表示・診断フロー・LLM連携）

## Phase 8: 最終確認
- [ ] スマホで確認する
- [ ] PCで確認する
- [ ] 入力エラー時の表示を確認する
- [ ] URL解析に失敗しても診断できることを確認する
- [ ] Chrome / Safari / Edge での印刷プレビュー確認
- [x] 文言を最終調整する（2026-04-25 完了：体言止め統一・各種ラベル修正）

---

## Phase 9: UI ブラッシュアップ ← **2026-05-09 完了**
- [x] ヘッダーに AIM ロゴを配置（`aim-logo.png` / 全フォームページ共通）
- [x] FV に背景画像を追加（`fv-bg.jpg` + オーバーレイ + テキスト白系に変更）
- [x] ボタン背景色を `#0072A0` に統一（プライマリ・セカンダリ）
- [x] 「エグゼクティブサマリー」→「まずお伝えしたいこと」に変更
- [x] レポート画面に「ホームページはこちら →」リンクを追加（`https://ai-management.biz`）
- [x] CTAセクションの「無料相談を申し込む」ボタンを削除（重複解消）

## Phase 9b: UIアクセントカラー統一 ← **2026-05-10 本番確認完了**

- [x] 紫/indigo系アクセントカラーを `#0072A0`（AIM ブルー）に統一（commit `dab9783`）
  - Step番号アイコン・進捗バー（`ProgressBar.tsx`）
  - 選択チップ（`MultiSelectChip.tsx`）・選択カード（`SelectCard.tsx`）
  - ローディングスピナー（`DiagnosisForm.tsx`）
  - 診断結果「推奨」バッジ・「期待効果」ブロック・次のアクション番号アイコン・左ボーダー（`DiagnosisResult.tsx`）
  - 各ステップ入力フィールドの `focus:ring`（`Step1〜3`）
- [x] Vercel 本番確認済み（紫/indigo 系アクセントカラーなし）

## Phase 10: Supabase連携・管理画面 ← **2026-05-10 本番確認完了**

### 実装完了
- [x] `@supabase/supabase-js` のインストール
- [x] `app/lib/supabase.ts` 作成（service_role クライアント・サーバー専用）
- [x] `app/lib/adminAuth.ts` 作成（Cookie ベース簡易認証・HMAC-SHA256）
- [x] `app/lib/types.ts` 更新（`fullName`・`jobTitle` を FormData に追加、`estimatedTimeSaving` を DiagnosisResult に追加）
- [x] `app/lib/scoring.ts` 更新（`calcEstimatedTimeSaving()` 追加・業務別基準値×準備度倍率）
- [x] `app/components/steps/Step1Company.tsx` 更新（氏名必須・役職任意フィールドを先頭に追加）
- [x] `app/components/form/DiagnosisForm.tsx` 更新（`fullName` 必須バリデーション追加）
- [x] `app/app/api/analyze/route.ts` 更新（診断完了後に Supabase へ保存）
- [x] `/admin` ログイン画面（`app/app/admin/page.tsx`）
- [x] `/admin/sessions` 診断一覧画面（Server Component・Supabase 直接クエリ）
- [x] `/admin/sessions/[id]` 診断詳細画面（Server Component）
- [x] `POST /api/admin/login` 認証 API
- [x] `POST /api/admin/logout` ログアウト API
- [x] `app/.env.local.example` 作成（必要な環境変数テンプレート）
- [x] `docs/supabase-setup.md` 作成（テーブル作成SQL・設定手順）
- [x] FV の「データ保存なし」文言を「即時結果表示」に修正
- [x] `npm run build` 成功確認
- [x] commit `aa0cff3`・`main` へ push 済み

### インフラ設定完了（2026-05-10）
- [x] Supabase プロジェクト作成・SQL 実行（`diagnosis_sessions` テーブル・RLS 設定）
- [x] Vercel 環境変数設定（`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `ADMIN_DASHBOARD_PASSWORD` / `ANTHROPIC_API_KEY`）
- [x] Vercel 本番デプロイ確認（commit `aa0cff3` 反映済み）

### 本番動作確認済み（2026-05-10）
- [x] トップ画面表示・氏名必須フィールド表示
- [x] 診断フォーム送信（LLM連携）
- [x] Supabase `diagnosis_sessions` への保存
- [x] `/admin` ログイン（`ADMIN_DASHBOARD_PASSWORD` で認証）
- [x] `/admin/sessions` 一覧表示（保存されたレコード確認）
- [x] `/admin/sessions/[id]` 詳細表示

### 残タスク
- [ ] Next.js 高重要度脆弱性（GHSA-q4gf-8mx6-v5v3）の対応検討（`next@16.2.6` で解消可能・breaking change リスクあり）
- [ ] 管理画面認証の将来的な Supabase Auth 移行検討（現状は HMAC-SHA256 Cookie ベース）

## 追加タスク（今後の改善候補）
- [ ] 結果画面のさらなる改善（LLM生成テキスト差し替え後の品質確認）
- [ ] `data/readinessRules.json` を独立ファイルに切り出す
- [ ] フォームバリデーションの改善（スクロール位置のハイライト等）
- [ ] OGP・メタデータの設定
- [ ] アクセス解析の簡易対応（Netlify Analytics など）
- [x] ツール詳細モーダルの実装（2026-04-25 完了：静的データ + 料金 + 最終更新日表示）
- [ ] 料金情報の自動取得 API 実装（`GET /api/tool-pricing`：公式ページ参照・キャッシュ・フォールバック）
