'use client'

interface MultiSelectChipProps {
  label: string
  selected: boolean
  onClick: () => void
}

export function MultiSelectChip({ label, selected, onClick }: MultiSelectChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all cursor-pointer ${
        selected
          ? 'border-indigo-500 bg-indigo-500 text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50'
      }`}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  )
}
