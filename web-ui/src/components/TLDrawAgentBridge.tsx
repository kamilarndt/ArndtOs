'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useEditor } from '@tldraw/tldraw'
import { useChatStore } from '@/store/chatStore'
import {
  CanvasAction,
  applyCanvasAction,
  exportCanvasToJSON,
} from '@/plugins/tldraw-canvas/canvasBridge'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface TLDrawAgentBridgeProps {
  onActionApplied?: (action: CanvasAction) => void
  onError?: (error: Error) => void
  enableAutoApply?: boolean
  agentActionChannel?: string
}

interface AgentCanvasAction {
  type: 'canvas_action'
  payload: CanvasAction
  timestamp?: number
}

function BridgeFallback() {
  return (
    <div className="flex items-center justify-center h-full bg-slate-900">
      <div className="text-center p-6">
        <div className="text-4xl mb-4">🔌</div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">Agent Bridge Failed</h3>
        <p className="text-slate-400">Could not connect agent actions to canvas.</p>
      </div>
    </div>
  )
}

function TLDrawAgentBridgeContent({
  onActionApplied,
  onError,
  enableAutoApply = true,
}: Omit<TLDrawAgentBridgeProps, 'agentActionChannel'>) {
  const editor = useEditor()
  const messages = useChatStore((state) => state.messages)
  const lastProcessedIndex = useRef(-1)

  const handleCanvasAction = useCallback(
    (action: CanvasAction) => {
      if (!editor) return

      try {
        applyCanvasAction(editor, action)
        onActionApplied?.(action)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
        console.error('Failed to apply canvas action:', err)
      }
    },
    [editor, onActionApplied, onError]
  )

  const exportSnapshot = useCallback(() => {
    if (!editor) {
      throw new Error('Editor not available')
    }
    return exportCanvasToJSON(editor)
  }, [editor])

  const exportSnapshotObject = useCallback(() => {
    if (!editor) {
      throw new Error('Editor not available')
    }
    return editor.getCurrentPageShapes().map((shape) => ({
      id: shape.id,
      type: shape.type,
      x: shape.x,
      y: shape.y,
      rotation: shape.rotation,
      props: shape.props,
    }))
  }, [editor])

  useEffect(() => {
    if (!enableAutoApply || !editor) return

    const latestMessages = messages.slice(lastProcessedIndex.current + 1)

    latestMessages.forEach((message) => {
      if (message.role === 'assistant' && message.content) {
        try {
          const parsedContent = JSON.parse(message.content)

          if (
            typeof parsedContent === 'object' &&
            parsedContent !== null &&
            'type' in parsedContent &&
            parsedContent.type === 'canvas_action' &&
            'payload' in parsedContent
          ) {
            const agentAction = parsedContent as AgentCanvasAction
            handleCanvasAction(agentAction.payload)
          }
        } catch {
          // Message is not JSON, skip it
        }
      }
    })

    lastProcessedIndex.current = messages.length - 1
  }, [messages, editor, enableAutoApply, handleCanvasAction])

  useEffect(() => {
    if (!editor) return

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data

        if (typeof data === 'string') {
          const parsed = JSON.parse(data)
          if (parsed.type === 'canvas_action' && parsed.payload) {
            handleCanvasAction(parsed.payload)
          }
        } else if (
          typeof data === 'object' &&
          data !== null &&
          data.type === 'canvas_action' &&
          data.payload
        ) {
          handleCanvasAction(data.payload)
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        onError?.(err)
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [editor, handleCanvasAction, onError])

  useEffect(() => {
    if (!editor) return

    const canvasSnapshotAPI = {
      exportSnapshot,
      exportSnapshotObject,
      applyAction: handleCanvasAction,
    }

    ;(globalThis as any).__tlDrawAgentBridge = canvasSnapshotAPI

    return () => {
      delete (globalThis as any).__tlDrawAgentBridge
    }
  }, [editor, exportSnapshot, exportSnapshotObject, handleCanvasAction])

  return null
}

export function TLDrawAgentBridge(props: TLDrawAgentBridgeProps) {
  return (
    <ErrorBoundary fallback={<BridgeFallback />}>
      <TLDrawAgentBridgeContent {...props} />
    </ErrorBoundary>
  )
}

export type { TLDrawAgentBridgeProps, AgentCanvasAction }
