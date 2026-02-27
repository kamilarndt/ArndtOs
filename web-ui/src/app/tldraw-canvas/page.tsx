'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import Sidebar from '@/components/Sidebar'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// Dynamic import for TLDraw to avoid SSR issues
const TldrawCanvas = dynamic(
  () => import('@/plugins/tldraw-canvas'),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="text-slate-400">Loading canvas...</div>
      </div>
    )
  }
)

function PluginError() {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center p-6">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">Plugin Failed to Load</h3>
        <p className="text-slate-400">There was an error loading this plugin.</p>
      </div>
    </div>
  )
}

export default function TldrawCanvasPage() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <ErrorBoundary fallback={<PluginError />}>
          <TldrawCanvas />
        </ErrorBoundary>
      </main>
    </div>
  )
}
