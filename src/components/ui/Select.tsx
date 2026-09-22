import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, id, className = '', children, ...props }: SelectProps) {
  const select = (
    <select
      id={id}
      className={`w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
  if (!label) return select
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {select}
    </label>
  )
}
