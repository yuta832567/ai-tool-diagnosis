interface ProgressBarProps {
  currentStep: number
  totalSteps: number
}

const stepLabels = ['会社のこと', '仕事環境', '導入の進め方']

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = ((currentStep) / totalSteps) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i < currentStep
                  ? 'bg-indigo-500 text-white'
                  : i === currentStep
                  ? 'bg-indigo-500 text-white ring-4 ring-indigo-100'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs hidden sm:block ${
                i <= currentStep ? 'text-indigo-600 font-medium' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-right text-xs text-slate-400 mt-1">
        Step {currentStep + 1} / {totalSteps}
      </p>
    </div>
  )
}
