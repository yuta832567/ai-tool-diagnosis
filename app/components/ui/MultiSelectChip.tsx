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
          ? 'border-[#0072A0] bg-[#0072A0] text-white'
          : 'border-slate-200 bg-white text-slate-700 hover:border-[#0072A0]/50 hover:bg-[#0072A0]/10'
      }`}
    >
      {selected && <span className="mr-1">✓</span>}
      {label}
    </button>
  )
}
