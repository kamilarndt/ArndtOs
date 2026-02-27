'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'
import { ConnectionStatus } from '@/types'
import { ErrorBoundary } from './ErrorBoundary'
import { pluginRegistry, PluginNavItem } from '@/plugins/registry'

interface NavItem {
  id: string
  label: string
  icon: string
  badge?: number
  isPlugin?: boolean
}

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'agents', label: 'Agents', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: 'settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
]

// Get plugin navigation items
function getPluginNavItems(): NavItem[] {
  const pluginItems = pluginRegistry.getNavItems()
  return pluginItems.map((plugin: PluginNavItem) => ({
    id: plugin.id,
    label: plugin.label,
    icon: plugin.icon,
    isPlugin: true
  }))
}

const statusColors: Record<ConnectionStatus, string> = {
  connecting: 'bg-yellow-500 animate-pulse',
  connected: 'bg-green-500',
  disconnected: 'bg-gray-500',
  error: 'bg-red-500',
}

const statusLabels: Record<ConnectionStatus, string> = {
  connecting: 'Connecting...',
  connected: 'Connected',
  disconnected: 'Disconnected',
  error: 'Error',
}

export default function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { sidebarOpen, connectionStatus, toggleSidebar } = useUIStore()
  const { status: agentStatus, lastMessage } = useAgentStore()
  const [activeItem, setActiveItem] = useState('dashboard')

  // Get plugin nav items (in real app this would be dynamic)
  const pluginNavItems = getPluginNavItems()
  const allNavItems = [...mainNavItems, ...pluginNavItems]

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId)
    router.push(`/${itemId === 'dashboard' ? '' : itemId}`)
  }

  // Sync active item with current pathname
  React.useEffect(() => {
    const path = pathname?.replace('/', '') || 'dashboard'
    setActiveItem(path)
  }, [pathname])

  return (
    <ErrorBoundary>
      <aside
        className={`
          fixed left-0 top-0 h-screen w-16 bg-slate-900/95 backdrop-blur-md
          border-r border-slate-700/50 transition-all duration-300 ease-out
          z-50 flex flex-col
          ${sidebarOpen ? 'w-64' : 'w-16'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-slate-700/50">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">ZC</span>
          </div>
          {sidebarOpen && (
            <span className="ml-3 font-bold text-white text-lg tracking-tight">
              ZeroClaw OS
            </span>
          )}
        </div>

        {/* Connection Status */}
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${statusColors[connectionStatus]}`} />
            {sidebarOpen && (
              <span className="ml-3 text-sm text-slate-400">
                {statusLabels[connectionStatus]}
              </span>
            )}
          </div>
        </div>

        {/* Agent Status */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Agent Status
              </span>
              <span className={`text-xs font-semibold px-2 py-1 rounded ${
                agentStatus === 'working' || agentStatus === 'thinking'
                  ? 'bg-blue-500/20 text-blue-400'
                  : agentStatus === 'error'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-green-500/20 text-green-400'
              }`}>
                {agentStatus}
              </span>
            </div>
            {lastMessage && (
              <p className="mt-2 text-xs text-slate-400 truncate">
                {lastMessage}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {/* Section Label */}
          {sidebarOpen && (
            <div className="px-3 py-2 text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Main
            </div>
          )}
          
          {/* Main Nav Items */}
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`
                w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200
                ${activeItem === item.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                }
              `}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={item.icon}
                />
              </svg>
              {sidebarOpen && (
                <>
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}

          {/* Plugins Section */}
          {pluginNavItems.length > 0 && (
            <>
              {sidebarOpen && (
                <div className="px-3 py-2 mt-4 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  Plugins
                </div>
              )}
              {pluginNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200
                    ${activeItem === item.id
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }
                  `}
                >
                  <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-lg">
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 text-sm font-medium">{item.label}</span>
                    </>
                  )}
                </button>
              ))}
            </>
          )}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all duration-200"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${sidebarOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
          </button>
        </div>
      </aside>
    </ErrorBoundary>
  )
}
