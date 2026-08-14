'use client'

import { Input } from '@/components/ui/input'
import { formatFormattedInteger, parseFormattedInteger } from '@/lib/admin/numberFormat'

export default function AdminFormattedNumberInput({
  id,
  name,
  value,
  onChange,
  required,
  placeholder,
  className,
  max,
  min,
}) {
  const handleChange = (event) => {
    let parsed = parseFormattedInteger(event.target.value)
    let capped = false
    if (parsed !== '' && Number.isFinite(Number(max)) && Number(parsed) > Number(max)) {
      parsed = Math.floor(Number(max))
      capped = true
    }
    if (parsed !== '' && Number.isFinite(Number(min)) && Number(parsed) < Number(min)) {
      parsed = Math.ceil(Number(min))
    }
    onChange({
      target: {
        name,
        value: parsed,
      },
      capped,
    })
  }

  return (
    <Input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={formatFormattedInteger(value)}
      onChange={handleChange}
      required={required}
      placeholder={placeholder}
      className={className}
      max={max}
      min={min}
      aria-valuemax={Number.isFinite(Number(max)) ? Number(max) : undefined}
      aria-valuemin={Number.isFinite(Number(min)) ? Number(min) : undefined}
    />
  )
}
