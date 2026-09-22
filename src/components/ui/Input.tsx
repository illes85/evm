import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function Input({ label, id, className = '', ...props }: InputProps) {
  const input = (
    <input
      id={id}
      className={`w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      {...props}
    />
  )
  if (!label) return input
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {input}
    </label>
  )
}
