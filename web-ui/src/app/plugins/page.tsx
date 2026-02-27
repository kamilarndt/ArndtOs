'use client'

import Sidebar from '@/components/Sidebar'
import { pluginRegistry } from '@/plugins/registry'

interface Plugin {
  id: string
  name: string
  description: string
  icon: string
}

const plugins: Plugin[] = [
  {
    id: 'tldraw-canvas',
    name: 'TLDraw Canvas',
    description: 'Visual canvas for diagrams and workflows - click in sidebar to open',
    icon: '🎨',
  },
]

export default function PluginsPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Plugins</h1>
        
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 mb-6">
          <p className="text-slate-400 mb-4">
            Plugins extend the functionality of ZeroClaw OS. Click on a plugin in the sidebar to open it as a full page.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plugins.map((plugin) => (
            <div
              key={plugin.id}
              className="bg-slate-800/50 rounded-lg p-4 border border-slate-700"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{plugin.icon}</span>
                <h3 className="font-semibold">{plugin.name}</h3>
              </div>
              <p className="text-sm text-slate-400">{plugin.description}</p>
            </div>
          ))}
        </div>

        {/* Registered plugins from registry */}
        <h2 className="text-lg font-semibold mt-8 mb-4">Installed Plugins</h2>
        <div className="space-y-2">
          {pluginRegistry.getNavItems().map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50 flex items-center gap-3"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              <span className="text-xs text-slate-500 ml-auto">Registered</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
