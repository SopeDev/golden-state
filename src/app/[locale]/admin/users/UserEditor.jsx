'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminSelectClassName } from '@/lib/adminFormClasses'

const buildInitialState = (user) => ({
  email: user?.email || '',
  password: '',
  type: user?.type || 'INVESTOR',
  provider: user?.provider || 'credentials',
})

export default function UserEditor({
  user,
  isCreating,
  isLoading,
  onSubmit,
  onCancel,
  onDelete,
}) {
  const initialState = useMemo(() => buildInitialState(user), [user])
  const [formData, setFormData] = useState(initialState)

  const resetForm = useCallback(() => {
    setFormData(buildInitialState(user))
  }, [user])

  useEffect(() => {
    resetForm()
  }, [user?.id, isCreating, resetForm])

  const isDirty = useMemo(() => {
    return (
      formData.email !== initialState.email ||
      formData.type !== initialState.type ||
      formData.password.length > 0
    )
  }, [formData, initialState])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCancelClick = () => {
    if (isCreating) {
      onCancel?.()
      return
    }
    resetForm()
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const submitData = { ...formData }
    delete submitData.provider
    if (!submitData.password) {
      delete submitData.password
    }
    onSubmit(submitData)
  }

  const headingPrefix = isCreating ? 'Create New User' : 'Edit User'

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="font-heading text-2xl text-primary">
            {headingPrefix}
          </CardTitle>
          {user && !isCreating ? (
            <p className="mt-1 text-xs text-muted-foreground">
              ID #{user.id} · {user.provider || 'credentials'}
            </p>
          ) : null}
        </div>
        {!isCreating && user ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => onDelete?.(user.id)}
            disabled={isLoading}
          >
            Delete user
          </Button>
        ) : null}
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-email" className="text-main-gold">
                Email Address
              </Label>
              <Input
                id="user-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-password" className="text-main-gold">
                Password {user && !isCreating ? '(leave blank to keep current)' : ''}
              </Label>
              <Input
                id="user-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={isCreating}
                placeholder={isCreating ? 'Set initial password' : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-type" className="text-main-gold">
                User Type
              </Label>
              <select
                id="user-type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={adminSelectClassName()}
                required
              >
                <option value="INVESTOR">Investor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-main-gold">Authentication Provider</Label>
              <Input value={formData.provider || 'credentials'} disabled readOnly className="bg-muted" />
              <p className="text-xs text-muted-foreground">
                This shows how the user originally signed up and cannot be changed.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground">
              {isDirty ? (
                <span className="text-main-gold">Unsaved changes</span>
              ) : isCreating ? (
                'Fill out the form, then create.'
              ) : (
                'No unsaved changes.'
              )}
            </p>
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancelClick}
                disabled={isLoading || (!isCreating && !isDirty)}
              >
                {isCreating ? 'Cancel' : 'Discard changes'}
              </Button>
              <Button type="submit" disabled={isLoading || (!isCreating && !isDirty)}>
                {isLoading ? 'Saving...' : isCreating ? 'Create user' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
