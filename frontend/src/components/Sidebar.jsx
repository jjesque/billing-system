import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  HomeIcon,
  DocumentTextIcon,
  PlusIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  LogoutIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Generate Invoice', href: '/generate', icon: PlusIcon, roles: ['finance', 'admin'] },
  { name: 'Logs', href: '/logs', icon: ClipboardDocumentListIcon, roles: ['admin'] },
  { name: 'Settings', href: '/settings', icon: CogIcon, roles: ['admin'] },
]

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true
    return item.roles.some(role => hasRole(role))
  })

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 px-4 bg-primary-600">
        <h1 className="text-xl font-bold text-white">Billing System</h1>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                isActive
                  ? 'bg-primary-100 text-primary-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || user?.email}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.labels?.join(', ') || 'User'}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="ml-3 flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-150"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar