'use client'

import React from 'react'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  color?: 'blue' | 'purple' | 'green' | 'yellow' | 'red'
}

function StatCard({ label, value, icon, trend, color = 'blue' }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
  }

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]} animate-scale-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            {label}
          </p>
          <p className="text-2xl md:text-3xl font-bold mb-2">{value}</p>
          {trend && (
            <div className="flex items-center gap-1">
              <svg
                className={`w-4 h-4 ${
                  trend.positive ? 'text-green-400' : 'text-red-400'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={trend.positive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                />
              </svg>
              <span
                className={`text-xs font-medium ${
                  trend.positive ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {trend.value}
              </span>
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-slate-900/50">
          <div className="w-6 h-6 text-slate-300">{icon}</div>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { connectionStatus } = useUIStore()
  const { status: agentStatus, lastMessage, agentId } = useAgentStore()

  const statusColors = {
    connecting: 'status-dot-connecting',
    connected: 'status-dot-connected',
    disconnected: 'status-dot-disconnected',
    error: 'status-dot-error',
  }

  const agentStatusColors = {
    idle: 'text-green-400',
    thinking: 'text-blue-400',
    working: 'text-purple-400',
    error: 'text-red-400',
  }

  const connectionStatusMessage = {
    connecting: 'Attempting to connect...',
    connected: 'Connected to ZeroClaw Daemon',
    disconnected: 'Not connected to daemon',
    error: 'Connection error occurred',
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="animate-slide-down">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400 text-sm">Monitor your AI agents and system status</p>
      </div>

      {/* Connection Status Banner */}
      <div
        className={`card animate-slide-down ${
          connectionStatus === 'connected'
            ? 'border-green-500/30 bg-green-500/5'
            : connectionStatus === 'error'
            ? 'border-red-500/30 bg-red-500/5'
            : 'border-yellow-500/30 bg-yellow-500/5'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`status-dot ${statusColors[connectionStatus]}`} />
          <div className="flex-1">
            <p className="font-semibold capitalize">{connectionStatus}</p>
            <p className="text-xs text-slate-400">
              {connectionStatusMessage[connectionStatus]}
            </p>
          </div>
          {connectionStatus === 'disconnected' && (
            <button className="btn btn-primary text-sm">
              Reconnect
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Agent Status"
          value={agentStatus}
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          }
          color="blue"
        />
        <StatCard
          label="Active Connections"
          value="1"
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          }
          color="green"
          trend={{ value: 'Active', positive: true }}
        />
        <StatCard
          label="Tasks Completed"
          value="24"
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="purple"
          trend={{ value: '+12%', positive: true }}
        />
        <StatCard
          label="Uptime"
          value="99.9%"
          icon={
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Info Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Agent Information</h2>
              {agentId && connectionStatus === 'connected' && (
                <span className="badge badge-success">Active</span>
              )}
            </div>

            {agentId ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-sm text-slate-400">Agent ID</span>
                  <span className="text-sm font-mono">{agentId}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-sm text-slate-400">Status</span>
                  <span className={`text-sm font-semibold ${agentStatusColors[agentStatus]}`}>
                    {agentStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
                  <span className="text-sm text-slate-400">Type</span>
                  <span className="text-sm">ZeroClaw Agent</span>
                </div>
                {lastMessage && (
                  <div className="pt-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-2">
                      Last Activity
                    </p>
                    <p className="text-sm text-slate-300 truncate">{lastMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg
                  className="w-12 h-12 mx-auto mb-3 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <p className="text-slate-400">No agent connected</p>
                <p className="text-xs text-slate-500 mt-1">Connect to daemon to see agent details</p>
              </div>
            )}
          </div>

          {/* System Health Card */}
          <div className="card animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">System Health</h2>
              <span className="badge badge-success">Good</span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Memory Usage</span>
                  <span className="text-sm font-semibold">45%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">CPU Usage</span>
                  <span className="text-sm font-semibold">28%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Disk Usage</span>
                  <span className="text-sm font-semibold">62%</span>
                </div>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="space-y-4">
          <div className="card animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>

            <div className="space-y-2">
              <button
                onClick={() => (window.location.href = '/agents')}
                className="w-full nav-item justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Manage Agents</span>
                </div>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => (window.location.href = '/plugins')}
                className="w-full nav-item justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span className="text-sm font-medium">Open Plugins</span>
                </div>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={() => (window.location.href = '/settings')}
                className="w-full nav-item justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                  </svg>
                  <span className="text-sm font-medium">Settings</span>
                </div>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="card animate-scale-in">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>

            <div className="space-y-3">
              <div className="flex items-start gap-3 pb-3 border-b border-slate-700/50">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Agent completed task</p>
                  <p className="text-xs text-slate-400">2 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3 pb-3 border-b border-slate-700/50">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">New connection established</p>
                  <p className="text-xs text-slate-400">15 minutes ago</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Plugin system updated</p>
                  <p className="text-xs text-slate-400">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
