'use client'

import { useState } from 'react'
import { FormData } from '@/lib/types'
import { SelectCard } from '@/components/ui/SelectCard'
import { MultiSelectChip } from '@/components/ui/MultiSelectChip'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

type UrlFetchStatus = 'idle' | 'loading' | 'done' | 'error'

const industries = [
  'IT・システム', '製造', '人材・教育', '小売・サービス',
  '医療・福祉', '士業', '不動産', '建設', '金融', 'その他',
]

const companySizes = ['1〜10名', '11〜50名', '51〜100名', '101〜300名', '301〜1000名', '1000名以上']
const initialUserOptions = ['1〜5名', '6〜20名', '21〜50名', '51名以上', 'まだ未定']

const businessTypeOptions = [
  'BtoB', 'BtoC', '受託業務', '自社サービス', '店舗運営',
  'コンサルティング', '代理店・仲介', 'その他',
]

const departmentOptions = [
  '営業', 'マーケティング', '管理部門', '経理', '人事',
  'カスタマーサポート', '開発', '経営企画', '研修・教育', 'その他',
]

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export function Step1Company({ data, onChange }: Props) {
  const [urlStatus, setUrlStatus] = useState<UrlFetchStatus>('idle')

  async function handleParseUrl() {
    const url = data.websiteUrl.trim()
    if (!url) return

    setUrlStatus('loading')
    try {
      const res = await fetch('/api/parse-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const { summary } = await res.json()
      if (summary) {
        onChange({ businessDescription: summary })
        setUrlStatus('done')
      } else {
        setUrlStatus('error')
      }
    } catch {
      setUrlStatus('error')
    }
  }

  return (
    <div className="space-y-8">
      {/* Q1 会社名 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          会社名 <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <input
          type="text"
          placeholder="株式会社〇〇"
          value={data.companyName}
          onChange={(e) => onChange({ companyName: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
        />
      </div>

      {/* Q2 自社サイト */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          自社サイトのURL <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://example.com"
            value={data.websiteUrl}
            onChange={(e) => {
              onChange({ websiteUrl: e.target.value })
              setUrlStatus('idle')
            }}
            className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleParseUrl}
            disabled={!data.websiteUrl.trim() || urlStatus === 'loading'}
            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {urlStatus === 'loading' ? '取得中…' : 'URLから自動入力'}
          </button>
        </div>
        {urlStatus === 'done' && (
          <p className="text-xs text-emerald-600">✓ 事業内容欄に自動入力しました。内容を確認・編集してください。</p>
        )}
        {urlStatus === 'error' && (
          <p className="text-xs text-amber-600">URLから情報を取得できませんでした。直接入力してください。</p>
        )}
        {urlStatus === 'idle' && (
          <p className="text-xs text-slate-400">URLを入力してボタンを押すと、事業内容欄を自動補完します</p>
        )}
      </div>

      {/* Q3 業種 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          会社の業種 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {industries.map((ind) => (
            <SelectCard
              key={ind}
              label={ind}
              selected={data.industry === ind}
              onClick={() => onChange({ industry: ind })}
            />
          ))}
        </div>
        {data.industry === 'その他' && (
          <input
            type="text"
            placeholder="業種を入力してください"
            value={data.industryOther}
            onChange={(e) => onChange({ industryOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q4 事業内容 */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          事業内容 <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <textarea
          rows={3}
          placeholder="例：中小企業向けのITシステム導入支援や運用サポートを行っています"
          value={data.businessDescription}
          onChange={(e) => onChange({ businessDescription: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
        />
      </div>

      {/* Q5 会社の規模 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          会社の規模 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {companySizes.map((size) => (
            <SelectCard
              key={size}
              label={size}
              selected={data.companySize === size}
              onClick={() => onChange({ companySize: size })}
            />
          ))}
        </div>
      </div>

      {/* Q6 まず使いそうな人数 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          生成AIを使用する予定人数 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {initialUserOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.initialUsers === opt}
              onClick={() => onChange({ initialUsers: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q7 主な仕事の種類 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          主な仕事の種類 <span className="text-slate-400 font-normal">（複数選択可）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {businessTypeOptions.map((opt) => (
            <MultiSelectChip
              key={opt}
              label={opt}
              selected={data.businessTypes.includes(opt)}
              onClick={() => onChange({ businessTypes: toggle(data.businessTypes, opt) })}
            />
          ))}
        </div>
        {data.businessTypes.includes('その他') && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.businessTypesOther}
            onChange={(e) => onChange({ businessTypesOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q8 AIを使ってみたい部門 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          AIを扱ってみたい部署 <span className="text-red-400">*</span>{' '}
          <span className="text-slate-400 font-normal">（複数選択可）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {departmentOptions.map((opt) => (
            <MultiSelectChip
              key={opt}
              label={opt}
              selected={data.targetDepartments.includes(opt)}
              onClick={() => onChange({ targetDepartments: toggle(data.targetDepartments, opt) })}
            />
          ))}
        </div>
        {data.targetDepartments.includes('その他') && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.targetDepartmentsOther}
            onChange={(e) => onChange({ targetDepartmentsOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q9 その他伝えておきたいこと */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          その他、伝えておきたいこと <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <textarea
          rows={2}
          placeholder="業界特有の事情や気になることなど"
          value={data.otherNotes}
          onChange={(e) => onChange({ otherNotes: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
        />
      </div>
    </div>
  )
}
