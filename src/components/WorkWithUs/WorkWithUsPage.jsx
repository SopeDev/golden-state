'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import OpenRoles from './OpenRoles'
import WorkWithUsForm from './WorkWithUsForm'
import WorkWithUsRolesManager from './WorkWithUsRolesManager'
import { GENERAL_INTEREST_VALUE, buildRolesFromContent } from '@/lib/careerRoles'

export default function WorkWithUsPage({ content, roles: rolesProp, initialRoleId, roleContentByLocale }) {
  const roles = useMemo(() => {
    if (Array.isArray(rolesProp)) return rolesProp
    return buildRolesFromContent(content)
  }, [content, rolesProp])

  const resolvedInitial = useMemo(() => {
    if (initialRoleId && roles.some((role) => role.id === initialRoleId)) {
      return initialRoleId
    }
    return GENERAL_INTEREST_VALUE
  }, [initialRoleId, roles])

  const [selectedRoleId, setSelectedRoleId] = useState(resolvedInitial)
  const [highlightNonce, setHighlightNonce] = useState(0)

  useEffect(() => {
    if (selectedRoleId === GENERAL_INTEREST_VALUE) return
    if (!roles.some((role) => role.id === selectedRoleId)) {
      setSelectedRoleId(GENERAL_INTEREST_VALUE)
    }
  }, [roles, selectedRoleId])

  const handleApply = (roleId) => {
    setSelectedRoleId(roleId)
    setHighlightNonce((value) => value + 1)
    const form = document.getElementById('work-with-us-form')
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="flex-1 bg-background">
      <section className="relative overflow-hidden border-b border-border text-primary-foreground">
        <div className="absolute inset-0">
          <Image
            src={content.heroImageUrl || '/images/skyline-3_1920.webp'}
            alt={content.heroTitle || 'Work with us'}
            fill
            priority
            unoptimized
            className="object-cover object-[center_35%]"
            sizes="100vw"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary-blue/70" aria-hidden />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(212,175,55,0.22),transparent_42%)]" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:py-20">
          <div className="max-w-3xl">
            {content.heroEyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-main-gold">
                {content.heroEyebrow}
              </p>
            ) : null}
            <h1 className="mt-3 font-heading text-3xl font-semibold md:text-5xl">{content.heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-primary-foreground/90 md:text-lg">
              {content.heroSubtitle}
            </p>
          </div>
        </div>
      </section>

      {roleContentByLocale ? (
        <WorkWithUsRolesManager initialContentByLocale={roleContentByLocale} />
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-10 lg:col-span-7">
            <div>
              <h2 className="font-heading text-2xl font-semibold text-primary md:text-3xl">
                {content.introTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                {content.introBody}
              </p>
            </div>

            <div className="space-y-4">
              {content.rolesKicker ? (
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-main-gold">
                  {content.rolesKicker}
                </p>
              ) : null}
              <div>
                <h2 className="font-heading text-2xl font-semibold text-primary md:text-3xl">
                  {content.rolesTitle}
                </h2>
                {content.rolesSubtitle ? (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {content.rolesSubtitle}
                  </p>
                ) : null}
              </div>
              <OpenRoles
                content={content}
                roles={roles}
                selectedRoleId={selectedRoleId}
                onApply={handleApply}
              />
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
            <WorkWithUsForm
              content={content}
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectedRoleChange={setSelectedRoleId}
              highlightNonce={highlightNonce}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
