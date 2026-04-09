'use client'

import { FormData } from '@/lib/types'
import { SelectCard } from '@/components/ui/SelectCard'
import { MultiSelectChip } from '@/components/ui/MultiSelectChip'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const workEnvironments = [
  'Microsoft系が中心',
  'Google系が中心',
  '両方使っている',
  '特に決まっていない',
  'その他',
]

const appOptions = [
  'Outlook', 'Teams', 'Word', 'Excel', 'PowerPoint',
  'Gmail', 'Googleドキュメント', 'Googleスプレッドシート',
  'Googleスライド', 'Google Meet', 'Slack', 'Notion',
  'Google Drive', 'SharePoint', 'その他',
]

const fileStorageOptions = [
  'SharePoint / OneDrive',
  'Google Drive',
  '社内サーバー',
  'Dropbox',
  'バラバラ',
  'その他',
]

const usecaseOptions = [
  'メール作成', '会議メモ・要約', '提案書・企画書作成',
  '情報収集・下調べ', 'マニュアル作成', '翻訳',
  'データ整理・分析', 'Excel作業', 'コード作成・レビュー',
  '問い合わせ対応', '採用・研修資料作成', 'アイデア出し', 'その他',
]

const effectOptions = [
  '作業時間を減らしたい', '文章の質を上げたい', '情報整理を早くしたい',
  'アイデア出しを楽にしたい', '属人化を減らしたい', '教育・引き継ぎを楽にしたい',
  '多言語対応したい', 'その他',
]

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export function Step2Environment({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* Q10 普段の社内ツール */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          普段よく使う社内ツールはどれですか？ <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {workEnvironments.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.workEnvironment === opt}
              onClick={() => onChange({ workEnvironment: opt })}
            />
          ))}
        </div>
        {data.workEnvironment === 'その他' && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.workEnvironmentOther}
            onChange={(e) => onChange({ workEnvironmentOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q11 よく使うアプリ */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          よく使うものを選んでください{' '}
          <span className="text-slate-400 font-normal">（複数選択可・任意）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {appOptions.map((opt) => (
            <MultiSelectChip
              key={opt}
              label={opt}
              selected={data.usedApps.includes(opt)}
              onClick={() => onChange({ usedApps: toggle(data.usedApps, opt) })}
            />
          ))}
        </div>
        {data.usedApps.includes('その他') && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.usedAppsOther}
            onChange={(e) => onChange({ usedAppsOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q12 ファイル管理 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          ファイルは主にどこで管理していますか？{' '}
          <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {fileStorageOptions.map((opt) => (
            <SelectCard
              key={opt}
              label={opt}
              selected={data.fileStorage === opt}
              onClick={() => onChange({ fileStorage: opt })}
            />
          ))}
        </div>
        {data.fileStorage === 'その他' && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.fileStorageOther}
            onChange={(e) => onChange({ fileStorageOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q13 効率化したい仕事 */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          どんな仕事を効率化したいですか？ <span className="text-red-400">*</span>{' '}
          <span className="text-slate-400 font-normal">（複数選択可）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {usecaseOptions.map((opt) => (
            <MultiSelectChip
              key={opt}
              label={opt}
              selected={data.usecases.includes(opt)}
              onClick={() => onChange({ usecases: toggle(data.usecases, opt) })}
            />
          ))}
        </div>
        {data.usecases.includes('その他') && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.usecasesOther}
            onChange={(e) => onChange({ usecasesOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q14 AIに期待すること */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-slate-700">
          AIに特に期待することは何ですか？{' '}
          <span className="text-slate-400 font-normal">（複数選択可・任意）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {effectOptions.map((opt) => (
            <MultiSelectChip
              key={opt}
              label={opt}
              selected={data.expectedEffects.includes(opt)}
              onClick={() => onChange({ expectedEffects: toggle(data.expectedEffects, opt) })}
            />
          ))}
        </div>
        {data.expectedEffects.includes('その他') && (
          <input
            type="text"
            placeholder="具体的に教えてください"
            value={data.expectedEffectsOther}
            onChange={(e) => onChange({ expectedEffectsOther: e.target.value })}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        )}
      </div>

      {/* Q15 今いちばん困っていること */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700">
          今いちばん困っていることを教えてください{' '}
          <span className="text-slate-400 font-normal">（任意）</span>
        </label>
        <textarea
          rows={3}
          placeholder="例：提案書作成に時間がかかる、社内情報が探しにくいなど"
          value={data.biggestPain}
          onChange={(e) => onChange({ biggestPain: e.target.value })}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent resize-none"
        />
      </div>
    </div>
  )
}
