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
}) {
  const handleChange = (event) => {
    const parsed = parseFormattedInteger(event.target.value)
    onChange({
      target: {
        name,
        value: parsed,
      },
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
    />
  )
}
