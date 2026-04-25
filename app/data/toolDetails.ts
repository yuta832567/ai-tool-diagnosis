// ツール詳細データ（静的フォールバック）
// 将来的に GET /api/tool-pricing で pricing を上書きできるよう、
// pricing を独立したブロックとして分離している

export interface ToolPricingPlan {
  name: string
  price: string
  note?: string
}

export interface ToolPricing {
  plans: ToolPricingPlan[]
  lastUpdated: string // ISO 8601 date string
  source: string     // 参照元 URL（将来の自動取得でも同フィールドを使う）
}

export interface ToolDetail {
  id: string
  name: string
  overview: string
  features: string[]
  idealCases: string[]
  cautions: string[]
  pricing: ToolPricing
}

// ──────────────────────────────────────────────────────────────────────────────
// 静的データ（2025-04 時点）
// ──────────────────────────────────────────────────────────────────────────────

export const toolDetails: ToolDetail[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    overview:
      'OpenAI が提供する汎用 AI チャットツール。文章作成・アイデア出し・情報整理など幅広い業務に対応。特定のツール環境に依存せず、ブラウザや API から利用できる。',
    features: [
      '文章生成・編集・要約の精度が高い',
      'アイデア出しやブレインストーミングに強い',
      'プラグイン・カスタム GPT による機能拡張が可能',
      'API 経由で社内システムへの組み込みも対応',
      '個人から始めやすいプラン構成',
    ],
    idealCases: [
      '文章作成・提案書ドラフトを素早く仕上げたい',
      'Microsoft / Google どちらの環境にも縛られたくない',
      'まず個人で試してから組織展開を検討したい',
      'アイデア出しや壁打ち相手として活用したい',
    ],
    cautions: [
      'Microsoft・Google 製品との直接連携は限定的（プラグイン等で補完可）',
      '企業向けの管理・監査機能は Team 以上のプランが必要',
      '社内ドキュメントの参照には別途設定や連携が必要',
    ],
    pricing: {
      plans: [
        { name: 'Free', price: '無料', note: '基本機能、利用制限あり' },
        { name: 'Plus', price: '$20 / 月（個人）', note: 'GPT-4o フル利用・高速応答' },
        { name: 'Team', price: '$25 / ユーザー / 月', note: '最低2名、管理コンソール付き' },
        { name: 'Enterprise', price: '要見積もり', note: 'SSO・監査ログ・高度なセキュリティ対応' },
      ],
      lastUpdated: '2025-04-01',
      source: 'https://openai.com/chatgpt/pricing',
    },
  },
  {
    id: 'copilot',
    name: 'Microsoft 365 Copilot',
    overview:
      'Microsoft が提供する AI アシスタント。Word・Excel・PowerPoint・Teams・Outlook など Microsoft 365 製品に深く統合されており、既存のワークフローをそのまま AI 化できる。',
    features: [
      'Word・Excel・PowerPoint・Teams・Outlook で直接 AI を呼び出せる',
      'SharePoint や OneDrive の社内ドキュメントを参照した回答が可能',
      '会議の自動要約・アクションアイテム抽出（Teams Copilot）',
      'Excel の数式・グラフ作成を自然言語で指示できる',
      '企業向けセキュリティ・コンプライアンス機能が充実',
    ],
    idealCases: [
      'すでに Microsoft 365 を全社利用している',
      'Excel・Word・PowerPoint の作業を AI で効率化したい',
      '会議メモや議事録を自動生成したい',
      '社内文書を参照しながら回答を生成させたい',
    ],
    cautions: [
      'Microsoft 365 ライセンス（Business Standard 以上推奨）が前提',
      '他ツールより価格が高め（ベースライセンス + Copilot 追加費用）',
      'Google Workspace や Slack など非 Microsoft 製品との連携は弱い',
    ],
    pricing: {
      plans: [
        {
          name: 'Microsoft 365 Business Basic',
          price: '$6 / ユーザー / 月',
          note: 'ベースライセンス（Copilot は別途追加）',
        },
        {
          name: 'Microsoft 365 Business Standard',
          price: '$12.50 / ユーザー / 月',
          note: 'ベースライセンス（Copilot は別途追加）',
        },
        {
          name: 'Microsoft 365 Copilot（追加）',
          price: '$30 / ユーザー / 月',
          note: '対象ライセンスに追加する形で契約',
        },
      ],
      lastUpdated: '2025-04-01',
      source: 'https://www.microsoft.com/ja-jp/microsoft-365/business/compare-all-plans',
    },
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    overview:
      'Google が提供する AI アシスタント。Gmail・Googleドキュメント・スプレッドシート・Google Meet など Google Workspace 製品と連携し、Google 検索との統合により最新情報の参照に強い。',
    features: [
      'Gmail・Googleドキュメント・スプレッドシート・スライドで直接利用可能',
      'Google 検索との連携で最新ニュース・情報を参照した回答が得意',
      'Google Drive 内のドキュメントを参照しての Q&A',
      '画像・動画・音声などマルチモーダル対応',
      'Google Workspace ユーザーは追加コストを抑えやすい',
    ],
    idealCases: [
      'すでに Google Workspace（G Suite）を全社利用している',
      'リサーチや情報収集を AI でサポートしたい',
      'Gmail・Google Meet での業務効率化を図りたい',
      '最新情報を踏まえた回答が欲しい',
    ],
    cautions: [
      'Google Workspace が前提（個人利用は Google One AI プレミアムプラン）',
      'Microsoft 365 製品（Word・Excel 等）との連携は弱い',
      '文章生成の質は ChatGPT と比較されることが多く、用途によって差が出る',
    ],
    pricing: {
      plans: [
        {
          name: 'Gemini（無料）',
          price: '無料',
          note: 'Gemini 1.5 Flash、利用制限あり',
        },
        {
          name: 'Google One AI プレミアム',
          price: '$19.99 / 月（個人）',
          note: 'Gemini Advanced（個人向け上位モデル）',
        },
        {
          name: 'Gemini for Workspace Business',
          price: '$20 / ユーザー / 月',
          note: 'Workspace アドオン、管理機能付き',
        },
        {
          name: 'Gemini for Workspace Enterprise',
          price: '$30 / ユーザー / 月',
          note: '高度なセキュリティ・監査ログ対応',
        },
      ],
      lastUpdated: '2025-04-01',
      source: 'https://workspace.google.com/intl/ja/pricing',
    },
  },
]

// ID でツール詳細を取得するユーティリティ
export function getToolDetail(id: string): ToolDetail | undefined {
  return toolDetails.find((t) => t.id === id)
}
