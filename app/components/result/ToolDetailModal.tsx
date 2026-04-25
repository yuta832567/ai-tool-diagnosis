'use client'

import { useEffect } from 'react'
import type { ToolDetail } from '@/data/toolDetails'

interface Props {
  tool: ToolDetail
  onClose: () => void
  accentColor: {
    textClass: string
    bgClass: string
    borderClass: string
    badgeBg: string   // Tailwind bg class for section badges
  }
}

export function ToolDetailModal({ tool, onClose, accentColor }: Props) {
  // ESC キーで閉じる
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // スクロールロック
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const formattedDate = new Date(tool.pricing.lastUpdated).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${tool.name} の詳細`}
    >
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90dvh] sm:max-h-[85dvh]">
        {/* ヘッダー */}
        <div className={`flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-slate-100 ${accentColor.bgClass} rounded-t-2xl flex-shrink-0`}>
          <div>
            <p className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-1">ツール詳細</p>
            <h2 className={`text-xl font-black ${accentColor.textClass}`}>{tool.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white/60 hover:bg-white text-slate-400 hover:text-slate-600 transition-colors mt-0.5"
            aria-label="閉じる"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* スクロールエリア */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* ツール概要 */}
          <section>
            <SectionLabel label="ツール概要" />
            <p className="text-sm text-slate-700 leading-relaxed">{tool.overview}</p>
          </section>

          {/* 主な特徴 */}
          <section>
            <SectionLabel label="主な特徴" />
            <ul className="space-y-2">
              {tool.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 leading-relaxed">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full ${accentColor.badgeBg} text-white text-xs font-black flex items-center justify-center mt-0.5`}>
                    {i + 1}
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* 向いているケース */}
          <section>
            <SectionLabel label="向いているケース" />
            <ul className="space-y-1.5">
              {tool.idealCases.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                  <span className="flex-shrink-0 text-emerald-500 mt-0.5">✓</span>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {/* 注意点 */}
          <section>
            <SectionLabel label="注意点" />
            <ul className="space-y-1.5">
              {tool.cautions.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                  <span className="flex-shrink-0 text-amber-400 mt-0.5">▲</span>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          {/* 料金情報 */}
          <section>
            <div className="flex items-baseline justify-between mb-3">
              <SectionLabel label="料金情報" noMargin />
              <span className="text-xs text-slate-400">更新日：{formattedDate}</span>
            </div>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {tool.pricing.plans.map((plan, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 ${i < tool.pricing.plans.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-600 leading-snug">{plan.name}</p>
                      {plan.note && (
                        <p className="text-xs text-slate-400 mt-0.5 leading-snug">{plan.note}</p>
                      )}
                    </div>
                    <p className={`text-sm font-black flex-shrink-0 ${accentColor.textClass}`}>{plan.price}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              ※ 料金は税抜き・為替レートにより変動する場合があります。最新情報は
              <a
                href={tool.pricing.source}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-slate-600 ml-0.5"
              >
                公式サイト
              </a>
              でご確認ください。
            </p>
          </section>
        </div>

        {/* フッター */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ label, noMargin = false }: { label: string; noMargin?: boolean }) {
  return (
    <p className={`text-xs font-black tracking-widest text-slate-400 uppercase ${noMargin ? '' : 'mb-3'}`}>
      {label}
    </p>
  )
}
