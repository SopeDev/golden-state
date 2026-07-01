'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminAccountStatusLabel, adminUserTypeLabel } from '@/lib/admin/adminLabels'
import { getAccountStatusBadgeClass } from '@/lib/auth/userStatus'
import { cn } from '@/lib/utils'
import UserEditor from './UserEditor'

export default function UsersAdminClient({ users }) {
  const t = useTranslations('Admin')
  const locale = useLocale()

  const formatDate = (date) =>
    new Date(date).toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  const [usersList, setUsersList] = useState(users)
  const [selectedId, setSelectedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const selectedUser = useMemo(
    () => usersList.find((u) => u.id === selectedId) || null,
    [usersList, selectedId]
  )

  const filteredUsers = useMemo(() => {
    let list = usersList
    if (statusFilter === 'PENDING_ADMIN') {
      list = list.filter((u) => u.accountStatus === 'PENDING_ADMIN')
    } else if (statusFilter === 'PENDING_EMAIL') {
      list = list.filter((u) => u.accountStatus === 'PENDING_EMAIL')
    } else if (statusFilter === 'ACCREDITATION') {
      list = list.filter((u) => u.accreditedStatus === 'PENDING_REVIEW')
    } else if (statusFilter === 'ACTIVE') {
      list = list.filter((u) => u.accountStatus === 'ACTIVE')
    }
    if (!query.trim()) return list
    const q = query.trim().toLowerCase()
    return list.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        String(user.id).includes(q) ||
        user.type?.toLowerCase().includes(q)
    )
  }, [usersList, query, statusFilter])

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
    if (!confirm(t('common.confirmDeleteUser'))) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setUsersList((prev) => prev.filter((u) => u.id !== userId))
        if (selectedId === userId) {
          setSelectedId(null)
          setIsCreating(false)
        }
      } else {
        const error = await response.json()
        alert(t('common.failedUpdateUser', { message: error.message }))
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(t('common.errorDeleteUser'))
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
        alert(
          isEdit
            ? t('common.failedUpdateUser', { message: error.message })
            : t('common.failedCreateUser', { message: error.message })
        )
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert(t('common.errorSaveUser'))
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
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: t('common.all') },
                { id: 'PENDING_EMAIL', label: t('filter.email') },
                { id: 'PENDING_ADMIN', label: t('filter.approval') },
                { id: 'ACCREDITATION', label: t('filter.accredited') },
                { id: 'ACTIVE', label: t('filter.active') },
              ].map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setStatusFilter(chip.id)}
                  className={cn(
                    'rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                    statusFilter === chip.id
                      ? 'border-main-gold bg-main-gold/15 text-main-gold'
                      : 'border-border text-muted-foreground hover:border-main-gold/40'
                  )}
                >
                  {chip.label}
                </button>
              ))}
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
                  return (
                    <li key={user.id}>
                      <button
                        type="button"
                        onClick={() => handleSelectUser(user.id)}
                        className={cn(
                          'flex w-full flex-col items-start gap-1 border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50',
                          isActive && 'border-l-main-gold bg-main-gold/10'
                        )}
                      >
                        <div className="flex w-full items-center justify-between gap-2">
                          <span className="truncate text-sm font-medium text-primary">{user.email}</span>
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                              user.type === 'ADMIN'
                                ? 'bg-destructive/15 text-destructive'
                                : 'bg-green-600/15 text-green-800 dark:text-green-400'
                            )}
                          >
                            {adminUserTypeLabel(t, user.type)}
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            #{user.id} · {user.provider || t('common.credentials')}
                          </span>
                          <span className="shrink-0">
                            {t('common.investmentsShort', { count: user._count?.investments || 0 })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {user.type === 'INVESTOR' && user.accountStatus ? (
                            <span
                              className={cn(
                                'rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase',
                                getAccountStatusBadgeClass(user.accountStatus)
                              )}
                            >
                              {adminAccountStatusLabel(t, user.accountStatus)}
                            </span>
                          ) : null}
                          {user.type === 'INVESTOR' && user.accreditedStatus === 'PENDING_REVIEW' ? (
                            <span className="rounded-full bg-main-gold/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-main-gold">
                              {t('common.accReviewShort')}
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {t('common.joined', { date: formatDate(user.createdAt) })}
                        </div>
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
