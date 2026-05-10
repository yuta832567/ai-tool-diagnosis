import Link from 'next/link'
import { requireAdminAuth } from '@/lib/adminAuth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { LogoutButton } from '../_components/LogoutButton'

type SessionRow = {
  id: string
  created_at: string
  full_name: string
  company_name: string | null
  job_title: string | null
  industry: string | null
  recommended_tool: string | null
  score_chatgpt: number | null
  score_copilot: number | null
  score_gemini: number | null
  readiness_score: number | null
  estimated_time_saving: string | null
}

export default async function AdminSessionsPage() {
  await requireAdminAuth()

  const supabase = getSupabaseAdmin()
  let sessions: SessionRow[] = []
  let fetchError = ''

  if (!supabase) {
    fetchError = 'Supabase が設定されていません。環境変数（SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）を確認してください。'
  } else {
    const { data, error } = await supabase
      .from('diagnosis_sessions')
      .select(
        'id, created_at, full_name, company_name, job_title, industry, recommended_tool, score_chatgpt, score_copilot, score_gemini, readiness_score, estimated_time_saving'
      )
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) {
      fetchError = `データの取得に失敗しました: ${error.message}`
    } else {
      sessions = (data ?? []) as SessionRow[]
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 px-4 py-4 print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black text-slate-800">診断一覧</h1>
            {sessions.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {sessions.length}件
              </span>
            )}
          </div>
          <LogoutButton />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
            {fetchError}
          </div>
        )}

        {!fetchError && sessions.length === 0 && (
          <div className="text-center py-16 text-slate-400 text-sm">
            診断データがまだありません
          </div>
        )}

        {sessions.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 whitespace-nowrap">診断日時</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">氏名</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">会社名</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">役職</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">業種</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">推奨ツール</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">GPT</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">Copilot</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">Gemini</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-slate-500">準備度</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 whitespace-nowrap">想定削減時間</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-slate-500">詳細</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(s.created_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{s.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">{s.company_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.job_title || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.industry || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-[#0072A0] whitespace-nowrap">{s.recommended_tool || '—'}</td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">{s.score_chatgpt ?? '—'}</td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">{s.score_copilot ?? '—'}</td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">{s.score_gemini ?? '—'}</td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-700">{s.readiness_score ?? '—'}</td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.estimated_time_saving || '—'}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/sessions/${s.id}`}
                        className="text-[#0072A0] hover:underline text-xs font-semibold whitespace-nowrap"
                      >
                        詳細 →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
