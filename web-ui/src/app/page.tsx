'use client'

import Sidebar from '@/components/Sidebar'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'

export default function DashboardPage() {
  const { connectionStatus } = useUIStore()
  const { status: agentStatus, lastMessage, agentId } = useAgentStore()

  const statusColors = {
    connecting: 'bg-yellow-500',
    connected: 'bg-green-500',
    disconnected: 'bg-gray-500',
    error: 'bg-red-500',
  }

  const agentStatusColors = {
    idle: 'text-green-400',
    thinking: 'text-blue-400',
    working: 'text-purple-400',
    error: 'text-red-400',
  }

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        
        {/* Connection Status Card */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusColors[connectionStatus]} ${connectionStatus === 'connecting' ? 'animate-pulse' : ''}`} />
            <span className="text-lg capitalize">{connectionStatus}</span>
          </div>
          <p className="text-sm text-slate-400 mt-2">
            {connectionStatus === 'connected' 
              ? 'Connected to ZeroClaw Daemon' 
              : connectionStatus === 'connecting'
              ? 'Attempting to connect...'
              : 'Not connected. Start the daemon to connect.'}
          </p>
        </div>

        {/* Agent Status Card */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <h2 className="text-lg font-semibold mb-4">Agent Status</h2>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-lg font-semibold ${agentStatusColors[agentStatus]}`}>
              {agentStatus}
            </span>
            {agentId && (
              <span className="text-sm text-slate-400">
                (ID: {agentId})
              </span>
            )}
          </div>
          {lastMessage && (
            <p className="text-sm text-slate-400">
              Last message: {lastMessage}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
              onClick={() => window.location.href = '/agents'}
            >
              <h3 className="font-semibold mb-1">View Agents</h3>
              <p className="text-sm text-slate-400">Manage active agents</p>
            </button>
            <button 
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
              onClick={() => window.location.href = '/plugins'}
            >
              <h3 className="font-semibold mb-1">Open Plugins</h3>
              <p className="text-sm text-slate-400">Access TLDraw canvas</p>
            </button>
            <button 
              className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors text-left"
              onClick={() => window.location.href = '/settings'}
            >
              <h3 className="font-semibold mb-1">Settings</h3>
              <p className="text-sm text-slate-400">Configure connection</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
