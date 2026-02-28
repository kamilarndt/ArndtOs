'use client'

import React from 'react'
import { useUIStore } from '@/store/uiStore'

interface PluginCardProps {
  id: string
  name: string
  description: string
  icon: string
  status: 'active' | 'inactive' | 'error'
  version: string
  author?: string
}

function PluginCard({ id, name, description, icon, status, version, author }: PluginCardProps) {
  const statusColors = {
    active: 'badge-success',
    inactive: 'badge-warning',
    error: 'badge-error',
  }

  return (
    <div className="card hover:scale-[1.02] transition-transform">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0 text-2xl">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base">{name}</h3>
            <span className={`badge ${statusColors[status]} text-xs`}>
              {status}
            </span>
          </div>
          {author && (
            <p className="text-xs text-slate-400">by {author}</p>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-300 mb-4 line-clamp-2">{description}</p>

      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-700/50">
        <div>
          <span className="text-xs text-slate-500 block mb-1">Version</span>
          <span className="text-xs font-mono">{version}</span>
        </div>
        <div>
          <span className="text-xs text-slate-500 block mb-1">ID</span>
          <span className="text-xs font-mono">{id}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {status === 'inactive' ? (
          <>
            <button className="flex-1 btn btn-secondary text-xs py-2.5">
              Configure
            </button>
            <button className="flex-1 btn btn-primary text-xs py-2.5">
              Activate
            </button>
          </>
        ) : status === 'active' ? (
          <>
            <button className="flex-1 btn btn-secondary text-xs py-2.5">
              Configure
            </button>
            <button className="flex-1 btn btn-secondary !border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs py-2.5">
              Deactivate
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 btn btn-secondary text-xs py-2.5">
              View Logs
            </button>
            <button className="flex-1 btn btn-primary text-xs py-2.5">
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PluginsPage() {
  const { connectionStatus } = useUIStore()

  const plugins: PluginCardProps[] = [
    {
      id: 'tldraw-canvas',
      name: 'TLDraw Canvas',
      description: 'Interactive canvas for visual workflows and diagramming with real-time collaboration.',
      icon: '📐',
      status: 'active',
      version: '1.0.0',
      author: 'ZeroClaw Team',
    },
    {
      id: 'memory-module',
      name: 'Memory Module',
      description: 'Persistent memory storage for AI agents with intelligent retrieval.',
      icon: '🧠',
      status: 'active',
      version: '0.9.2',
      author: 'ZeroClaw Team',
    },
    {
      id: 'docker-worker',
      name: 'Docker Worker',
      description: 'Execute tasks in isolated Docker containers for enhanced security.',
      icon: '🐳',
      status: 'inactive',
      version: '0.5.1',
      author: 'ZeroClaw Team',
    },
    {
      id: 'telegram-bot',
      name: 'Telegram Bot',
      description: 'Remote control and notifications via Telegram.',
      icon: '📱',
      status: 'active',
      version: '1.2.0',
      author: 'ZeroClaw Team',
    },
    {
      id: 'metrics-exporter',
      name: 'Metrics Exporter',
      description: 'Export system metrics to Prometheus for monitoring.',
      icon: '📊',
      status: 'error',
      version: '0.8.0',
      author: 'ZeroClaw Team',
    },
  ]

  const activeCount = plugins.filter((p) => p.status === 'active').length
  const errorCount = plugins.filter((p) => p.status === 'error').length

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-down">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Plugins</h1>
          <p className="text-slate-400 text-sm">
            Extend functionality with plugins
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            <span className="hidden sm:inline">Install Plugin</span>
            <span className="sm:hidden">Install</span>
          </button>
          <button className="btn btn-primary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
            <span className="sm:hidden">↻</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-scale-in">
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Total
          </p>
          <p className="text-xl font-bold">{plugins.length}</p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Active
          </p>
          <p className="text-xl font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Inactive
          </p>
          <p className="text-xl font-bold text-yellow-400">
            {plugins.filter((p) => p.status === 'inactive').length}
          </p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Errors
          </p>
          <p className="text-xl font-bold text-red-400">{errorCount}</p>
        </div>
      </div>

      {connectionStatus !== 'connected' && (
        <div className="card !border-yellow-500/30 bg-yellow-500/5 animate-scale-in">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-yellow-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="flex-1">
              <p className="font-semibold">Not Connected to Daemon</p>
              <p className="text-sm text-slate-400">
                Some plugin features may not work properly
              </p>
            </div>
            <button className="btn btn-primary text-sm py-2">Connect</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 animate-scale-in">
        <div className="flex-1">
          <input
            type="text"
            className="input"
            placeholder="Search plugins..."
          />
        </div>
        <select className="input sm:w-48">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="error">Error</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {plugins.map((plugin) => (
          <PluginCard key={plugin.id} {...plugin} />
        ))}
      </div>

      <div className="card animate-scale-in">
        <h2 className="text-lg font-semibold mb-4">Plugin Templates</h2>
        <p className="text-sm text-slate-400 mb-4">
          Quick-start templates for common plugin patterns
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button className="nav-item justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔄</span>
              <div className="text-left">
                <p className="text-sm font-medium">Task Processor</p>
                <p className="text-xs text-slate-400">
                  Background task queue
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="nav-item justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📡</span>
              <div className="text-left">
                <p className="text-sm font-medium">Webhook Handler</p>
                <p className="text-xs text-slate-400">
                  HTTP webhook receiver
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="nav-item justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">📦</span>
              <div className="text-left">
                <p className="text-sm font-medium">File Storage</p>
                <p className="text-xs text-slate-400">
                  Persistent file storage
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="nav-item justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔌</span>
              <div className="text-left">
                <p className="text-sm font-medium">Custom Integration</p>
                <p className="text-xs text-slate-400">
                  Build from scratch
                </p>
              </div>
            </div>
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button className="flex-1 btn btn-secondary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Upload Plugin
        </button>
        <button className="flex-1 btn btn-secondary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
            />
          </svg>
          Plugin Marketplace
        </button>
        <button className="flex-1 btn btn-secondary text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Documentation
        </button>
      </div>
    </div>
  )
}
