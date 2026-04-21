'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminSelectClassName } from '@/lib/adminFormClasses'

export default function UsersAdminClient({ users }) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [usersList, setUsersList] = useState(users)
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCreateUser = () => {
    setEditingUser(null)
    setIsFormOpen(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setIsFormOpen(true)
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
        setUsersList(usersList.filter((u) => u.id !== userId))
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
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users'
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        if (editingUser) {
          setUsersList(usersList.map((u) => (u.id === editingUser.id ? updatedUser : u)))
        } else {
          setUsersList([updatedUser, ...usersList])
        }
        setIsFormOpen(false)
        setEditingUser(null)
      } else {
        const error = await response.json()
        alert(`Failed to ${editingUser ? 'update' : 'create'} user: ${error.message}`)
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
            Create, edit, and manage users in the Golden State investment platform.
          </p>
        </div>
        <Button type="button" onClick={handleCreateUser} className="shrink-0">
          + Add New User
        </Button>
      </div>

      <Card className="overflow-hidden border-border/80 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium md:px-6">ID</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Email</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Type</th>
                <th className="hidden px-6 py-3 text-left font-medium md:table-cell">Provider</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Investments</th>
                <th className="hidden px-6 py-3 text-left font-medium lg:table-cell">Created</th>
                <th className="px-4 py-3 text-left font-medium md:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((user) => (
                <tr key={user.id} className="border-b border-border transition-colors hover:bg-muted/40">
                  <td className="px-4 py-3 md:px-6">
                    <span className="font-semibold text-primary">#{user.id}</span>
                  </td>
                  <td className="max-w-[10rem] truncate px-4 py-3 font-medium text-primary md:max-w-none md:px-6">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        user.type === 'ADMIN' ? 'bg-destructive/15 text-destructive' : 'bg-green-600/15 text-green-800 dark:text-green-400'
                      }`}
                    >
                      {user.type}
                    </span>
                  </td>
                  <td className="hidden px-6 py-3 text-muted-foreground md:table-cell">
                    {user.provider || 'credentials'}
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <span className="font-semibold text-main-gold">{user._count?.investments || 0}</span>
                  </td>
                  <td className="hidden px-6 py-3 text-muted-foreground lg:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 md:px-6">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {isFormOpen && (
        <UserForm
          user={editingUser}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setEditingUser(null)
          }}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

function UserForm({ user, onSubmit, onCancel, isLoading }) {
  const [formData, setFormData] = useState({
    email: user?.email || '',
    password: '',
    type: user?.type || 'INVESTOR',
    provider: user?.provider || 'credentials',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = { ...formData }
    delete submitData.provider
    if (!submitData.password) {
      delete submitData.password
    }
    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-border/80 shadow-lg">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <CardTitle className="font-heading text-2xl text-primary">
            {user ? 'Edit User' : 'Create New User'}
          </CardTitle>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel} aria-label="Close">
            ✕
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-email" className="text-main-gold">Email Address</Label>
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
                <Label htmlFor="user-password" className="text-main-gold">Password {user && '(leave blank to keep current)'}</Label>
                <Input
                  id="user-password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user-type" className="text-main-gold">User Type</Label>
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

            <div className="flex justify-end gap-3 border-t border-border pt-6">
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : user ? 'Update User' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
