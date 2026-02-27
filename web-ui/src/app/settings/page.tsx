'use client'

import Sidebar from '@/components/Sidebar'
import { useUIStore } from '@/store/uiStore'

export default function SettingsPage() {
  const { connectionStatus } = useUIStore()

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="space-y-6 max-w-2xl">
          {/* Connection Settings */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">Connection</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">WebSocket URL</label>
                <input 
                  type="text" 
                  defaultValue="ws://localhost:8080"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Status</label>
                <span className={`text-sm px-3 py-1 rounded ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-500/20 text-green-400'
                    : connectionStatus === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {connectionStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Appearance Settings */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">Appearance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-slate-400">Use dark theme</p>
                </div>
                <button className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
                </button>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">About</h2>
            <div className="text-sm text-slate-400 space-y-2">
              <p>ZeroClaw OS Dashboard v0.1.0</p>
              <p>A modular UI system for autonomous AI agents</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
