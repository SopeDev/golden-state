'use client'

import { useState } from 'react'
import Button from '../../../components/Button'

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
      minute: '2-digit'
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
        setUsersList(usersList.filter(u => u.id !== userId))
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
      const url = editingUser 
        ? `/api/admin/users/${editingUser.id}`
        : '/api/admin/users'
      
      const method = editingUser ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        if (editingUser) {
          setUsersList(usersList.map(u => 
            u.id === editingUser.id ? updatedUser : u
          ))
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-main-blue mb-4">User Management</h1>
            <p className="text-lg text-main-text max-w-2xl">
              Create, edit, and manage users in the Golden State investment platform.
            </p>
          </div>
          <Button
            onClick={handleCreateUser}
            variant="primary"
            className="px-6 py-3"
          >
            + Add New User
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-main-blue text-white">
                <tr>
                  <th className="px-6 py-4 text-left">ID</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Type</th>
                  <th className="px-6 py-4 text-left">Provider</th>
                  <th className="px-6 py-4 text-left">Investments</th>
                  <th className="px-6 py-4 text-left">Created</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-main-blue">#{user.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-main-blue">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        user.type === 'ADMIN' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {user.provider || 'credentials'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-main-gold">
                        {user._count?.investments || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditUser(user)}
                          variant="outlineblue"
                          className="px-3 py-1 text-sm"
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="ghost"
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
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
        </div>

        {/* User Form Modal */}
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
    password: '', // Always empty for security
    type: user?.type || 'INVESTOR'
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Only include password if it's not empty (for updates)
    const submitData = { ...formData }
    if (!submitData.password) {
      delete submitData.password
    }

    onSubmit(submitData)
  }

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.75)] flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-main-blue">
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <Button
            onClick={onCancel}
            variant="ghost"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Password {user && '(leave blank to keep current)'}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                required={!user} // Only required for new users
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                User Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-main-blue focus:border-transparent"
                required
              >
                <option value="INVESTOR">Investor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-main-text mb-2">
                Authentication Provider
              </label>
              <input
                type="text"
                value={formData.provider || 'credentials'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                disabled
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                This shows how the user originally signed up and cannot be changed
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              onClick={onCancel}
              variant="outlineblue"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (user ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 