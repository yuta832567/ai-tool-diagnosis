'use client'

interface SelectCardProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function SelectCard({ label, selected, onClick }: SelectCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer ${
        selected
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
            selected ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300'
          }`}
        />
        {label}
      </span>
    </button>
  )
}
