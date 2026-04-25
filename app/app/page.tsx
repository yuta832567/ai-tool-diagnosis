import { DiagnosisForm } from '@/components/form/DiagnosisForm'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-slate-100 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold text-indigo-600">AI Tool Diagnosis</p>
        </div>
      </header>

      {/* ヒーローセクション */}
      <section className="bg-white border-b border-slate-100 px-4 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            無料・60〜90秒で完了
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-4">
            あなたの会社に合う<br />
            <span className="text-indigo-600">生成AIツール</span>を診断する
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 max-w-lg mx-auto">
            ChatGPT・Microsoft 365 Copilot・Google Geminiの中から、
            会社の環境や業務内容をもとに最も相性のよいツールを分析します。
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> データ保存なし
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> ログイン不要
            </span>
            <span className="flex items-center gap-1">
              <span className="text-green-500">✓</span> 無料で診断
            </span>
          </div>
        </div>
      </section>

      {/* 対象ツール表示 */}
      <section className="px-4 py-6 border-b border-slate-100 bg-white">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs text-slate-400 text-center mb-4">比較対象のツール</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: 'ChatGPT', vendor: 'OpenAI', color: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
              { name: 'Copilot', vendor: 'Microsoft', color: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
              { name: 'Gemini', vendor: 'Google', color: 'bg-violet-50 border-violet-200', text: 'text-violet-700' },
            ].map((tool) => (
              <div
                key={tool.name}
                className={`rounded-xl border p-3 text-center ${tool.color}`}
              >
                <p className={`text-sm font-bold ${tool.text}`}>{tool.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{tool.vendor}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* フォームセクション */}
      <section id="form" className="px-4 py-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8">
          <DiagnosisForm />
        </div>
      </section>

      {/* お問い合わせ */}
      <section id="contact" className="px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-lg font-bold text-slate-800 mb-2">もっと詳しく相談したい</h2>
          <p className="text-sm text-slate-500 mb-6">
            診断結果をもとに、具体的な導入ステップや費用感についてご相談いただけます。
          </p>
          <a
            href="https://timerex.net/s/kazu09233290_9cff/a1f23002"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 text-white font-bold px-8 py-3 rounded-xl text-sm hover:bg-indigo-700 transition-colors shadow-sm"
          >
            無料相談を申し込む
          </a>
        </div>
      </section>

      {/* フッター */}
      <footer className="border-t border-slate-100 bg-white px-4 py-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs text-slate-400">
            この診断はあくまで参考情報です。実際の導入にあたっては各ツールの最新情報をご確認ください。
          </p>
        </div>
      </footer>
    </div>
  )
}
