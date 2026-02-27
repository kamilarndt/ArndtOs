'use client'

import Sidebar from '@/components/Sidebar'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'

interface Agent {
  id: string
  name: string
  status: 'idle' | 'thinking' | 'working' | 'error'
  lastTask?: string
}

export default function AgentsPage() {
  const { connectionStatus } = useUIStore()
  const { status: agentStatus, lastMessage, agentId } = useAgentStore()

  // Demo agents for display when connected
  const demoAgents: Agent[] = agentId ? [{
    id: agentId,
    name: 'Primary Agent',
    status: agentStatus,
    lastTask: lastMessage || undefined
  }] : []

  const statusColors = {
    idle: 'bg-green-500/20 text-green-400 border-green-500/30',
    thinking: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    working: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Agents</h1>
          <span className={`px-3 py-1 rounded-full text-sm ${
            connectionStatus === 'connected' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {connectionStatus === 'connected' ? 'Daemon Connected' : 'Daemon Disconnected'}
          </span>
        </div>

        {connectionStatus !== 'connected' ? (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400 mb-4">No connection to daemon. Start the ZeroClaw daemon to see agents.</p>
            <p className="text-sm text-slate-500">Run: <code className="bg-slate-900 px-2 py-1 rounded">cargo run</code> in the daemon directory</p>
          </div>
        ) : demoAgents.length === 0 ? (
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <p className="text-slate-400">No active agents. Agents will appear here when they connect to the daemon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {demoAgents.map((agent) => (
              <div 
                key={agent.id}
                className={`bg-slate-800/50 rounded-lg p-6 border ${statusColors[agent.status]}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{agent.name}</h3>
                  <span className="px-3 py-1 rounded-full text-sm capitalize bg-slate-900/50">
                    {agent.status}
                  </span>
                </div>
                <p className="text-sm text-slate-400">ID: {agent.id}</p>
                {agent.lastTask && (
                  <p className="text-sm text-slate-500 mt-2">Last task: {agent.lastTask}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Agent Status from Store */}
        <div className="mt-6 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Local Agent State
          </h3>
          <p className="text-sm">
            Status: <span className="capitalize">{agentStatus}</span>
          </p>
          {lastMessage && (
            <p className="text-sm text-slate-400 mt-1">Last message: {lastMessage}</p>
          )}
        </div>
      </main>
    </div>
  )
}
