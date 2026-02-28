'use client'

import React, { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'
import MobileNavigation from './components/MobileNavigation'
import DesktopSidebar from './components/DesktopSidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { connectionStatus } = useUIStore()
  const { connectionStatus } = useUIStore()
  const { status: agentStatus } = useAgentStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="flex flex-col min-h-screen md:flex-row safe-area-top">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Header - Visible only on mobile */}
      <header className="sticky top-0 z-40 md:hidden glass border-b border-slate-700/50 safe-area-top">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="btn btn-icon btn-ghost no-tap-highlight"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">ZC</span>
            </div>
            <span className="font-semibold text-sm">ZeroClaw OS</span>
          </div>

          <div className="w-9">
            {/* Spacer for balance */}
            <div className={`status-dot status-dot-${connectionStatus}`} />
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 glass border-r border-slate-700/50 md:hidden animate-slide-down">
            <MobileMenu onClose={() => setMobileMenuOpen(false)} />
          </div>
        </>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto md:overflow-hidden">
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Visible only on mobile */}
      <MobileNavigation />
    </div>
  )
}

// Mobile Menu Component
function MobileMenu({ onClose }: { onClose: () => void }) {
  const router = usePathname()
  const { connectionStatus } = useUIStore()
  const { status: agentStatus, lastMessage, agentId } = useAgentStore()

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/' },
    { id: 'agents', label: 'Agents', href: '/agents' },
    { id: 'plugins', label: 'Plugins', href: '/plugins' },
    { id: 'settings', label: 'Settings', href: '/settings' },
  ]

  const handleNavClick = (href: string) => {
    router.push(href)
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">ZC</span>
          </div>
          <span className="font-bold text-lg">ZeroClaw OS</span>
        </div>
        <button
          onClick={onClose}
          className="btn btn-icon btn-ghost"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Connection Status */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className={`status-dot status-dot-${connectionStatus}`} />
          <div>
            <p className="text-sm font-medium capitalize">{connectionStatus}</p>
            {connectionStatus === 'connected' && (
              <p className="text-xs text-slate-400">Daemon active</p>
            )}
          </div>
        </div>
      </div>

      {/* Agent Status */}
      {agentId && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
              Agent Status
            </span>
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              agentStatus === 'working' || agentStatus === 'thinking'
                ? 'badge badge-info'
                : agentStatus === 'error'
                ? 'badge badge-error'
                : 'badge badge-success'
            }`}>
              {agentStatus}
            </span>
          </div>
          {lastMessage && (
            <p className="text-xs text-slate-400 truncate">
              {lastMessage}
            </p>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <div className="px-2 py-2 text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
          Menu
        </div>
        
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.href)}
            className={`w-full nav-item mb-1 no-tap-highlight ${
              router === item.href ? 'nav-item-active' : ''
            }`}
          >
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {item.id === 'dashboard' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              )}
              {item.id === 'agents' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              )}
              {item.id === 'plugins' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              )}
              {item.id === 'settings' && (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              )}
            </svg>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <div className="px-2 py-2 text-xs text-slate-500 uppercase tracking-wider font-semibold mt-6 mb-2">
          Quick Actions
        </div>

        <button className="w-full nav-item mb-1 no-tap-highlight">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-sm font-medium">New Task</span>
        </button>

        <button className="w-full nav-item mb-1 no-tap-highlight">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm font-medium">View Logs</span>
        </button>
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="text-xs text-slate-500">
          <p>ZeroClaw OS v0.1.0</p>
          <p className="mt-1">© 2024</p>
        </div>
      </div>
    </div>
  )
}
