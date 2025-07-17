'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Button from '../../../components/Button'

export default function AdminNav() {
  const pathname = usePathname()

  const navItems = [  
    { href: '/admin/properties', label: 'Property Management' },
  ]

  const navItemsDatabase = [
    { href: '/admin/data', label: 'Database Records' },
    { href: '/admin/schema', label: 'Database Schema' }
  ]

  return (
    <div className="bg-white shadow-md mb-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <h2 className="text-xl font-bold text-main-blue">Admin Panel</h2>
            <nav className="flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.endsWith(item.href)
                      ? 'bg-main-blue text-white'
                      : 'text-main-text hover:text-main-blue hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-6">
              {navItemsDatabase.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.endsWith(item.href)
                      ? 'bg-main-blue text-white'
                      : 'text-main-text hover:text-main-blue hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
} 