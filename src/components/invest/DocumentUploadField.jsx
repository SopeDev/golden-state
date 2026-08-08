'use client'

import { useState } from 'react'
import { CheckCircle2, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { INVESTOR_DOCUMENT_FIELDS } from '@/lib/investorDocumentFields'

const DocumentUploadField = ({
  id,
  name,
  label,
  hint,
  icon: Icon,
  accept,
  t,
  required = false,
}) => {
  const [fileNames, setFileNames] = useState([])
  const hasFiles = fileNames.length > 0

  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex h-full cursor-pointer flex-col gap-3 rounded-xl border-2 border-dashed p-4 transition-all',
        hasFiles
          ? 'border-green-600/40 bg-green-600/[0.04]'
          : 'border-border/80 bg-background hover:border-main-gold/50 hover:bg-muted/20'
      )}
    >
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple
        required={required}
        className="sr-only"
        onChange={(e) => {
          const names = Array.from(e.target.files || []).map((file) => file.name)
          setFileNames(names)
        }}
      />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg',
            hasFiles ? 'bg-green-600/15 text-green-700 dark:text-green-400' : 'bg-main-gold/15 text-main-gold'
          )}
        >
          {hasFiles ? (
            <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Icon className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-snug text-primary">{label}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</p>
        </div>
      </div>
      <div
        className={cn(
          'mt-auto space-y-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors',
          hasFiles
            ? 'border-green-600/25 bg-background text-foreground'
            : 'border-border/70 bg-muted/30 text-muted-foreground group-hover:border-main-gold/30 group-hover:bg-muted/50'
        )}
      >
        <div className="flex items-center gap-2">
          <Upload className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden="true" />
          <span className="truncate">
            {hasFiles ? t('filesSelected', { count: fileNames.length }) : t('chooseFiles')}
          </span>
        </div>
        {hasFiles ? (
          <ul className="space-y-0.5 border-t border-border/50 pt-1.5 font-normal text-muted-foreground">
            {fileNames.map((fileName, index) => (
              <li key={`${fileName}-${index}`} className="truncate" title={fileName}>
                {fileName}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </label>
  )
}

const FILE_ACCEPT = '.pdf,image/jpeg,image/png,image/webp'

export default function DocumentUploadFieldGrid({ t, fieldNames, requiredFieldNames }) {
  const fields = fieldNames?.length
    ? INVESTOR_DOCUMENT_FIELDS.filter((field) => fieldNames.includes(field.name))
    : INVESTOR_DOCUMENT_FIELDS
  const requiredSet = new Set(requiredFieldNames || fieldNames || [])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <DocumentUploadField
          key={field.name}
          id={field.name}
          name={field.name}
          label={t(field.labelKey)}
          hint={t(field.hintKey)}
          icon={field.icon}
          accept={FILE_ACCEPT}
          t={t}
          required={requiredSet.has(field.name)}
        />
      ))}
    </div>
  )
}
