# Supabase セットアップ手順

## 1. Supabase プロジェクト作成

1. https://supabase.com にログイン
2. 「New Project」を作成
3. プロジェクト名・パスワード・リージョン（Japan / Tokyo）を設定

---

## 2. 必要な環境変数の取得

Supabase ダッシュボード > Settings > API から以下を取得:

| 環境変数名 | 取得場所 |
|---|---|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role (secret) |

⚠️ `SUPABASE_SERVICE_ROLE_KEY` は絶対に公開しないこと（サーバー専用）

---

## 3. テーブル作成 SQL

Supabase ダッシュボード > SQL Editor で以下を実行:

```sql
-- 診断セッションテーブル
create table diagnosis_sessions (
  id                   uuid        primary key default gen_random_uuid(),
  created_at           timestamptz default now(),

  -- 必須：氏名
  full_name            text        not null,

  -- 基本情報（一覧表示用・個別カラム）
  job_title            text,
  company_name         text,
  industry             text,
  recommended_tool     text,
  score_chatgpt        integer,
  score_copilot        integer,
  score_gemini         integer,
  readiness_score      integer,
  estimated_time_saving text,

  -- フォーム入力・診断結果（全量保存）
  form_data            jsonb       not null,
  result               jsonb       not null
);

-- インデックス（一覧の日時降順ソート用）
create index diagnosis_sessions_created_at_idx
  on diagnosis_sessions (created_at desc);

-- RLS 有効化（anon からの直接アクセスを遮断）
alter table diagnosis_sessions enable row level security;

-- service_role のみフルアクセスを許可
-- （Next.js サーバーサイドから service_role キーで接続するため、
--   実際には RLS は適用されないが、anon アクセスの保険として設定）
create policy "service_role full access"
  on diagnosis_sessions
  for all
  using (auth.role() = 'service_role');
```

---

## 4. 環境変数の設定

### ローカル開発

`app/.env.local` を作成（`.gitignore` で除外済み）:

```env
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ADMIN_DASHBOARD_PASSWORD=aim230815
ANTHROPIC_API_KEY=sk-ant-...
```

### Vercel（本番）

Vercel ダッシュボード > プロジェクト > Settings > Environment Variables に追加:

| 変数名 | 対象環境 |
|---|---|
| `SUPABASE_URL` | Production / Preview / Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production / Preview / Development |
| `ADMIN_DASHBOARD_PASSWORD` | Production / Preview / Development |
| `ANTHROPIC_API_KEY` | Production / Preview / Development |

---

## 5. 動作確認

1. ローカルで `npm run dev` を起動
2. 診断フォームを最後まで実行
3. Supabase ダッシュボード > Table Editor > `diagnosis_sessions` にレコードが追加されることを確認
4. `/admin` にアクセス → パスワードでログイン → 一覧画面を確認

---

## 注意事項

- `SUPABASE_SERVICE_ROLE_KEY` は Next.js サーバーサイド（API Route / Server Component）のみで使用
- `NEXT_PUBLIC_` プレフィックスをつけないこと（クライアントに公開されてしまう）
- RLS が有効なため、anon キーでは `diagnosis_sessions` にアクセスできない設計
