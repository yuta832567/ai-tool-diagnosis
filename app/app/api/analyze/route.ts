import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { buildDiagnosisResult } from '@/lib/scoring'
import type { FormData as DiagFormData, DiagnosisResult } from '@/lib/types'

// ─── LLM テキスト型 ───────────────────────────────────────────────────────────

interface LLMTexts {
  summary?: string
  deploymentStance?: string
  topReasons?: string[]
  toolComparisons?: Array<{ toolId: string; reason: string; caution: string }>
  usecaseCards?: Array<{
    title: string
    expectedEffect: string
    whyItFits: string
    howToStart: string
  }>
  readinessSummary?: string
  readinessNextActions?: string[]
  overallAssessment?: {
    whyThisTool?: string
    howToStart?: string
    cautionPoints?: string[]
  }
}

// ─── LLM 文章生成 ─────────────────────────────────────────────────────────────

async function generateLLMTexts(
  formData: DiagFormData,
  base: DiagnosisResult,
  apiKey: string
): Promise<LLMTexts> {
  const client = new Anthropic({ apiKey })

  const sorted = [...base.toolComparisons].sort((a, b) => b.score - a.score)
  const topTool = sorted[0]

  // スコアサマリー文字列
  const scoreLines = sorted
    .map((t) => `  ${t.name}: ${t.score}点`)
    .join('\n')

  // フォーム入力の主要項目
  const usecases = formData.usecases.join('・') || '（未記入）'
  const departments = formData.targetDepartments.join('・') || '（未記入）'
  const businessDesc = formData.businessDescription
    ? `「${formData.businessDescription.slice(0, 100)}」`
    : '（未記入）'

  const prompt = `あなたは生成AIツール導入を支援する専門家です。
以下の企業診断データをもとに、法人向け提案レポートの自然文テキストを生成してください。

## 企業情報
- 業種: ${formData.industry || '未記入'}
- 規模: ${formData.companySize || '未記入'}
- 事業内容: ${businessDesc}
- 社内ツール: ${formData.workEnvironment || '未記入'}
- 効率化したい業務: ${usecases}
- AIを使いたい部門: ${departments}
- 情報の扱い: ${formData.dataSensitivity || '未記入'}
- AIの利用状況: ${formData.aiUsageStatus || '未記入'}
- 始める範囲: ${formData.rolloutScope || '未記入'}
- 重視すること: ${formData.priorities.join('・') || '未記入'}
- 困っていること: ${formData.biggestPain ? `「${formData.biggestPain.slice(0, 80)}」` : '（未記入）'}

## スコアリング結果（ルールベース計算済み・変更不可）
- 推奨ツール: ${topTool.name}
${scoreLines}
- 導入準備度: ${base.readinessScore}点（${base.readinessLabel}）

## 生成ルール
- 断定を避け「〜の可能性があります」「まずは〜がおすすめです」を基本とする
- セキュリティは「安全」と断定せず「扱う情報に応じて整理が必要」と表現する
- 専門用語は極力使わず、意思決定者が読んで分かる言葉を使う
- 企業情報が少ない場合は汎用的な表現で対応する
- 各テキストは指定字数の目安を守ること

以下のJSONのみを返してください（コードブロック不要・余計な説明不要）:
{
  "summary": "推奨ツールと理由を1〜2文で（60字以内）",
  "deploymentStance": "導入の進め方の一言スタンス（30字以内）",
  "topReasons": [
    "推薦理由1（40字以内）",
    "推薦理由2（40字以内）",
    "推薦理由3（40字以内）"
  ],
  "toolComparisons": [
    { "toolId": "chatgpt", "reason": "向いているケース（50字以内）", "caution": "事前確認ポイント（50字以内）" },
    { "toolId": "copilot", "reason": "向いているケース（50字以内）", "caution": "事前確認ポイント（50字以内）" },
    { "toolId": "gemini",  "reason": "向いているケース（50字以内）", "caution": "事前確認ポイント（50字以内）" }
  ],
  "usecaseCards": [
    { "title": "業務名（15字以内）", "expectedEffect": "期待効果（40字以内）", "whyItFits": "なぜ合うか（40字以内）", "howToStart": "最初の試し方（40字以内）" },
    { "title": "業務名", "expectedEffect": "...", "whyItFits": "...", "howToStart": "..." },
    { "title": "業務名", "expectedEffect": "...", "whyItFits": "...", "howToStart": "..." }
  ],
  "readinessSummary": "現状評価（60字以内）",
  "readinessNextActions": [
    "次のアクション1（40字以内）",
    "次のアクション2（40字以内）",
    "次のアクション3（40字以内）"
  ],
  "overallAssessment": {
    "whyThisTool": "なぜこのツールが合うのか（80字以内）",
    "howToStart": "どう始めるべきか（80字以内）",
    "cautionPoints": [
      "注意点1（50字以内）",
      "注意点2（50字以内）"
    ]
  }
}`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  // JSON パース（コードブロックが混入した場合も除去）
  const jsonStr = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(jsonStr) as LLMTexts
}

// ─── LLM テキストをベース結果にマージ ─────────────────────────────────────────

function mergeWithLLMTexts(base: DiagnosisResult, llm: LLMTexts): DiagnosisResult {
  const result: DiagnosisResult = { ...base }

  if (llm.summary)          result.summary          = llm.summary
  if (llm.deploymentStance) result.deploymentStance = llm.deploymentStance
  if (llm.topReasons?.length === 3) result.topReasons = llm.topReasons

  if (llm.toolComparisons?.length) {
    result.toolComparisons = base.toolComparisons.map((tc) => {
      const llmTc = llm.toolComparisons!.find((l) => l.toolId === tc.toolId)
      if (!llmTc) return tc
      return {
        ...tc,
        reason:  llmTc.reason  || tc.reason,
        caution: llmTc.caution || tc.caution,
      }
    })
  }

  if (llm.usecaseCards?.length === 3) {
    result.usecaseCards = base.usecaseCards.map((uc, i) => {
      const llmUc = llm.usecaseCards![i]
      if (!llmUc) return uc
      return {
        title:          llmUc.title          || uc.title,
        expectedEffect: llmUc.expectedEffect || uc.expectedEffect,
        whyItFits:      llmUc.whyItFits      || uc.whyItFits,
        howToStart:     llmUc.howToStart     || uc.howToStart,
      }
    })
  }

  if (llm.readinessSummary || llm.readinessNextActions?.length === 3) {
    result.readinessDetail = {
      ...base.readinessDetail,
      summary:     llm.readinessSummary                    || base.readinessDetail.summary,
      nextActions: llm.readinessNextActions?.length === 3
        ? llm.readinessNextActions
        : base.readinessDetail.nextActions,
    }
  }

  if (llm.overallAssessment) {
    const oa = llm.overallAssessment
    result.overallAssessment = {
      whyThisTool:  oa.whyThisTool                || base.overallAssessment.whyThisTool,
      howToStart:   oa.howToStart                 || base.overallAssessment.howToStart,
      cautionPoints: oa.cautionPoints?.length
        ? oa.cautionPoints
        : base.overallAssessment.cautionPoints,
    }
  }

  return result
}

// ─── POST /api/analyze ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  // リクエストボディ取得
  let formData: DiagFormData
  try {
    formData = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // ルールベーススコア計算（必ず成功する）
  const baseResult = buildDiagnosisResult(formData)

  // API キーがなければルールベース結果をそのまま返す
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.info('[analyze] ANTHROPIC_API_KEY not set – returning rule-based result')
    return NextResponse.json(baseResult)
  }

  // LLM でテキスト生成 → 失敗時はルールベース結果にフォールバック
  try {
    const llmTexts = await generateLLMTexts(formData, baseResult, apiKey)
    const finalResult = mergeWithLLMTexts(baseResult, llmTexts)
    return NextResponse.json(finalResult)
  } catch (err) {
    console.error('[analyze] LLM generation failed, falling back to rule-based result:', err)
    return NextResponse.json(baseResult)
  }
}
