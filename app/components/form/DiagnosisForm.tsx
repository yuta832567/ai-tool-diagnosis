'use client'

import { useState } from 'react'
import { FormData, initialFormData, DiagnosisResult } from '@/lib/types'
import { buildDiagnosisResult } from '@/lib/scoring'
import { ProgressBar } from './ProgressBar'
import { Step1Company } from '@/components/steps/Step1Company'
import { Step2Environment } from '@/components/steps/Step2Environment'
import { Step3Security } from '@/components/steps/Step3Security'
import { DiagnosisResult as DiagnosisResultComponent } from '@/components/result/DiagnosisResult'

type Phase = 'form' | 'loading' | 'result'

function validateStep(step: number, data: FormData): string | null {
  if (step === 0) {
    if (!data.industry) return '業種を選択してください'
    if (!data.companySize) return '会社規模を選択してください'
    if (!data.initialUsers) return '最初の利用人数を選択してください'
    if (data.targetDepartments.length === 0) return 'AIを扱いたい部署を選択してください'
  }
  if (step === 1) {
    if (!data.workEnvironment) return '社内ツール環境を選択してください'
    if (data.usecases.length === 0) return '効率化したい業務を選択してください'
  }
  if (step === 2) {
    if (!data.dataSensitivity) return '扱う情報の種類を選択してください'
    if (!data.aiUsageStatus) return '生成AIの利用状況を選択してください'
    if (!data.aiOwner) return '推進担当の有無を選択してください'
    if (!data.rolloutScope) return '始める範囲を選択してください'
    if (data.priorities.length === 0) return '重視することを選択してください'
  }
  return null
}

export function DiagnosisForm() {
  const [phase, setPhase] = useState<Phase>('form')
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<DiagnosisResult | null>(null)

  const totalSteps = 3

  function handleChange(updates: Partial<FormData>) {
    setFormData((prev) => ({ ...prev, ...updates }))
    setError(null)
  }

  function handleNext() {
    const err = validateStep(step, formData)
    if (err) {
      setError(err)
      return
    }
    setError(null)
    if (step < totalSteps - 1) {
      setStep(step + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1)
      setError(null)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  async function handleSubmit() {
    setPhase('loading')
    window.scrollTo({ top: 0, behavior: 'smooth' })

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const diagnosisResult = await res.json()
      setResult(diagnosisResult)
    } catch (err) {
      // API 失敗時はクライアントサイドのルールベース計算にフォールバック
      console.warn('API call failed, falling back to local scoring:', err)
      const diagnosisResult = buildDiagnosisResult(formData)
      setResult(diagnosisResult)
    }

    setPhase('result')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleRetry() {
    setFormData(initialFormData)
    setStep(0)
    setError(null)
    setResult(null)
    setPhase('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (phase === 'loading') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-6 py-16">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-100" />
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-slate-700 mb-1">診断中です...</p>
          <p className="text-sm text-slate-400">入力内容をもとに最適なツールを分析しています</p>
        </div>
      </div>
    )
  }

  if (phase === 'result' && result) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">診断結果</h2>
          <p className="text-sm text-slate-500 mt-1">入力内容にもとづく相性の傾向です</p>
        </div>
        <DiagnosisResultComponent result={result} onRetry={handleRetry} companyName={formData.companyName || undefined} />
      </div>
    )
  }

  const stepTitles = ['会社のこと', '普段の仕事環境と困りごと', '情報の扱い方と導入の進め方']

  return (
    <div>
      {/* プログレスバー */}
      <div className="mb-8">
        <ProgressBar currentStep={step} totalSteps={totalSteps} />
      </div>

      {/* ステップタイトル */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-800">
          Step {step + 1}: {stepTitles[step]}
        </h2>
      </div>

      {/* フォームステップ */}
      {step === 0 && <Step1Company data={formData} onChange={handleChange} />}
      {step === 1 && <Step2Environment data={formData} onChange={handleChange} />}
      {step === 2 && <Step3Security data={formData} onChange={handleChange} />}

      {/* エラー */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      {/* ナビゲーション */}
      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            onClick={handleBack}
            className="flex-1 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors"
          >
            ← 戻る
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
        >
          {step < totalSteps - 1 ? '次へ →' : '診断する'}
        </button>
      </div>
    </div>
  )
}
