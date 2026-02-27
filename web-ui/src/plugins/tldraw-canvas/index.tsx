'use client'
import React from 'react'
import { Tldraw } from '@tldraw/tldraw'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function TldrawCanvas() {
  return (
    <ErrorBoundary>
      <div className="absolute inset-0">
        <Tldraw />
      </div>
    </ErrorBoundary>
  )
}

export const manifest = {
  name: 'tldraw-canvas',
  displayName: 'Canvas',
  icon: '🎨',
}
