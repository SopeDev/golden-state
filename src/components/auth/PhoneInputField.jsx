'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  getCountries,
  getCountryCallingCode,
  parsePhoneNumberFromString,
} from 'libphonenumber-js'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const PRIORITY_COUNTRIES = ['US', 'MX', 'CA']

const defaultCountryFromLocale = (locale) => (locale === 'es' ? 'MX' : 'US')

const flagImageUrl = (countryCode) =>
  `https://flagcdn.com/w40/${String(countryCode || '').toLowerCase()}.png`

const CountryFlag = ({ country, className }) => (
  <img
    src={flagImageUrl(country)}
    alt=""
    width={20}
    height={15}
    loading="lazy"
    decoding="async"
    className={cn('h-[15px] w-5 shrink-0 rounded-[2px] object-cover', className)}
  />
)

const buildCountryOptions = (locale) => {
  const names = new Intl.DisplayNames([locale], { type: 'region' })
  const priority = new Set(PRIORITY_COUNTRIES)

  return getCountries()
    .map((country) => {
      const dialCode = getCountryCallingCode(country)
      const label = names.of(country) || country
      return {
        country,
        dialCode,
        label,
        shortLabel: `${country} (+${dialCode})`,
      }
    })
    .sort((a, b) => {
      const aPriority = priority.has(a.country)
      const bPriority = priority.has(b.country)
      if (aPriority && !bPriority) return -1
      if (!aPriority && bPriority) return 1
      if (aPriority && bPriority) {
        return PRIORITY_COUNTRIES.indexOf(a.country) - PRIORITY_COUNTRIES.indexOf(b.country)
      }
      return a.label.localeCompare(b.label, locale)
    })
}

const parseInitialPhone = (value, fallbackCountry) => {
  const raw = typeof value === 'string' ? value.trim() : ''
  if (!raw) {
    return { country: fallbackCountry, national: '' }
  }

  const parsed = parsePhoneNumberFromString(raw)
  if (parsed?.country) {
    return {
      country: parsed.country,
      national: parsed.nationalNumber || '',
    }
  }

  return { country: fallbackCountry, national: raw.replace(/\D/g, '') }
}

const composePhone = (country, national) => {
  const digits = String(national || '').replace(/\D/g, '')
  if (!digits) return ''
  return `+${getCountryCallingCode(country)}${digits}`
}

/**
 * Country dial-code select + national number input.
 * - Form submit: hidden `name` field gets E.164-style value when `name` is set
 * - Optional `onChange(fullPhone)` for parent state (e.g. account settings)
 */
export default function PhoneInputField({
  id,
  name,
  locale = 'en',
  defaultCountry,
  defaultValue = '',
  onChange,
  countryLabel,
  numberPlaceholder,
  className,
}) {
  const fallbackCountry = defaultCountry || defaultCountryFromLocale(locale)
  const options = useMemo(() => buildCountryOptions(locale), [locale])
  const optionsByCountry = useMemo(
    () => Object.fromEntries(options.map((option) => [option.country, option])),
    [options]
  )

  const [country, setCountry] = useState(
    () => parseInitialPhone(defaultValue, fallbackCountry).country
  )
  const [national, setNational] = useState(
    () => parseInitialPhone(defaultValue, fallbackCountry).national
  )

  useEffect(() => {
    if (!defaultCountry) return
    if (national.trim()) return
    setCountry(defaultCountry)
  }, [defaultCountry, national])

  const fullPhone = composePhone(country, national)
  const selected = optionsByCountry[country]

  const updateNational = (nextNational) => {
    setNational(nextNational)
    onChange?.(composePhone(country, nextNational))
  }

  const updateCountry = (nextCountry) => {
    if (!nextCountry) return
    setCountry(nextCountry)
    onChange?.(composePhone(nextCountry, national))
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Select value={country} onValueChange={updateCountry}>
        <SelectTrigger
          aria-label={countryLabel || 'Country code'}
          className="h-8 w-[8.25rem] shrink-0 px-2"
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <CountryFlag country={country} />
            <span className="truncate text-sm">
              {selected?.shortLabel || `${country} (+${getCountryCallingCode(country)})`}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent
          align="start"
          alignItemWithTrigger={false}
          className="max-h-72 min-w-[14rem]"
        >
          {options.map((option) => (
            <SelectItem key={option.country} value={option.country} title={option.label}>
              <CountryFlag country={option.country} />
              <span>{option.shortLabel}</span>
              <span className="sr-only">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        placeholder={numberPlaceholder}
        value={national}
        onChange={(event) => updateNational(event.target.value)}
        className="min-w-0 flex-1"
      />
      {name ? <input type="hidden" name={name} value={fullPhone} /> : null}
    </div>
  )
}
