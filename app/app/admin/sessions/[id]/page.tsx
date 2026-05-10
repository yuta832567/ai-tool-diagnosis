import { notFound } from 'next/navigation'
import Link from 'next/link'
import { requireAdminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { LogoutButton } from '../../_components/LogoutButton'
import type { FormData as DiagFormData, DiagnosisResult } from '@/lib/types'

type Session = {
  id: string
  created_at: string
  full_name: string
  job_title: string | null
  company_name: string | null
  industry: string | null
  recommended_tool: string | null
  score_chatgpt: number | null
  score_copilot: number | null
  score_gemini: number | null
  readiness_score: number | null
  estimated_time_saving: string | null
  form_data: DiagFormData
  result: DiagnosisResult
}

export default async function AdminSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminAuth()
  const { id } = await params

  const supabase = getSupabaseAdmin()
  if (!supabase) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-amber-700">Supabase が設定されていません。環境変数を確認してください。</p>
      </div>
    )
  }

  const { data, error } = await supabase
    .from('diagnosis_sessions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    notFound()
  }

  const s = data as Session

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/sessions" className="text-sm text-[#0072A0] hover:underline">
              ← 一覧に戻る
            </Link>
            <h1 className="text-lg font-black text-slate-800">診断詳細</h1>
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 基本情報 */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">基本情報</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            <InfoItem label="保存日時" value={new Date(s.created_at).toLocaleString('ja-JP')} />
            <InfoItem label="氏名" value={s.full_name} />
            <InfoItem label="役職" value={s.job_title} />
            <InfoItem label="会社名" value={s.company_name} />
            <InfoItem label="業種" value={s.industry} />
            <InfoItem label="推奨ツール" value={s.recommended_tool} highlight />
            <InfoItem label="ChatGPT スコア" value={s.score_chatgpt?.toString()} />
            <InfoItem label="Copilot スコア" value={s.score_copilot?.toString()} />
            <InfoItem label="Gemini スコア" value={s.score_gemini?.toString()} />
            <InfoItem label="導入準備度" value={s.readiness_score?.toString()} />
            <InfoItem label="想定削減時間" value={s.estimated_time_saving} />
          </dl>
        </section>

        {/* レポート要約 */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">レポート要約</h2>
          <p className="text-sm text-slate-700 leading-relaxed mb-3">{s.result?.summary}</p>
          <p className="text-sm text-slate-500">{s.result?.deploymentStance}</p>
        </section>

        {/* フォーム入力内容 */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">フォーム入力内容</h2>
          <FormDataView data={s.form_data} />
        </section>

        {/* 診断結果 JSON */}
        <section className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">診断結果（詳細）</h2>
          <pre className="text-xs text-slate-600 overflow-auto bg-slate-50 p-4 rounded-lg max-h-96 whitespace-pre-wrap">
            {JSON.stringify(s.result, null, 2)}
          </pre>
        </section>
      </main>
    </div>
  )
}

function InfoItem({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string | null | undefined
  highlight?: boolean
}) {
  return (
    <div>
      <dt className="text-xs text-slate-400 mb-0.5">{label}</dt>
      <dd className={`text-sm font-semibold ${highlight ? 'text-[#0072A0]' : 'text-slate-700'}`}>
        {value || '—'}
      </dd>
    </div>
  )
}

function FormDataView({ data }: { data: DiagFormData }) {
  const fields: [string, string | undefined][] = [
    ['氏名', data.fullName],
    ['役職', data.jobTitle],
    ['会社名', data.companyName],
    ['自社サイトURL', data.websiteUrl],
    ['業種', data.industry],
    ['事業内容', data.businessDescription],
    ['会社規模', data.companySize],
    ['導入予定人数', data.initialUsers],
    ['主な仕事の種類', data.businessTypes?.join('、')],
    ['対象部署', data.targetDepartments?.join('、')],
    ['その他備考', data.otherNotes],
    ['社内ツール環境', data.workEnvironment],
    ['よく使うアプリ', data.usedApps?.join('、')],
    ['ファイル管理', data.fileStorage],
    ['効率化したい業務', data.usecases?.join('、')],
    ['AIへの期待', data.expectedEffects?.join('、')],
    ['困っていること', data.biggestPain],
    ['情報の機密度', data.dataSensitivity],
    ['個人情報の取り扱い', data.personalInfo],
    ['社外秘資料', data.confidentialDocs],
    ['社内ルールの厳しさ', data.ruleStrictness],
    ['AI利用状況', data.aiUsageStatus],
    ['推進担当', data.aiOwner],
    ['導入範囲', data.rolloutScope],
    ['予算/人/月', data.budgetPerUser],
    ['重視すること', data.priorities?.join('、')],
  ]

  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {fields.map(([label, value]) =>
        value ? (
          <div key={label} className="flex gap-2">
            <dt className="text-xs text-slate-400 min-w-[110px] pt-0.5 flex-shrink-0">{label}</dt>
            <dd className="text-sm text-slate-700 flex-1">{value}</dd>
          </div>
        ) : null
      )}
    </dl>
  )
}
