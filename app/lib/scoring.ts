import { FormData, DiagnosisResult, ToolComparison, ToolAxisScores, UsecaseCard, ReadinessDetail, OverallAssessment } from './types'
import environmentFit from '@/data/environmentFit.json'
import usecaseFit from '@/data/usecaseFit.json'
import tools from '@/data/tools.json'

const TOOL_IDS = ['chatgpt', 'copilot', 'gemini'] as const
type ToolId = (typeof TOOL_IDS)[number]

// ─── 環境タイプ変換 ──────────────────────────────────────────────────────────

function getEnvironmentType(workEnvironment: string): string {
  if (workEnvironment === 'Microsoft系が中心') return 'microsoft'
  if (workEnvironment === 'Google系が中心') return 'google'
  if (workEnvironment === '両方使っている') return 'mixed'
  return 'standalone'
}

// ─── ユースケースコード変換 ──────────────────────────────────────────────────

const usecaseMap: Record<string, string> = {
  'メール作成': 'email',
  '会議メモ・要約': 'meeting_summary',
  '提案書・企画書作成': 'proposal',
  '情報収集・下調べ': 'research',
  'マニュアル作成': 'manual',
  '翻訳': 'translation',
  'データ整理・分析': 'data_analysis',
  'Excel作業': 'excel',
  'コード作成・レビュー': 'coding',
  '問い合わせ対応': 'support',
  '採用・研修資料作成': 'training',
  'アイデア出し': 'ideation',
}

// ─── 個別スコア計算（生の配点値） ────────────────────────────────────────────

function calcEnvironmentRaw(toolId: string, envType: string): number {
  const entry = environmentFit.find(
    (e) => e.toolId === toolId && e.environmentType === envType
  )
  return entry?.score ?? 15  // max 35
}

function calcUsecaseRaw(toolId: string, usecases: string[]): number {
  if (usecases.length === 0) return 15  // max 30

  const codes = usecases.map((u) => usecaseMap[u]).filter(Boolean)
  if (codes.length === 0) return 15

  const total = codes.reduce((sum, code) => {
    const entry = usecaseFit.find((e) => e.toolId === toolId && e.usecaseCode === code)
    return sum + (entry?.score ?? 5)
  }, 0)

  const avg = total / codes.length
  return Math.round((avg / 10) * 30)
}

function calcInfoHandlingRaw(toolId: string, dataSensitivity: string): number {
  // max 15
  if (dataSensitivity === 'かなり慎重に扱う必要がある') {
    return toolId === 'copilot' ? 12 : 8
  }
  if (dataSensitivity === '顧客情報や社外秘も扱うことがある') {
    return toolId === 'copilot' ? 13 : 10
  }
  if (dataSensitivity === '社内資料も少し扱う') {
    return toolId === 'copilot' ? 14 : 12
  }
  return 15
}

function calcRolloutRaw(toolId: string, rolloutScope: string, workEnv: string): number {
  // max 10
  if (rolloutScope === 'まずは個人利用から') {
    if (toolId === 'chatgpt') return 10
    if (toolId === 'gemini') return 8
    return 6
  }
  if (rolloutScope === '全社で検討したい') {
    if (toolId === 'copilot' && workEnv === 'Microsoft系が中心') return 10
    if (toolId === 'gemini' && workEnv === 'Google系が中心') return 10
    if (toolId === 'chatgpt') return 7
    return 8
  }
  return 8
}

function calcBudgetRaw(toolId: string, budget: string): number {
  // max 10
  if (!budget || budget === 'まだ未定') return 8

  const isPriceConscious = budget === '〜2,000円' || budget === '〜5,000円'
  if (isPriceConscious) {
    if (toolId === 'chatgpt') return 10
    if (toolId === 'gemini') return 9
    return 4
  }
  return 9
}

// ─── 総合スコア計算 ──────────────────────────────────────────────────────────

export function calcToolScores(data: FormData): Record<ToolId, number> {
  const envType = getEnvironmentType(data.workEnvironment)
  const scores: Record<string, number> = {}

  for (const toolId of TOOL_IDS) {
    const total =
      calcEnvironmentRaw(toolId, envType) +
      calcUsecaseRaw(toolId, data.usecases) +
      calcInfoHandlingRaw(toolId, data.dataSensitivity) +
      calcRolloutRaw(toolId, data.rolloutScope, data.workEnvironment) +
      calcBudgetRaw(toolId, data.budgetPerUser)

    scores[toolId] = Math.min(100, Math.max(0, total))
  }

  return scores as Record<ToolId, number>
}

// ─── 5軸スコア（正規化 0-100） ────────────────────────────────────────────────

function getAxisScores(toolId: string, data: FormData): ToolAxisScores {
  const envType = getEnvironmentType(data.workEnvironment)

  const envRaw = calcEnvironmentRaw(toolId, envType)
  const usecaseRaw = calcUsecaseRaw(toolId, data.usecases)
  const infoRaw = calcInfoHandlingRaw(toolId, data.dataSensitivity)
  const rolloutRaw = calcRolloutRaw(toolId, data.rolloutScope, data.workEnvironment)
  const budgetRaw = calcBudgetRaw(toolId, data.budgetPerUser)

  return {
    environment: Math.round((envRaw / 35) * 100),
    usecase: Math.round((usecaseRaw / 30) * 100),
    infoHandling: Math.round((infoRaw / 15) * 100),
    rollout: Math.round((rolloutRaw / 10) * 100),
    budget: Math.round((budgetRaw / 10) * 100),
  }
}

// ─── 導入準備度 ──────────────────────────────────────────────────────────────

export function calcReadinessScore(data: FormData): number {
  let score = 0

  const aiUsageMap: Record<string, number> = {
    'すでにある程度使っている': 25,
    '部門で試している': 20,
    '一部の人が使っている': 15,
    'まだほとんど使っていない': 5,
  }
  score += aiUsageMap[data.aiUsageStatus] ?? 10

  const ownerMap: Record<string, number> = {
    'いる': 20,
    'これから決める': 12,
    'いない': 5,
  }
  score += ownerMap[data.aiOwner] ?? 10

  const scopeMap: Record<string, number> = {
    '特定の業務だけで試したい': 20,
    '一部の部署で試したい': 18,
    'まずは個人利用から': 16,
    '全社で検討したい': 12,
    'まだ未定': 5,
  }
  score += scopeMap[data.rolloutScope] ?? 10

  const sensitivityMap: Record<string, number> = {
    '公開情報や一般的な文書が中心': 20,
    '社内資料も少し扱う': 16,
    '顧客情報や社外秘も扱うことがある': 10,
    'かなり慎重に扱う必要がある': 6,
    'わからない': 8,
  }
  score += sensitivityMap[data.dataSensitivity] ?? 10

  let specificity = 0
  if (data.businessDescription.length > 20) specificity += 5
  if (data.biggestPain.length > 10) specificity += 5
  if (data.usecases.length >= 2) specificity += 5
  score += specificity

  return Math.min(100, Math.max(0, score))
}

// ─── 診断信頼度 ──────────────────────────────────────────────────────────────

export function calcConfidence(data: FormData): 'high' | 'medium' | 'low' {
  let score = 0
  if (data.industry) score += 2
  if (data.companySize) score += 2
  if (data.workEnvironment) score += 3
  if (data.usecases.length >= 2) score += 2
  if (data.dataSensitivity) score += 2
  if (data.businessDescription.length > 20) score += 1
  if (data.websiteUrl) score += 1
  if (score >= 10) return 'high'
  if (score >= 6) return 'medium'
  return 'low'
}

// ─── ツール比較データ生成 ────────────────────────────────────────────────────

function buildToolComparisons(
  scores: Record<ToolId, number>,
  data: FormData
): ToolComparison[] {
  const reasons: Record<ToolId, string> = {
    chatgpt:
      '特定プラットフォームへの依存が少なく、文章作成・アイデア整理・情報収集を横断的に活用できます。個人単位での試用開始がしやすい点も強みです。',
    copilot:
      'Outlook・Teams・Word・Excelと直接連携しており、現在の業務フローを大きく変えずにAIを組み込めます。企業向け管理機能も充実しています。',
    gemini:
      'Gmail・Googleドキュメント・スプレッドシートとのシームレスな連携が強みです。Google検索との統合で最新情報のリサーチにも優れています。',
  }

  const cautions: Record<ToolId, string> = {
    chatgpt:
      'Microsoft・Google製品への直接連携は追加設定が必要です。大規模な企業展開では管理機能の確認が必要です。',
    copilot:
      'Microsoft 365ライセンスが前提条件となり、導入コストが他より高めです。Google系ツール中心の環境では効果が限定的です。',
    gemini:
      'Google Workspace環境外では利便性が下がります。機密性の高い情報を扱う場合は利用ポリシーの事前確認が必要です。',
  }

  return TOOL_IDS.map((toolId) => {
    const tool = tools.find((t) => t.id === toolId)
    return {
      toolId,
      name: tool?.name ?? toolId,
      score: scores[toolId],
      reason: reasons[toolId],
      caution: cautions[toolId],
      axisScores: getAxisScores(toolId, data),
    }
  })
}

// ─── 活用業務カード生成 ──────────────────────────────────────────────────────

type UsecaseCardLibrary = Record<string, Record<string, UsecaseCard>>

const usecaseCardLibrary: UsecaseCardLibrary = {
  chatgpt: {
    'メール作成': {
      title: 'ビジネスメールの作成・改善',
      expectedEffect: '1通あたりの作成時間を最大50%短縮できる可能性があります',
      whyItFits: '文章の構成・トーン調整・校正が得意で、あらゆるビジネス文書に対応します',
      howToStart: '社内向けの定型メールから試し、効果を確認してから重要メールへ広げる',
    },
    '提案書・企画書作成': {
      title: '提案書・企画書のたたき台作成',
      expectedEffect: '初稿作成時間を40〜60%削減できる可能性があります',
      whyItFits: '構成案の立案やアイデア整理に強く、人間が仕上げるための下地作りに最適です',
      howToStart: '次回の提案でアウトライン作成のみAIに任せ、1週間で効果を確認する',
    },
    'アイデア出し': {
      title: 'ブレインストーミングの効率化',
      expectedEffect: 'アイデア出しの時間を半減し、議論の質を高める効果が期待できます',
      whyItFits: '多様な視点からのアイデア生成が得意で、思考の壁打ち相手として機能します',
      howToStart: '次回の企画会議の前日にAIとブレストを行い、候補リストを作成してみる',
    },
    '翻訳': {
      title: '多言語コンテンツの翻訳・ローカライズ',
      expectedEffect: '外部翻訳依頼コストを30〜70%削減できる可能性があります',
      whyItFits: '文脈を理解した自然な翻訳が得意で、ビジネス文書にも対応できます',
      howToStart: '社内向けの簡単な英文メールを翻訳させて精度を確認する',
    },
    '情報収集・下調べ': {
      title: '市場・競合調査の効率化',
      expectedEffect: '調査・まとめ作業の時間を最大40%短縮できる可能性があります',
      whyItFits: '情報の整理・要約・構造化が得意で、調査結果を素早くまとめることができます',
      howToStart: '次回の競合調査でAIを活用し、まとめ作業の時間を計測して比較する',
    },
    '会議メモ・要約': {
      title: '会議録・議事録の作成支援',
      expectedEffect: '議事録作成時間を60%以上削減できる可能性があります',
      whyItFits: '要約・構造化・アクション抽出が得意で、生テキストから素早く整理できます',
      howToStart: '次回の会議で録音テキストをAIに貼り付けて要約を試してみる',
    },
    'マニュアル作成': {
      title: 'マニュアル・手順書の文書化',
      expectedEffect: '文書作成時間を50%削減し、品質も均一化できる可能性があります',
      whyItFits: '手順の言語化・構造化・読みやすさの改善が得意です',
      howToStart: '社内で最も整備が遅れているマニュアルを1つ選んでAIと作成する',
    },
    'データ整理・分析': {
      title: 'データ整理・レポート作成支援',
      expectedEffect: 'データからのインサイト抽出時間を短縮できる可能性があります',
      whyItFits: 'データの要約や考察文の作成が得意で、分析結果の言語化を支援します',
      howToStart: '既存のExcel集計結果をAIに貼り付けて、考察文を生成させてみる',
    },
  },
  copilot: {
    'メール作成': {
      title: 'Outlookでのメール下書き自動化',
      expectedEffect: 'メール対応時間を最大50%削減できる可能性があります',
      whyItFits: 'Outlookと直接連携しており、返信文の自動下書きが画面上で完結します',
      howToStart: '月曜朝の定型返信メールをCopilotで下書きし、1週間の効果を確認する',
    },
    '会議メモ・要約': {
      title: 'TeamsミーティングのAI自動要約',
      expectedEffect: '議事録作成の工数をほぼゼロにできる可能性があります',
      whyItFits: 'Teamsと直接連携し、会議終了後に自動で要約・アクション抽出を行います',
      howToStart: '次回の定例会議でCopilotの録音・要約機能を試し、精度を評価する',
    },
    'Excel作業': {
      title: 'ExcelデータのAI分析・整理',
      expectedEffect: 'データ分析・集計作業時間を50%以上削減できる可能性があります',
      whyItFits: 'Excel上で直接AIが動作し、複雑な関数や分析を自然言語で指示できます',
      howToStart: '毎月の集計Excelを1つ選んでCopilotに分析を依頼し、工数を計測する',
    },
    '提案書・企画書作成': {
      title: 'Word/PowerPointでの提案書作成',
      expectedEffect: '提案書の初稿作成時間を40%削減できる可能性があります',
      whyItFits: 'Word・PowerPoint上で直接動作し、社内テンプレートを活かしながら作成できます',
      howToStart: '次の提案書でWord上のCopilotにアウトラインを作成させて評価する',
    },
    'データ整理・分析': {
      title: 'ExcelデータをAIで分析・可視化',
      expectedEffect: 'データからインサイトを得る時間を大幅に短縮できる可能性があります',
      whyItFits: 'ExcelのCopilotは自然言語でデータ分析を実行し、グラフや要約を自動作成します',
      howToStart: '既存の集計データにCopilotで「主な傾向を教えて」と問いかけてみる',
    },
    'マニュアル作成': {
      title: 'SharePointを活用した社内文書整備',
      expectedEffect: '社内ナレッジの整備・更新コストを削減できる可能性があります',
      whyItFits: 'SharePoint上の既存文書を参照しながら、AIが一貫性のある文書を作成します',
      howToStart: '既存マニュアルのリライト・更新をCopilotに依頼して比較してみる',
    },
    '情報収集・下調べ': {
      title: '社内情報の横断検索・集約',
      expectedEffect: '社内情報の検索・収集時間を50%以上削減できる可能性があります',
      whyItFits: 'SharePoint・OneDriveの社内ドキュメントを横断的に検索・要約できます',
      howToStart: '「先月の○○プロジェクトの決定事項を教えて」とCopilotに聞いてみる',
    },
  },
  gemini: {
    '情報収集・下調べ': {
      title: 'Google検索連携によるリサーチ効率化',
      expectedEffect: '調査・まとめ時間を40%以上短縮できる可能性があります',
      whyItFits: 'Google検索と連携して最新情報を参照しながら、調査結果を素早く整理します',
      howToStart: '次回の市場調査でGeminiに初期リサーチを依頼し、質と速度を評価する',
    },
    '会議メモ・要約': {
      title: 'Google MeetのAI自動要約',
      expectedEffect: '議事録作成時間をほぼゼロにできる可能性があります',
      whyItFits: 'Google Meetと連携し、会議内容を自動的にまとめてGoogleドキュメントに出力します',
      howToStart: '次回のGoogle Meetでレコーディングを有効にし、Geminiに要約を依頼する',
    },
    'メール作成': {
      title: 'GmailでのAIメール下書き',
      expectedEffect: 'メール対応時間を最大40%短縮できる可能性があります',
      whyItFits: 'Gmail上で直接動作し、受信メールの内容を踏まえた返信文を自動生成します',
      howToStart: '1日の受信メールのうち定型返信3通をGeminiで下書きして効果を確認する',
    },
    'データ整理・分析': {
      title: 'スプレッドシートのAI分析',
      expectedEffect: 'データ分析・レポート作成時間を50%削減できる可能性があります',
      whyItFits: 'Googleスプレッドシートと直接連携し、データの分析・可視化を自然言語で指示できます',
      howToStart: '月次レポートのスプレッドシートをGeminiに分析させ、精度を評価する',
    },
    '翻訳': {
      title: 'ビジネス文書の多言語対応',
      expectedEffect: '翻訳コスト・時間を大幅に削減できる可能性があります',
      whyItFits: 'Googleドキュメント上で直接翻訳でき、スムーズなワークフローを維持できます',
      howToStart: '英語のメール返信や資料翻訳をGeminiで試し、品質を確認する',
    },
    '提案書・企画書作成': {
      title: 'Googleドキュメントでの提案書作成',
      expectedEffect: '提案書の初稿作成時間を30〜50%削減できる可能性があります',
      whyItFits: 'Googleドキュメント上で直接動作し、既存テンプレートを活かした作成ができます',
      howToStart: '次の提案書でGeminiにアウトラインを作成させて評価する',
    },
  },
}

function buildUsecaseCards(data: FormData, topToolId: string): UsecaseCard[] {
  const library = usecaseCardLibrary[topToolId] ?? usecaseCardLibrary['chatgpt']

  // ユーザーが選んだ業務でマッチするものを優先
  const matched = data.usecases
    .map((u) => library[u])
    .filter((c): c is UsecaseCard => !!c)
    .slice(0, 3)

  // 足りない場合はライブラリから補完
  if (matched.length < 3) {
    const extras = Object.values(library)
      .filter((c) => !matched.includes(c))
      .slice(0, 3 - matched.length)
    return [...matched, ...extras].slice(0, 3)
  }

  return matched
}

// ─── 導入準備度詳細 ──────────────────────────────────────────────────────────

function buildReadinessDetail(data: FormData, score: number): ReadinessDetail {
  const label =
    score >= 80
      ? 'すぐ試せる状態'
      : score >= 60
      ? '一部業務から始めやすい'
      : score >= 40
      ? '先に対象業務の整理が必要'
      : 'まず社内方針の整理が必要'

  const definition =
    'このスコアは、AI利用経験・推進体制・導入範囲の明確さ・情報管理の整理度・回答の具体性の5項目から算出しています。スコアが高いほど、現時点でスムーズに試験導入へ移行しやすい状態を示します。'

  const summaryMap: [number, string][] = [
    [80, '現時点で試験導入を開始できる状態が整っています。推進担当を中心に、具体的な業務での試用フェーズへ進めることをおすすめします。'],
    [60, '一部の業務・部署に限定した試験導入であれば、現時点から始めることが可能です。まずは小さく始めて成果を確認しながら広げる進め方が現実的です。'],
    [40, '導入の目的と対象業務を先に明確にすることで、試験導入の成功確率が高まります。社内で「まず何に使うか」を決めてから動くことをおすすめします。'],
    [0, '組織としてAIを活用するための基盤整備が必要な段階です。推進担当の選定・社内方針の策定・利用ルールの検討を先に進めることで、導入の成果が高まります。'],
  ]

  const summary = (summaryMap.find(([threshold]) => score >= threshold) ?? summaryMap[3])[1]

  const nextActions: string[] = []

  if (data.aiOwner === 'いない') {
    nextActions.push('社内のAI推進担当者（または旗振り役）を1名決める')
  } else {
    nextActions.push('推進担当を中心に試用計画を1枚にまとめる')
  }

  if (!data.rolloutScope || data.rolloutScope === 'まだ未定') {
    nextActions.push('まず試用する業務と部署を1つに絞り込む')
  } else {
    nextActions.push(`「${data.rolloutScope}」の方針のもと、最初の試用業務を決定する`)
  }

  if (
    data.dataSensitivity === 'かなり慎重に扱う必要がある' ||
    data.dataSensitivity === '顧客情報や社外秘も扱うことがある'
  ) {
    nextActions.push('AIへの入力可否ルール（情報の取り扱いガイドライン）を事前に整備する')
  } else {
    nextActions.push('試用期間中の評価基準（何をもって成功とするか）を事前に決めておく')
  }

  return { score, label, definition, summary, nextActions }
}

// ─── 総合所見生成 ────────────────────────────────────────────────────────────

function buildOverallAssessment(
  data: FormData,
  topToolId: ToolId,
  readinessScore: number
): OverallAssessment {
  const toolNames: Record<ToolId, string> = {
    chatgpt: 'ChatGPT',
    copilot: 'Microsoft 365 Copilot',
    gemini: 'Google Gemini',
  }
  const toolName = toolNames[topToolId]

  const envContext =
    data.workEnvironment === 'Microsoft系が中心'
      ? '現在のMicrosoft中心の環境と高い親和性を持つ'
      : data.workEnvironment === 'Google系が中心'
      ? '現在のGoogle中心の環境とシームレスに連携できる'
      : '特定プラットフォームに依存せず幅広い業務に対応できる'

  const whyThisTool = `${toolName}は、${envContext}ツールです。選択された業務（${
    data.usecases.slice(0, 2).join('・') || '業務効率化'
  }）においても相性が高く、入力内容を総合すると最も現実的な第一選択肢として浮かび上がりました。ただし、これは相性の傾向を示すものであり、断定的な推薦ではありません。`

  const howToStartMap: Record<string, string> = {
    'まずは個人利用から': '最初の1〜2週間は、特定の業務を担当する1〜2名が個人で試用し、業務時間の変化や使い勝手を記録することをおすすめします。その後、効果を社内で共有して拡大を判断してください。',
    '一部の部署で試したい': `${data.targetDepartments.slice(0, 1).join('')}部門の2〜5名を対象に、1〜2ヶ月の試験期間を設けることをおすすめします。期間中は業務時間の変化と課題を記録し、全社展開の判断材料とするのが現実的です。`,
    '特定の業務だけで試したい': '対象業務に絞った試験期間（推奨: 4〜8週間）を設け、Before/Afterで工数や品質の変化を計測することをおすすめします。小さく試して結果を見てから判断するアプローチが成功率を高めます。',
    '全社で検討したい': '全社展開を視野に入れつつも、まず1部署・1業務での先行試験を経てから判断することをおすすめします。いきなり全社導入は失敗リスクが高く、段階的な展開が現実的です。',
    'まだ未定': 'まずは利用範囲を小さく決めて、試験的に始めることをおすすめします。「まず何に使うか」を先に決めることが、AI導入成功の最初のステップです。',
  }

  const howToStart =
    howToStartMap[data.rolloutScope] ??
    '小規模から試験導入を開始し、効果を確認してから段階的に広げることをおすすめします。'

  const cautionPoints: string[] = []

  if (
    data.dataSensitivity === 'かなり慎重に扱う必要がある' ||
    data.dataSensitivity === '顧客情報や社外秘も扱うことがある'
  ) {
    cautionPoints.push(
      '扱う情報に機密性の高い内容が含まれる場合、AIへの入力可否を事前にルール化することが必要です。「安全」と断定できるツールはなく、利用する情報の種類に応じた整理が不可欠です。'
    )
  }

  if (data.aiOwner === 'いない') {
    cautionPoints.push(
      '現時点でAI推進の担当者がいない場合、導入後のフォローアップや社内展開が停滞しやすくなります。担当者の選定を先行させることをおすすめします。'
    )
  }

  if (readinessScore < 50) {
    cautionPoints.push(
      '導入準備度が比較的低い段階です。ツール選定よりも先に、「何のために・どの業務に・誰が使うか」を明確にすることが、成功確率を高める最重要ステップです。'
    )
  }

  if (cautionPoints.length === 0) {
    cautionPoints.push(
      'どのツールもAIへの過信は禁物です。試用期間中は必ず人間がアウトプットを確認・編集する運用を徹底してください。'
    )
  }

  return { whyThisTool, howToStart, cautionPoints }
}

// ─── 導入スタンス・推薦理由 ──────────────────────────────────────────────────

function buildDeploymentStance(data: FormData, readinessScore: number): string {
  if (readinessScore >= 75) return '積極的な試験導入が可能'
  if (readinessScore >= 55) return '一部業務からの段階的導入が現実的'
  if (readinessScore >= 35) return '対象業務の絞り込みを先行させてから導入'
  return '社内方針・体制整備を先に進めることを推奨'
}

function buildTopReasons(data: FormData, topToolId: ToolId): string[] {
  const reasons: string[] = []

  if (data.workEnvironment === 'Microsoft系が中心' && topToolId === 'copilot') {
    reasons.push('既存のMicrosoft環境（Outlook・Teams・Excel）とシームレスに連携できる')
  } else if (data.workEnvironment === 'Google系が中心' && topToolId === 'gemini') {
    reasons.push('既存のGoogle環境（Gmail・スプレッドシート）と直接連携できる')
  } else {
    reasons.push('特定ツールへの依存が少なく、あらゆる業務環境で利用しやすい')
  }

  const topUsecase = data.usecases[0]
  if (topUsecase) {
    const usecaseReasons: Record<ToolId, string> = {
      chatgpt: `「${topUsecase}」に対して文章生成・構成力が高い適合性を示している`,
      copilot: `「${topUsecase}」をMicrosoft製品上で直接・シームレスに実行できる`,
      gemini: `「${topUsecase}」においてGoogle検索との連携で高い効果が期待できる`,
    }
    reasons.push(usecaseReasons[topToolId])
  } else {
    reasons.push('選択された業務用途との相性が3ツール中で最も高い')
  }

  if (data.rolloutScope === 'まずは個人利用から' || data.initialUsers === '1〜5名') {
    const startabilityReasons: Record<ToolId, string> = {
      chatgpt: '個人プランから始められ、初期コストを抑えながら効果検証できる',
      copilot: '既存M365ライセンス上でのアドオン追加で導入障壁が低い',
      gemini: 'Google Workspace環境なら低コストで追加導入できる',
    }
    reasons.push(startabilityReasons[topToolId])
  } else {
    const scaleReasons: Record<ToolId, string> = {
      chatgpt: 'チームプランへの移行がしやすく、段階的な拡大に対応できる',
      copilot: '企業向け管理機能が充実しており、組織展開時の管理負担が少ない',
      gemini: 'Google Workspaceの管理コンソールから一元管理できる',
    }
    reasons.push(scaleReasons[topToolId])
  }

  return reasons
}

// ─── メイン：診断結果生成 ─────────────────────────────────────────────────────

export function buildDiagnosisResult(data: FormData): DiagnosisResult {
  const toolScores = calcToolScores(data)
  const readinessScore = calcReadinessScore(data)
  const confidence = calcConfidence(data)

  const topToolId = (
    Object.entries(toolScores).sort(([, a], [, b]) => b - a)[0][0]
  ) as ToolId

  const topTool = tools.find((t) => t.id === topToolId)
  const toolComparisons = buildToolComparisons(toolScores, data)
  const usecaseCards = buildUsecaseCards(data, topToolId)
  const readinessDetail = buildReadinessDetail(data, readinessScore)
  const overallAssessment = buildOverallAssessment(data, topToolId, readinessScore)
  const deploymentStance = buildDeploymentStance(data, readinessScore)
  const topReasons = buildTopReasons(data, topToolId)

  const envName =
    data.workEnvironment === 'Microsoft系が中心'
      ? 'Microsoft環境との高い親和性を持ち、'
      : data.workEnvironment === 'Google系が中心'
      ? 'Google環境との高い親和性を持ち、'
      : ''

  const summary = `入力内容をもとに分析した結果、${envName}${topTool?.name ?? topToolId}が最も相性の良いツールとして浮かび上がりました。まずは小規模な試験導入から始めることをおすすめします。`

  const readinessLabel = readinessDetail.label

  const cautionMessage =
    data.dataSensitivity === 'かなり慎重に扱う必要がある' ||
    data.dataSensitivity === '顧客情報や社外秘も扱うことがある'
      ? '扱う情報が機密性の高い内容を含む場合、AIツールへの入力範囲を事前に社内でルール化することが必要です。'
      : undefined

  return {
    recommendedTool: topTool?.name ?? topToolId,
    toolScores,
    confidence,
    deploymentStance,
    topReasons,
    summary,
    toolComparisons,
    usecaseCards,
    readinessDetail,
    overallAssessment,
    // 後方互換フィールド
    readinessScore,
    readinessLabel,
    recommendedUsecases: usecaseCards.map((c) => c.title),
    nextSteps: readinessDetail.nextActions,
    cautionMessage,
  }
}
