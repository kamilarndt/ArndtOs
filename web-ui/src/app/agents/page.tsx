'use client'

import React from 'react'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'thinking' | 'working' | 'error'
  type: string
  lastTask?: string
  uptime: string
  tasksCompleted: number
  tasksFailed: number
}

interface AgentCardProps {
  agent: Agent
}

function AgentCard({ agent }: AgentCardProps) {
  const statusColors = {
    idle: 'badge-success',
    thinking: 'badge-info',
    working: 'badge-info',
    error: 'badge-error',
  }

  const statusIcons = {
    idle: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    thinking: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    working: (
      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
    error: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
  }

  return (
    <div className="card hover:scale-[1.02] transition-transform">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-base">{agent.name}</h3>
            <p className="text-xs text-slate-400 font-mono">{agent.id}</p>
          </div>
        </div>
        <span className={`badge ${statusColors[agent.status]} flex items-center gap-1.5`}>
          {statusIcons[agent.status]}
          <span className="capitalize">{agent.status}</span>
        </span>
      </div>

      {/* Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
          <span className="text-xs text-slate-400">Type</span>
          <span className="text-xs font-medium">{agent.type}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
          <span className="text-xs text-slate-400">Uptime</span>
          <span className="text-xs font-medium">{agent.uptime}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-2 border-b border-slate-700/50">
          <div>
            <span className="text-xs text-slate-400 block">Completed</span>
            <span className="text-sm font-semibold text-green-400">{agent.tasksCompleted}</span>
          </div>
          <div>
            <span className="text-xs text-slate-400 block">Failed</span>
            <span className="text-sm font-semibold text-red-400">{agent.tasksFailed}</span>
          </div>
        </div>

        {agent.lastTask && (
          <div className="pt-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">
              Last Task
            </p>
            <p className="text-xs text-slate-300 truncate">{agent.lastTask}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button className="flex-1 btn btn-secondary text-xs py-2.5">
          View Details
        </button>
        <button className="flex-1 btn btn-primary text-xs py-2.5">
          Assign Task
        </button>
      </div>
    </div>
  )
}

export default function AgentsPage() {
  const { connectionStatus } = useUIStore()
  const { status: agentStatus, lastMessage, agentId } = useAgentStore()

  // Demo agents data
  const demoAgents: Agent[] = agentId
    ? [
        {
          id: agentId,
          name: 'Primary Agent',
          status: agentStatus,
          type: 'ZeroClaw Agent',
          lastTask: lastMessage || undefined,
          uptime: '2h 34m',
          tasksCompleted: 24,
          tasksFailed: 1,
        },
        {
          id: 'agent-2',
          name: 'Backup Agent',
          status: 'idle',
          type: 'ZeroClaw Agent',
          uptime: '1h 12m',
          tasksCompleted: 12,
          tasksFailed: 0,
        },
      ]
    : []

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-slide-down">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Agents</h1>
          <p className="text-slate-400 text-sm">
            Manage and monitor your AI agents
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connectionStatus === 'connected' ? (
            <span className="badge badge-success">Daemon Connected</span>
          ) : (
            <span className="badge badge-warning">Daemon Disconnected</span>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-scale-in">
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Total
          </p>
          <p className="text-xl font-bold">{demoAgents.length}</p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Active
          </p>
          <p className="text-xl font-bold text-green-400">
            {demoAgents.filter((a) => a.status === 'working' || a.status === 'thinking').length}
          </p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Idle
          </p>
          <p className="text-xl font-bold text-blue-400">
            {demoAgents.filter((a) => a.status === 'idle').length}
          </p>
        </div>
        <div className="card !p-3">
          <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
            Error
          </p>
          <p className="text-xl font-bold text-red-400">
            {demoAgents.filter((a) => a.status === 'error').length}
          </p>
        </div>
      </div>

      {/* Main Content */}
      {connectionStatus !== 'connected' ? (
        <div className="card animate-scale-in">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-600"
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
            <h3 className="text-lg font-semibold mb-2">Not Connected to Daemon</h3>
            <p className="text-slate-400 text-sm mb-4">
              Start the ZeroClaw daemon to view and manage agents
            </p>
            <button className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Reconnect
            </button>
          </div>
        </div>
      ) : demoAgents.length === 0 ? (
        <div className="card animate-scale-in">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-semibold mb-2">No Active Agents</h3>
            <p className="text-slate-400 text-sm mb-4">
              Agents will appear here when they connect to the daemon
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {demoAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Agent Details from Store */}
      {connectionStatus === 'connected' && (
        <div className="card animate-scale-in">
          <h2 className="text-lg font-semibold mb-4">Local Agent State</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 border-b border-slate-700/50">
              <span className="text-sm text-slate-400">Status</span>
              <span className="text-sm font-semibold capitalize">{agentStatus}</span>
            </div>
            {lastMessage && (
              <div className="py-2">
                <span className="text-sm text-slate-400 block mb-1">Last Message</span>
                <p className="text-sm">{lastMessage}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
