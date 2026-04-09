'use client'

import { FormData } from '@/lib/types'
import { SelectCard } from '@/components/ui/SelectCard'
import { MultiSelectChip } from '@/components/ui/MultiSelectChip'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const dataSensitivityOptions = [
  '公開情報や一般的な文書が中心',
  '社内資料も少し扱う',
  '顧客情報や社外秘も扱うことがある',
  'かなり慎重に扱う必要がある',
  'わからない',
]

const personalInfoOptions = ['よくある', 'ときどきある', 'ほとんどない', 'わからない']
const confidentialOptions = ['よくある', 'ときどきある', 'ほとんどない', 'わからない']
const ruleStrictnessOptions = ['かなり厳しい', 'やや厳しい', '一般的', 'まだ決まっていない']

const aiUsageOptions = [
  'まだほとんど使っていない',
  '一部の人が使っている',
  '部門で試している',
  'すでにある程度使っている',
]

const aiOwnerOptions = ['いる', 'いない', 'これから決める']

const rolloutScopeOptions = [
  'まずは個人利用から',
  '一部の部署で試したい',
  '特定の業務だけで試したい',
  '全社で検討したい',
  'まだ未定',
]

const budgetOptions = ['〜2,000円', '〜5,000円', '〜10,000円', '10,000円以上', 'まだ未定']

const priorityOptions = [
  '使いやすさ', '安全性', '価格', '既存ツールとの相性',
  '文章作成の強さ', '情報整理のしやすさ', 'データ分析のしやすさ',
  '社内展開しやすさ', 'その他',
]

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

function toggleMax3(arr: string[], value: string): string[] {
  if (arr.includes(value)) return arr.filter((v) => v !== value)
  if (arr.length >= 3) return arr
  return [...arr, value]
}

export function Step3Security({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* Q16 扱う情報の種類 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          AIで扱う内容はどれに近いですか？ <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 gap-2">
          {dataSensitivityOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.dataSensitivity === opt}
              onClick={() => onChange({ dataSensitivity: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q17 個人情報 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          個人情報を扱うことはありますか？{' '}
          <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {personalInfoOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.personalInfo === opt}
              onClick={() => onChange({ personalInfo: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q18 社外秘の資料 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          社外に出せない資料を扱うことはありますか？{' '}
          <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {confidentialOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.confidentialDocs === opt}
              onClick={() => onChange({ confidentialDocs: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q19 ルールの厳しさ */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          ルールや確認の厳しさはどれに近いですか？{' '}
          <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ruleStrictnessOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.ruleStrictness === opt}
              onClick={() => onChange({ ruleStrictness: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q20 生成AIの利用状況 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          生成AIの利用状況 <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {aiUsageOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.aiUsageStatus === opt}
              onClick={() => onChange({ aiUsageStatus: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q21 推進担当 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          社内でAIを進める担当者はいますか？ <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {aiOwnerOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.aiOwner === opt}
              onClick={() => onChange({ aiOwner: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q22 始める範囲 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          まずはどの範囲で始めたいですか？ <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {rolloutScopeOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.rolloutScope === opt}
              onClick={() => onChange({ rolloutScope: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q23 予算 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          1人あたりの想定予算（月額）{' '}
          <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {budgetOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.budgetPerUser === opt}
              onClick={() => onChange({ budgetPerUser: opt })}
            />
          ))}
        </div>
      </div>

      {/* Q24 重視すること */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          何を重視しますか？ <span className="text-red-400">*</span>{' '}
          <span className="text-slate-400 font-normal">（最大3つ）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {priorityOptions.map((opt) => (
            <MultiSelectChip
              key={opt}
              label={opt}
              selected={data.priorities.includes(opt)}
              onClick={() => onChange({ priorities: toggleMax3(data.priorities, opt) })}
            />
          ))}
        </div>
        {data.priorities.length === 3 && (
          <p className="text-xs text-amber-600">最大3つまで選択できます</p>
        )}
        {data.priorities.includes('その他') && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.prioritiesOther}
            onChange={(e) => onChange({ prioritiesOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>
    </div>
  )
}
