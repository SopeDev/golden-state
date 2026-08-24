'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
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
import { adminUserPath } from '@/lib/adminLinks'
import { useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useMessaging } from '@/hooks/useMessaging'
import AdminFilterCheckboxMenu from '@/components/admin/AdminFilterCheckboxMenu'
import AdminListPagination, { paginateItems } from '@/components/admin/AdminListPagination'
import { AdminPageFrame, AdminPageHeader } from '@/components/admin/AdminPageHeader'
import UserEditor from './UserEditor'

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

const ACCOUNT_STATUS_OPTION_IDS = [
  'PENDING_EMAIL',
  'PENDING_PROFILE',
  'PENDING_ADMIN',
  'ACTIVE',
  'REJECTED',
]

const ACCREDITATION_OPTION_IDS = ['NOT_ACCREDITED', 'PENDING_REVIEW', 'APPROVED']

const ACCOUNT_STATUS_LABEL_KEYS = {
  PENDING_EMAIL: 'filter.email',
  PENDING_PROFILE: 'filter.profile',
  PENDING_ADMIN: 'filter.approval',
  ACTIVE: 'filter.active',
  REJECTED: 'filter.rejected',
}

const ACCREDITATION_LABEL_KEYS = {
  NOT_ACCREDITED: 'filter.notAccredited',
  PENDING_REVIEW: 'filter.pending',
  APPROVED: 'filter.accredited',
}

function toInitialFilterArray(value, validIds) {
  if (!value || value === 'ALL') return []
  return validIds.includes(value) ? [value] : []
}

function matchesAccreditationFilter(user, selectedIds) {
  if (user.type !== 'INVESTOR') return false
  return selectedIds.some((id) => {
    if (id === 'PENDING_REVIEW') return user.accreditedStatus === 'PENDING_REVIEW'
    if (id === 'APPROVED') return user.accreditedStatus === 'APPROVED'
    if (id === 'NOT_ACCREDITED') {
      return user.accreditedStatus === 'NOT_STARTED' || user.accreditedStatus === 'REJECTED'
    }
    return false
  })
}

export default function UsersAdminClient({
  users,
  initialAccountStatusFilter = 'ALL',
  initialAccreditationFilter = 'ALL',
  initialSelectedId = '',
}) {
  const t = useTranslations('Admin')
  const router = useRouter()
  const searchParams = useSearchParams()
  const { alert, confirm } = useMessaging()
  const { data: session } = useSession()
  const canManageUsers = session?.user?.type === 'ADMIN'

  const accountStatusOptions = useMemo(
    () =>
      ACCOUNT_STATUS_OPTION_IDS.map((id) => ({
        id,
        label: t(ACCOUNT_STATUS_LABEL_KEYS[id]),
      })),
    [t]
  )

  const accreditationOptions = useMemo(
    () =>
      ACCREDITATION_OPTION_IDS.map((id) => ({
        id,
        label: t(ACCREDITATION_LABEL_KEYS[id]),
      })),
    [t]
  )

  const [usersList, setUsersList] = useState(users)
  const [selectedId, setSelectedId] = useState(() => {
    if (!initialSelectedId) return null
    const normalized = String(initialSelectedId)
    const match = users.find((user) => String(user.id) === normalized)
    return match ? match.id : null
  })
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [accountStatusFilters, setAccountStatusFilters] = useState(() =>
    toInitialFilterArray(initialAccountStatusFilter, ACCOUNT_STATUS_OPTION_IDS)
  )
  const [accreditationFilters, setAccreditationFilters] = useState(() =>
    toInitialFilterArray(initialAccreditationFilter, ACCREDITATION_OPTION_IDS)
  )
  const [page, setPage] = useState(1)

  const idFromUrl = searchParams.get('id') || ''

  const selectedUser = useMemo(
    () => usersList.find((u) => String(u.id) === String(selectedId)) || null,
    [usersList, selectedId]
  )

  const syncUserUrl = (userId) => {
    router.replace(userId != null && userId !== '' ? adminUserPath(userId) : '/admin/users', {
      scroll: false,
    })
  }

  useEffect(() => {
    if (isCreating) return
    if (idFromUrl) {
      const match = usersList.find((user) => String(user.id) === String(idFromUrl))
      if (match) {
        setSelectedId(match.id)
        return
      }
    }
    if (!idFromUrl) {
      setSelectedId(null)
    }
  }, [idFromUrl, usersList, isCreating])

  const filteredUsers = useMemo(() => {
    let list = usersList
    if (accountStatusFilters.length > 0) {
      list = list.filter((u) => {
        if (u.type !== 'INVESTOR') return false
        return accountStatusFilters.includes(getInvestorAdminPhase(u))
      })
    }
    if (accreditationFilters.length > 0) {
      list = list.filter((u) => matchesAccreditationFilter(u, accreditationFilters))
    }
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        String(user.id).includes(q) ||
        user.type?.toLowerCase().includes(q)
    )
  }, [usersList, query, accountStatusFilters, accreditationFilters])

  useEffect(() => {
    setPage(1)
  }, [query, accountStatusFilters, accreditationFilters])

  const pagination = useMemo(() => paginateItems(filteredUsers, page), [filteredUsers, page])

  const editorVisible = isCreating || selectedUser

  const handleNewUser = () => {
    setSelectedId(null)
    setIsCreating(true)
    syncUserUrl(null)
  }

  const handleSelectUser = (userId) => {
    setSelectedId(userId)
    setIsCreating(false)
    syncUserUrl(userId)
  }

  const handleCancel = () => {
    setIsCreating(false)
    if (!selectedUser) {
      setSelectedId(null)
      syncUserUrl(null)
    }
  }

  const handleBackToList = () => {
    setIsCreating(false)
    setSelectedId(null)
    syncUserUrl(null)
  }

  const clearFilters = () => {
    setQuery('')
    setAccountStatusFilters([])
    setAccreditationFilters([])
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
        syncUserUrl(null)
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
          syncUserUrl(updatedUser.id)
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

  return editorVisible ? (
    <AdminPageFrame>
      <div className="mb-4">
        <Button type="button" variant="ghost" size="sm" onClick={handleBackToList} className="gap-1.5">
          <ArrowLeft className="size-4" aria-hidden />
          {t('common.backToUsers')}
        </Button>
      </div>
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
    </AdminPageFrame>
  ) : (
    <AdminPageFrame>
      <AdminPageHeader
        className="mb-6"
        eyebrow={t('users.eyebrow')}
        title={t('users.title')}
        description={t('users.subtitle')}
        actions={
          canManageUsers ? <Button type="button" onClick={handleNewUser} className="gap-1.5">
            <Plus className="size-4" aria-hidden />
            {t('common.new')}
          </Button> : null
        }
      />

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="space-y-3 border-b border-border/60 pb-4">
          <CardTitle className="text-base text-primary">
            {t('users.listTitle', { count: filteredUsers.length })}
          </CardTitle>
          <div className="flex flex-row flex-wrap items-center gap-2 sm:flex-nowrap">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('common.searchUsers')}
                className="pl-8"
              />
            </div>
            <div className="flex shrink-0 flex-row flex-wrap items-center gap-2">
              <AdminFilterCheckboxMenu
                label={t('filter.accountStatus')}
                allLabel={t('common.all')}
                options={accountStatusOptions}
                selectedIds={accountStatusFilters}
                onChange={setAccountStatusFilters}
              />
              <AdminFilterCheckboxMenu
                label={t('filter.accreditation')}
                allLabel={t('common.all')}
                options={accreditationOptions}
                selectedIds={accreditationFilters}
                onChange={setAccreditationFilters}
              />
              {(query.trim() ||
                accountStatusFilters.length > 0 ||
                accreditationFilters.length > 0) ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2.5 text-muted-foreground"
                  onClick={clearFilters}
                >
                  {t('common.clearFilters')}
                </Button>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {query ? t('common.noUsersSearch') : t('common.noUsersYet')}
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {pagination.items.map((user) => {
                const isStaff = user.type === 'ADMIN' || user.type === 'OPERATOR'
                const badge = isStaff ? null : getInvestorListBadge(user, t)
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectUser(user.id)}
                      className="flex w-full cursor-pointer items-start justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50"
                    >
                      <div className="min-w-0 space-y-1">
                        <span className="block truncate text-sm font-medium text-primary">
                          {user.email}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          #{user.id}
                        </span>
                      </div>
                      {isStaff ? (
                        <span className="shrink-0 self-center rounded-full border border-border bg-transparent px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {adminUserTypeLabel(t, user.type)}
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
          <AdminListPagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            from={pagination.from}
            to={pagination.to}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
    </AdminPageFrame>
  )
}
