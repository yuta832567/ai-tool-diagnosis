'use client'

import { useState } from 'react'
import type { DiagnosisResult, ToolComparison, ToolAxisScores, UsecaseCard, ReadinessDetail, OverallAssessment } from '@/lib/types'

interface Props {
  result: DiagnosisResult
  onRetry: () => void
  companyName?: string
}

// ─── ツールメタ ───────────────────────────────────────────────────────────────

const toolMeta: Record<string, {
  textClass: string
  bgClass: string
  borderClass: string
  barClass: string
  thBgClass: string
  gaugeHex: string
}> = {
  chatgpt: {
    textClass: 'text-emerald-700',
    bgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-200',
    barClass: 'bg-emerald-500',
    thBgClass: 'bg-emerald-100',
    gaugeHex: '#10b981',
  },
  copilot: {
    textClass: 'text-blue-700',
    bgClass: 'bg-blue-50',
    borderClass: 'border-blue-200',
    barClass: 'bg-blue-500',
    thBgClass: 'bg-blue-100',
    gaugeHex: '#3b82f6',
  },
  gemini: {
    textClass: 'text-violet-700',
    bgClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
    barClass: 'bg-violet-500',
    thBgClass: 'bg-violet-100',
    gaugeHex: '#8b5cf6',
  },
}

const confidenceConfig = {
  high:   { label: '診断精度 高', style: 'bg-green-50 text-green-700 border-green-200' },
  medium: { label: '診断精度 中', style: 'bg-amber-50 text-amber-700 border-amber-200' },
  low:    { label: '診断精度 低', style: 'bg-slate-100 text-slate-500 border-slate-200' },
}

const axisLabels: Record<keyof ToolAxisScores, string> = {
  environment: '既存ツールとの相性',
  usecase:     '業務との相性',
  rollout:     '始めやすさ',
  infoHandling:'情報の扱いやすさ',
  budget:      '費用感との相性',
}

// ─── 共通パーツ ───────────────────────────────────────────────────────────────

function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
        {num}
      </span>
      <h3 className="text-xs font-black tracking-widest text-slate-600 uppercase">{title}</h3>
    </div>
  )
}

function HBar({ score, colorClass }: { score: number; colorClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-7 text-right text-xs font-bold text-slate-700 tabular-nums">{score}</span>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-slate-100 my-5" />
}

// ─── 印刷専用ヘッダー（画面では非表示） ──────────────────────────────────────

function PrintOnlyHeader({
  companyName,
  confidence,
}: {
  companyName?: string
  confidence: keyof typeof confidenceConfig
}) {
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const conf = confidenceConfig[confidence]

  return (
    <div className="hidden print:block mb-8 pb-6 border-b-2 border-slate-900">
      <p className="text-xs tracking-widest text-slate-500 mb-2 uppercase">生成AIツール適合性診断</p>
      <h1 className="text-3xl font-black text-slate-900 mb-3">簡易提案レポート</h1>
      <div className="flex items-center gap-5 text-sm text-slate-600">
        {companyName && <span className="font-semibold">{companyName} 御中</span>}
        <span>診断日：{today}</span>
        <span className={`text-xs px-2 py-0.5 rounded border ${conf.style}`}>{conf.label}</span>
      </div>
    </div>
  )
}

// ─── 印刷ボタン ───────────────────────────────────────────────────────────────

function PrintButton({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const [showTip, setShowTip] = useState(false)

  function handlePrint() {
    setShowTip(true)
    setTimeout(() => {
      window.print()
      setTimeout(() => setShowTip(false), 5000)
    }, 100)
  }

  const btnClass =
    size === 'sm'
      ? 'flex items-center gap-1.5 border border-slate-200 text-slate-500 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-slate-50 transition-colors'
      : 'flex items-center gap-2 border border-slate-300 text-slate-600 font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors'

  return (
    <div className="relative inline-block print:hidden">
      <button onClick={handlePrint} className={btnClass}>
        <svg
          className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
          />
        </svg>
        レポートを保存
      </button>
      {showTip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 text-center shadow-lg z-10 whitespace-nowrap">
          印刷画面で「PDFに保存」を選択してください
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  )
}

// ─── I. エグゼクティブサマリー ────────────────────────────────────────────────

function ExecutiveSummary({ result }: { result: DiagnosisResult }) {
  const sorted = [...result.toolComparisons].sort((a, b) => b.score - a.score)
  const top = sorted[0]
  const meta = toolMeta[top.toolId] ?? toolMeta['chatgpt']

  return (
    <section className="print:break-inside-avoid">
      <SectionHeader num="I" title="エグゼクティブサマリー" />

      {/* 推奨ツール ヒーローカード */}
      <div className={`rounded-2xl border-2 ${meta.borderClass} ${meta.bgClass} p-6 mb-4`}>
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">推奨ツール</p>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <p className={`text-3xl font-black tracking-tight ${meta.textClass} leading-tight mb-1.5`}>
              {top.name}
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">{result.deploymentStance}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-5xl font-black tabular-nums leading-none ${meta.textClass}`}>
              {top.score}
            </span>
            <span className="text-slate-400 text-base"> / 100</span>
          </div>
        </div>
        <div className="h-3 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${meta.barClass}`}
            style={{ width: `${top.score}%` }}
          />
        </div>
      </div>

      {/* 推薦理由 */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">推薦の主な理由</p>
        <ol className="space-y-3">
          {result.topReasons.map((reason, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`flex-shrink-0 w-6 h-6 rounded-full ${meta.barClass} text-white text-xs font-black flex items-center justify-center`}
              >
                {i + 1}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{reason}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

// ─── II. ツール比較テーブル ────────────────────────────────────────────────────

function ToolComparisonTable({ comparisons }: { comparisons: ToolComparison[] }) {
  const sorted = [...comparisons].sort((a, b) => b.score - a.score)
  const topId = sorted[0].toolId

  return (
    <section className="print:break-inside-avoid">
      <SectionHeader num="II" title="ツール適合性評価" />

      {/* スコアバー */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4">総合スコア比較</p>
        <div className="space-y-3.5">
          {sorted.map((tool) => {
            const meta = toolMeta[tool.toolId] ?? toolMeta['chatgpt']
            const isTop = tool.toolId === topId
            return (
              <div key={tool.toolId}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isTop ? meta.textClass : 'text-slate-400'}`}>
                      {tool.name}
                    </span>
                    {isTop && (
                      <span className="text-xs bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold leading-none">
                        推奨
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm font-black tabular-nums ${
                      isTop ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {tool.score}
                    <span className="text-xs font-normal text-slate-400"> / 100</span>
                  </span>
                </div>
                <HBar score={tool.score} colorClass={isTop ? meta.barClass : 'bg-slate-300'} />
              </div>
            )
          })}
        </div>
      </div>

      {/* 比較テーブル（スマホ横スクロール） */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 print:overflow-visible">
        <table className="w-full min-w-[580px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-slate-50 border-b border-r border-slate-200 px-4 py-3 text-left text-xs font-bold text-slate-500 w-28">
                評価軸
              </th>
              {sorted.map((tool) => {
                const meta = toolMeta[tool.toolId] ?? toolMeta['chatgpt']
                const isTop = tool.toolId === topId
                return (
                  <th
                    key={tool.toolId}
                    className={`border-b border-r last:border-r-0 border-slate-200 px-4 py-3 text-left text-xs font-bold ${
                      isTop ? `${meta.thBgClass} ${meta.textClass}` : 'bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tool.name}
                      {isTop && (
                        <span className="text-xs bg-indigo-500 text-white px-1 py-0.5 rounded font-bold leading-none">
                          推奨
                        </span>
                      )}
                    </div>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {/* スコア行 */}
            <tr>
              <td className="border-b border-r border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap">
                総合スコア
              </td>
              {sorted.map((tool) => {
                const meta = toolMeta[tool.toolId] ?? toolMeta['chatgpt']
                const isTop = tool.toolId === topId
                return (
                  <td
                    key={tool.toolId}
                    className={`border-b border-r last:border-r-0 border-slate-100 px-4 py-3 ${
                      isTop ? meta.bgClass : ''
                    }`}
                  >
                    <span
                      className={`text-2xl font-black tabular-nums ${
                        isTop ? meta.textClass : 'text-slate-400'
                      }`}
                    >
                      {tool.score}
                    </span>
                    <span className="text-xs text-slate-400"> / 100</span>
                  </td>
                )
              })}
            </tr>
            {/* 向いているケース */}
            <tr>
              <td className="border-b border-r border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap align-top">
                向いているケース
              </td>
              {sorted.map((tool) => {
                const meta = toolMeta[tool.toolId] ?? toolMeta['chatgpt']
                const isTop = tool.toolId === topId
                return (
                  <td
                    key={tool.toolId}
                    className={`border-b border-r last:border-r-0 border-slate-100 px-4 py-3 text-xs text-slate-700 leading-relaxed align-top ${
                      isTop ? meta.bgClass : ''
                    }`}
                  >
                    {tool.reason}
                  </td>
                )
              })}
            </tr>
            {/* 事前確認ポイント */}
            <tr>
              <td className="border-r border-slate-100 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap align-top">
                事前確認ポイント
              </td>
              {sorted.map((tool) => {
                const meta = toolMeta[tool.toolId] ?? toolMeta['chatgpt']
                const isTop = tool.toolId === topId
                return (
                  <td
                    key={tool.toolId}
                    className={`border-r last:border-r-0 border-slate-100 px-4 py-3 text-xs text-slate-600 leading-relaxed align-top ${
                      isTop ? meta.bgClass : ''
                    }`}
                  >
                    {tool.caution}
                  </td>
                )
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

// ─── III. 5軸分析 ─────────────────────────────────────────────────────────────

function AxisAnalysisSection({ comparisons }: { comparisons: ToolComparison[] }) {
  const sorted = [...comparisons].sort((a, b) => b.score - a.score)
  const topId = sorted[0].toolId
  const axes: (keyof ToolAxisScores)[] = [
    'environment', 'usecase', 'rollout', 'infoHandling', 'budget',
  ]

  return (
    <section className="print:break-inside-avoid">
      <SectionHeader num="III" title="5軸分析 — なぜこのツールか" />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {axes.map((axis, i) => (
          <div
            key={axis}
            className={`px-5 py-4 ${i < axes.length - 1 ? 'border-b border-slate-100' : ''}`}
          >
            <p className="text-xs font-bold text-slate-500 mb-3">{axisLabels[axis]}</p>
            <div className="space-y-2.5">
              {sorted.map((tool) => {
                const meta = toolMeta[tool.toolId] ?? toolMeta['chatgpt']
                const isTop = tool.toolId === topId
                const score = tool.axisScores[axis]
                const shortName = tool.name
                  .replace('Microsoft 365 ', '')
                  .replace('Google ', '')
                return (
                  <div key={tool.toolId} className="flex items-center gap-3">
                    <span
                      className={`text-xs w-16 flex-shrink-0 truncate ${
                        isTop ? `font-bold ${meta.textClass}` : 'text-slate-400'
                      }`}
                    >
                      {shortName}
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isTop ? meta.barClass : 'bg-slate-300'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span
                      className={`text-xs font-bold w-7 text-right tabular-nums ${
                        isTop ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {score}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── IV. 活用が期待できる業務 ─────────────────────────────────────────────────

function UsecaseCardsSection({ cards }: { cards: UsecaseCard[] }) {
  return (
    <section>
      <SectionHeader num="IV" title="活用が期待できる業務" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3 print:break-inside-avoid"
          >
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm font-bold text-slate-800 leading-snug pt-0.5">{card.title}</p>
            </div>

            <div className="bg-indigo-50 rounded-lg px-3 py-2.5">
              <p className="text-xs font-bold text-indigo-600 mb-1">期待効果</p>
              <p className="text-xs text-slate-700 leading-relaxed">{card.expectedEffect}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <p className="font-bold text-slate-400 mb-1">なぜ合うか</p>
                <p className="text-slate-600 leading-relaxed">{card.whyItFits}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 mb-1">最初の試し方</p>
                <p className="text-slate-600 leading-relaxed">{card.howToStart}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── V. 導入準備度 ────────────────────────────────────────────────────────────

function ReadinessGauge({ score }: { score: number }) {
  const r = 15.9155
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const gap = circ - dash

  const hex =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#3b82f6' :
    score >= 40 ? '#f59e0b' :
    '#ef4444'

  const textColor =
    score >= 80 ? 'text-green-600' :
    score >= 60 ? 'text-blue-600' :
    score >= 40 ? 'text-amber-500' :
    'text-red-500'

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2.8"
        />
        <circle
          cx="18" cy="18" r={r}
          fill="none"
          stroke={hex}
          strokeWidth="2.8"
          strokeDasharray={`${dash.toFixed(2)} ${gap.toFixed(2)}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-2xl font-black tabular-nums leading-none ${textColor}`}>{score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
      </div>
    </div>
  )
}

function ReadinessSection({ detail }: { detail: ReadinessDetail }) {
  const scoreColor =
    detail.score >= 80 ? 'text-green-600' :
    detail.score >= 60 ? 'text-blue-600' :
    detail.score >= 40 ? 'text-amber-500' :
    'text-red-500'

  return (
    <section className="print:break-inside-avoid">
      <SectionHeader num="V" title="導入準備度" />

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {/* スコアヘッダー */}
        <div className="flex items-center gap-5 px-5 py-5 border-b border-slate-100">
          <ReadinessGauge score={detail.score} />
          <div className="flex-1 min-w-0">
            <p className={`text-xl font-black leading-tight mb-1 ${scoreColor}`}>{detail.label}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{detail.definition}</p>
          </div>
        </div>

        {/* 現状評価 */}
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">現状の評価</p>
          <p className="text-sm text-slate-700 leading-relaxed">{detail.summary}</p>
        </div>

        {/* 次にやること */}
        <div className="px-5 py-5">
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3">次にやるべきこと</p>
          <ol className="space-y-3">
            {detail.nextActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-50 border-2 border-indigo-200 text-indigo-600 text-xs font-black flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-700 leading-relaxed pt-0.5">{action}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

// ─── VI. 総合所見 ─────────────────────────────────────────────────────────────

function OverallAssessmentSection({ assessment }: { assessment: OverallAssessment }) {
  return (
    <section className="print:break-inside-avoid">
      <SectionHeader num="VI" title="総合所見" />

      <div className="space-y-3">
        {/* なぜこのツールか */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex">
          <div className="w-1 flex-shrink-0 bg-slate-800" />
          <div className="px-5 py-4 flex-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
              なぜこのツールが合うのか
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{assessment.whyThisTool}</p>
          </div>
        </div>

        {/* どう始めるか */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex">
          <div className="w-1 flex-shrink-0 bg-indigo-500" />
          <div className="px-5 py-4 flex-1">
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
              どう始めるべきか
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">{assessment.howToStart}</p>
          </div>
        </div>

        {/* 注意点 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden flex">
          <div className="w-1 flex-shrink-0 bg-amber-400" />
          <div className="px-5 py-4 flex-1">
            <p className="text-xs font-bold text-amber-600 tracking-wider uppercase mb-3">
              注意点・留意事項
            </p>
            <ul className="space-y-2.5">
              {assessment.cautionPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-amber-400 flex-shrink-0 text-sm mt-0.5">▲</span>
                  <p className="text-xs text-slate-700 leading-relaxed">{point}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CTASection({ onRetry }: { onRetry: () => void }) {
  return (
    <section className="print:hidden">
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Next Step</p>
        <h3 className="text-base font-black text-slate-800 mb-2">具体的な導入検討はご相談ください</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
          この診断結果をもとに、選定・費用・社内展開の進め方について詳しくご相談いただけます。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <a
            href="#contact"
            className="w-full sm:w-auto inline-block bg-indigo-600 text-white font-bold px-7 py-3 rounded-lg text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            無料相談を申し込む
          </a>
          <PrintButton size="md" />
          <button
            onClick={onRetry}
            className="w-full sm:w-auto inline-block border border-slate-200 text-slate-500 font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            診断をやり直す
          </button>
        </div>
      </div>
    </section>
  )
}

// ─── メインコンポーネント ─────────────────────────────────────────────────────

export function DiagnosisResult({ result, onRetry, companyName }: Props) {
  const conf = confidenceConfig[result.confidence]

  return (
    <div className="space-y-10">
      {/* 印刷専用ヘッダー（画面では非表示） */}
      <PrintOnlyHeader companyName={companyName} confidence={result.confidence} />

      {/* 画面用レポートヘッダー */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 border-b-2 border-slate-200 print:hidden">
        <div>
          <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-1">
            生成AIツール適合性診断
          </p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">簡易提案レポート</h2>
          {companyName && (
            <p className="text-sm text-slate-500 mt-1">{companyName} 御中</p>
          )}
          <p className="text-xs text-slate-400 mt-1">入力内容にもとづく相性の傾向です</p>
        </div>
        <div className="flex sm:flex-col items-center sm:items-end gap-2">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${conf.style}`}>
            {conf.label}
          </span>
          <PrintButton size="sm" />
        </div>
      </div>

      <ExecutiveSummary result={result} />
      <ToolComparisonTable comparisons={result.toolComparisons} />
      <AxisAnalysisSection comparisons={result.toolComparisons} />
      <UsecaseCardsSection cards={result.usecaseCards} />
      <ReadinessSection detail={result.readinessDetail} />
      <OverallAssessmentSection assessment={result.overallAssessment} />

      {/* 免責文 */}
      <p className="text-xs text-slate-400 text-center leading-relaxed px-4">
        本レポートはヒアリング内容をもとにした参考情報であり、断定的な推薦ではありません。
        実際の導入検討時は、各ツールの最新仕様・料金・セキュリティポリシーを必ずご確認ください。
      </p>

      <CTASection onRetry={onRetry} />
    </div>
  )
}
