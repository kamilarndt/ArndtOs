'use client'

import React from 'react'
import { useUIStore } from '@/store/uiStore'

interface SettingSectionProps {
  title: string
  description?: string
  children: React.ReactNode
}

function SettingSection({ title, description, children }: SettingSectionProps) {
  return (
    <div className="card">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        {description && <p className="text-sm text-slate-400">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  )
}

interface SettingRowProps {
  label: string
  description?: string
  children: React.ReactNode
}

function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3 border-b border-slate-700/50 last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        checked ? 'bg-blue-600' : 'bg-slate-600'
      }`}
      aria-pressed={checked}
      role="switch"
      aria-label={label}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default function SettingsPage() {
  const { connectionStatus, theme, setTheme } = useUIStore()
  const [darkMode, setDarkMode] = React.useState(true)
  const [notifications, setNotifications] = React.useState(true)
  const [soundEffects, setSoundEffects] = React.useState(false)
  const [autoReconnect, setAutoReconnect] = React.useState(true)
  const [websocketUrl, setWebsocketUrl] = React.useState('ws://localhost:8080')

  const handleThemeChange = (value: 'dark' | 'light') => {
    setTheme(value)
    setDarkMode(value === 'dark')
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="animate-slide-down">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Settings</h1>
        <p className="text-slate-400 text-sm">Customize your ZeroClaw OS experience</p>
      </div>

      {/* Connection Settings */}
      <SettingSection
        title="Connection"
        description="Configure your connection to the ZeroClaw daemon"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">WebSocket URL</label>
            <input
              type="text"
              value={websocketUrl}
              onChange={(e) => setWebsocketUrl(e.target.value)}
              className="input"
              placeholder="ws://localhost:8080"
            />
          </div>

          <SettingRow
            label="Connection Status"
            description="Current connection state"
          >
            <div className="flex items-center gap-2">
              <div
                className={`status-dot ${
                  connectionStatus === 'connected'
                    ? 'status-dot-connected'
                    : connectionStatus === 'error'
                    ? 'status-dot-error'
                    : connectionStatus === 'connecting'
                    ? 'status-dot-connecting'
                    : 'status-dot-disconnected'
                }`}
              />
              <span
                className={`text-xs font-semibold px-2 py-1 rounded ${
                  connectionStatus === 'connected'
                    ? 'badge badge-success'
                    : connectionStatus === 'error'
                    ? 'badge badge-error'
                    : 'badge badge-warning'
                }`}
              >
                {connectionStatus}
              </span>
            </div>
          </SettingRow>

          <SettingRow
            label="Auto-Reconnect"
            description="Automatically reconnect when connection is lost"
          >
            <Toggle
              checked={autoReconnect}
              onChange={setAutoReconnect}
              label="Auto-Reconnect"
            />
          </SettingRow>
        </div>
      </SettingSection>

      {/* Appearance Settings */}
      <SettingSection
        title="Appearance"
        description="Customize the look and feel of the dashboard"
      >
        <div className="space-y-4">
          <SettingRow label="Dark Mode" description="Use dark theme">
            <Toggle
              checked={darkMode}
              onChange={(checked) => handleThemeChange(checked ? 'dark' : 'light')}
              label="Dark Mode"
            />
          </SettingRow>

          <div>
            <label className="block text-sm text-slate-400 mb-2">Theme Color</label>
            <div className="flex gap-3 flex-wrap">
              <button
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                aria-label="Blue-Purple theme"
              />
              <button
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-teal-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-green-500/50"
                aria-label="Green-Teal theme"
              />
              <button
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                aria-label="Orange-Red theme"
              />
              <button
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                aria-label="Pink-Rose theme"
              />
            </div>
          </div>
        </div>
      </SettingSection>

      {/* Notifications Settings */}
      <SettingSection
        title="Notifications"
        description="Configure how you receive notifications"
      >
        <SettingRow
          label="Push Notifications"
          description="Receive browser push notifications"
        >
          <Toggle
            checked={notifications}
            onChange={setNotifications}
            label="Push Notifications"
          />
        </SettingRow>

        <SettingRow
          label="Sound Effects"
          description="Play sounds for important events"
        >
          <Toggle
            checked={soundEffects}
            onChange={setSoundEffects}
            label="Sound Effects"
          />
        </SettingRow>
      </SettingSection>

      {/* Data & Privacy */}
      <SettingSection
        title="Data & Privacy"
        description="Manage your data and privacy settings"
      >
        <div className="space-y-3">
          <button className="w-full btn btn-secondary justify-between group">
            <span>Clear Cache</span>
            <svg
              className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button className="w-full btn btn-secondary justify-between group">
            <span>Export Data</span>
            <svg
              className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <button className="w-full btn btn-secondary justify-between group !border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50">
            <span>Reset All Settings</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </SettingSection>

      {/* About */}
      <SettingSection title="About">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <span className="text-sm text-slate-400">Version</span>
            <span className="text-sm font-semibold">0.1.0</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
            <span className="text-sm text-slate-400">Build</span>
            <span className="text-sm font-mono">2024.02.28</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-slate-400">License</span>
            <span className="text-sm">MIT</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 mb-2">
            ZeroClaw OS - A modular UI system for autonomous AI agents
          </p>
          <div className="flex gap-3">
            <a href="#" className="text-xs text-blue-400 hover:underline">
              Documentation
            </a>
            <a href="#" className="text-xs text-blue-400 hover:underline">
              GitHub
            </a>
            <a href="#" className="text-xs text-blue-400 hover:underline">
              Support
            </a>
          </div>
        </div>
      </SettingSection>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          Save Changes
        </button>
        <button className="flex-1 btn btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  )
}
