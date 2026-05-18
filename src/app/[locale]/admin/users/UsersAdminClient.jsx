'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import UserEditor from './UserEditor'

const formatDate = (date) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

export default function UsersAdminClient({ users }) {
  const [usersList, setUsersList] = useState(users)
  const [selectedId, setSelectedId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [query, setQuery] = useState('')

  const selectedUser = useMemo(
    () => usersList.find((u) => u.id === selectedId) || null,
    [usersList, selectedId]
  )

  const filteredUsers = useMemo(() => {
    if (!query.trim()) return usersList
    const q = query.trim().toLowerCase()
    return usersList.filter(
      (user) =>
        user.email?.toLowerCase().includes(q) ||
        String(user.id).includes(q) ||
        user.type?.toLowerCase().includes(q)
    )
  }, [usersList, query])

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
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

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
        alert(`Failed to delete user: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error deleting user')
    } finally {
      setIsLoading(false)
    }
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
        alert(`Failed to ${isEdit ? 'update' : 'create'} user: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving user:', error)
      alert('Error saving user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-semibold text-primary">User Management</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Pick a user from the list to edit, or create a new one.
          </p>
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
              <CardTitle className="text-base text-primary">Users · {usersList.length}</CardTitle>
              <Button type="button" size="sm" onClick={handleNewUser} className="gap-1.5">
                <Plus className="size-4" aria-hidden />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by email, id, or type"
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredUsers.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                {query ? 'No users match your search.' : 'No users yet.'}
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
                            {user.type}
                          </span>
                        </div>
                        <div className="flex w-full items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            #{user.id} · {user.provider || 'credentials'}
                          </span>
                          <span className="shrink-0">
                            {user._count?.investments || 0} inv.
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Joined {formatDate(user.createdAt)}
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
              Back to users
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
            />
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 py-10 text-center text-sm text-muted-foreground">
                <p>Select a user from the list to view and edit their details.</p>
                <Button type="button" size="sm" onClick={handleNewUser} className="gap-1.5">
                  <Plus className="size-4" aria-hidden />
                  Create new user
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
