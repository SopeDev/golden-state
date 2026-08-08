'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminUserTypeLabel } from '@/lib/admin/adminLabels'
import {
  getAccreditedStatusBadgeClass,
} from '@/lib/auth/userStatus'
import {
  getInvestorAdminPhase,
  getInvestorAdminPhaseBadgeClass,
} from '@/lib/admin/userTimeline'
import { cn } from '@/lib/utils'
import { useMessaging } from '@/hooks/useMessaging'
import UserEditor from './UserEditor'

const filterChipClass = (active) =>
  cn(
    'cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide transition-colors',
    active
      ? 'border-main-gold bg-main-gold/15 text-main-gold'
      : 'border-border text-muted-foreground hover:text-primary'
  )

/** Sidebar badge for investors: onboarding phase, or accreditation overlay when ACTIVE. */
function getInvestorListBadge(user, t) {
  const phase = getInvestorAdminPhase(user)

  if (phase && phase !== 'ACTIVE') {
    return {
      label: t(`accountPhase.${phase}`),
      className: getInvestorAdminPhaseBadgeClass(phase),
    }
  }

  if (user.accreditedStatus === 'APPROVED') {
    return {
      label: t('filter.accredited'),
      className: getAccreditedStatusBadgeClass('APPROVED'),
    }
  }

  if (user.accreditedStatus === 'PENDING_REVIEW') {
    return {
      label: t('filter.pendingAccreditation'),
      className: getAccreditedStatusBadgeClass('PENDING_REVIEW'),
    }
  }

  return {
    label: t('filter.active'),
    className: getInvestorAdminPhaseBadgeClass('ACTIVE'),
  }
}

export default function UsersAdminClient({ users }) {
  const t = useTranslations('Admin')
  const { alert, confirm } = useMessaging()

  const ACCOUNT_STATUS_FILTERS = [
    { id: 'ALL', label: t('common.all') },
    { id: 'PENDING_EMAIL', label: t('filter.email') },
    { id: 'PENDING_PROFILE', label: t('filter.profile') },
    { id: 'PENDING_ADMIN', label: t('filter.approval') },
    { id: 'ACTIVE', label: t('filter.active') },
    { id: 'REJECTED', label: t('filter.rejected') },
  ]

  const ACCREDITATION_FILTERS = [
    { id: 'ALL', label: t('common.all') },
    { id: 'NOT_ACCREDITED', label: t('filter.notAccredited') },
    { id: 'PENDING_REVIEW', label: t('filter.pending') },
    { id: 'APPROVED', label: t('filter.accredited') },
  ]

  const [usersList, setUsersList] = useState(users)
  const [selectedId, setSelectedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [accountStatusFilter, setAccountStatusFilter] = useState('ALL')
  const [accreditationFilter, setAccreditationFilter] = useState('ALL')

  const selectedUser = useMemo(
    () => usersList.find((u) => u.id === selectedId) || null,
    [usersList, selectedId]
  )

  const filteredUsers = useMemo(() => {
    let list = usersList
    if (accountStatusFilter !== 'ALL') {
      list = list.filter((u) => {
        if (u.type !== 'INVESTOR') return false
        return getInvestorAdminPhase(u) === accountStatusFilter
      })
    }
    if (accreditationFilter === 'PENDING_REVIEW') {
      list = list.filter(
        (u) => u.type === 'INVESTOR' && u.accreditedStatus === 'PENDING_REVIEW'
      )
    } else if (accreditationFilter === 'APPROVED') {
      list = list.filter(
        (u) => u.type === 'INVESTOR' && u.accreditedStatus === 'APPROVED'
      )
    } else if (accreditationFilter === 'NOT_ACCREDITED') {
      list = list.filter(
        (u) =>
          u.type === 'INVESTOR' &&
          (u.accreditedStatus === 'NOT_STARTED' || u.accreditedStatus === 'REJECTED')
      )
    }
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        String(user.id).includes(q) ||
        user.type?.toLowerCase().includes(q)
    )
  }, [usersList, query, accountStatusFilter, accreditationFilter])

  const editorVisible = isCreating || selectedUser

  const handleNewUser = () => {
    setSelectedId(null)
    setIsCreating(true)
  }

  const handleSelectUser = (userId) => {
    setSelectedId(userId)
    setIsCreating(false)
  }

  const handleCancel = () => {
    setIsCreating(false)
    if (!selectedUser) {
      setSelectedId(null)
    }
  }

  const handleBackToList = () => {
    setIsCreating(false)
    setSelectedId(null)
  }

  const handleDeleteUser = async (userId) => {
    const confirmed = await confirm({
      message: t('common.confirmDeleteUser'),
      variant: 'destructive',
      confirmLabel: t('common.deleteUser'),
    })
    if (!confirmed) return

    setIsLoading(true)
    try {
      const deleteOnce = async (force) => {
        const url = force
          ? `/api/admin/users/${userId}?force=true`
          : `/api/admin/users/${userId}`
        return fetch(url, {
          method: 'DELETE',
          credentials: 'include',
        })
      }

      let response = await deleteOnce(false)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message = error.error || error.message || t('common.errorDeleteUser')

        if (error.code === 'HAS_INVESTMENTS') {
          const forceConfirmed = await confirm({
            message: t('common.confirmForceDeleteUser'),
            variant: 'destructive',
            confirmLabel: t('common.deleteUser'),
          })
          if (!forceConfirmed) return

          response = await deleteOnce(true)
          if (!response.ok) {
            const forceError = await response.json().catch(() => ({}))
            await alert(
              t('common.failedDeleteUser', {
                message: forceError.error || forceError.message || t('common.errorDeleteUser'),
              })
            )
            return
          }
        } else {
          await alert(t('common.failedDeleteUser', { message }))
          return
        }
      }

      setUsersList((prev) => prev.filter((u) => u.id !== userId))
      if (selectedId === userId) {
        setSelectedId(null)
        setIsCreating(false)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      await alert(t('common.errorDeleteUser'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleUserUpdated = (updatedUser) => {
    setUsersList((prev) => prev.map((u) => (u.id === updatedUser.id ? { ...u, ...updatedUser } : u)))
    window.dispatchEvent(new CustomEvent('admin-pending-count-changed'))
  }

  const handleFormSubmit = async (formData) => {
    setIsLoading(true)
    try {
      const isEdit = !isCreating && selectedUser
      const url = isEdit ? `/api/admin/users/${selectedUser.id}` : '/api/admin/users'
      const method = isEdit ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        if (isEdit) {
          setUsersList((prev) =>
            prev.map((u) => (u.id === selectedUser.id ? updatedUser : u))
          )
        } else {
          setUsersList((prev) => [updatedUser, ...prev])
          setSelectedId(updatedUser.id)
          setIsCreating(false)
        }
      } else {
        const error = await response.json()
        const message = error.error || error.message || t('common.actionFailed')
        await alert(
          isEdit
            ? t('common.failedUpdateUser', { message })
            : t('common.failedCreateUser', { message })
        )
      }
    } catch (error) {
      console.error('Error saving user:', error)
      await alert(t('common.errorSaveUser'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-primary">{t('users.title')}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{t('users.subtitle')}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card
          className={cn(
            'border-border/80 shadow-sm lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-hidden',
            editorVisible ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'
          )}
        >
          <CardHeader className="space-y-3 border-b border-border/60 pb-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base text-primary">
                {t('users.listTitle', { count: usersList.length })}
              </CardTitle>
              <Button type="button" size="sm" onClick={handleNewUser} className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                {t('common.new')}
              </Button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('common.searchUsers')}
                className="pl-8"
              />
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('filter.accountStatus')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ACCOUNT_STATUS_FILTERS.map((chip) => (
                    <button
                      key={`account-${chip.id}`}
                      type="button"
                      onClick={() => setAccountStatusFilter(chip.id)}
                      className={filterChipClass(accountStatusFilter === chip.id)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5 border-t border-border/60 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {t('filter.accreditation')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ACCREDITATION_FILTERS.map((chip) => (
                    <button
                      key={`accreditation-${chip.id}`}
                      type="button"
                      onClick={() => setAccreditationFilter(chip.id)}
                      className={filterChipClass(accreditationFilter === chip.id)}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredUsers.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {query ? t('common.noUsersSearch') : t('common.noUsersYet')}
              </p>
            ) : (
              <ul>
                {filteredUsers.map((user) => {
                  const isActive = !isCreating && user.id === selectedId
                  const isAdmin = user.type === 'ADMIN'
                  const badge = isAdmin
                    ? null
                    : getInvestorListBadge(user, t)
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user.id)}
                        className={cn(
                          'flex w-full cursor-pointer items-start justify-between gap-3 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          isActive && 'border-l-main-gold bg-main-gold/10'
                        )}
                      >
                        <div className="min-w-0 space-y-1">
                          <span className="block truncate text-sm font-medium text-primary">
                            {user.email}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            #{user.id}
                          </span>
                        </div>
                        {isAdmin ? (
                          <span className="shrink-0 self-center rounded-full border border-border bg-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                            {adminUserTypeLabel(t, 'ADMIN')}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              'shrink-0 self-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              badge.className
                            )}
                          >
                            {badge.label}
                          </span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className={cn(editorVisible ? 'block' : 'hidden lg:block')}>
          <div className="mb-3 flex items-center lg:hidden">
            <Button type="button" variant="ghost" size="sm" onClick={handleBackToList} className="gap-1.5">
              <ArrowLeft className="size-4" aria-hidden />
              {t('common.backToUsers')}
            </Button>
          </div>

          {editorVisible ? (
            <UserEditor
              key={isCreating ? '__new__' : selectedUser?.id}
              user={selectedUser}
              isCreating={isCreating}
              isLoading={isLoading}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              onDelete={handleDeleteUser}
              onUserUpdated={handleUserUpdated}
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
                <p>{t('common.selectUserHint')}</p>
                <Button type="button" size="sm" onClick={handleNewUser} className="gap-1.5">
                  <Plus className="size-4" aria-hidden />
                  {t('common.createNewUser')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
