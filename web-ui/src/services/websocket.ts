'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useUIStore } from '@/store/uiStore'
import { useAgentStore } from '@/store/agentStore'
import { WebSocketMessage } from '@/types'

const WS_URL = 'ws://localhost:8080/ws'

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { setConnectionStatus } = useUIStore()
  const { setStatus, setLastMessage } = useAgentStore()

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setConnectionStatus('connecting')
    
    try {
      const ws = new WebSocket(WS_URL)
      
      ws.onopen = () => {
        console.log('[WS] Connected to daemon')
        setConnectionStatus('connected')
        setStatus('idle')
      }
      
      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          handleMessage(message)
        } catch (e) {
          console.warn('[WS] Failed to parse message:', e)
        }
      }
      
      ws.onclose = (event) => {
        console.log('[WS] Disconnected:', event.code, event.reason)
        setConnectionStatus('disconnected')
        setStatus('idle')
        
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WS] Attempting reconnection...')
          connect()
        }, 3000)
      }
      
      ws.onerror = (error) => {
        console.error('[WS] Error:', error)
        setConnectionStatus('error')
      }
      
      wsRef.current = ws
    } catch (error) {
      console.error('[WS] Connection failed:', error)
      setConnectionStatus('error')
    }
  }, [setConnectionStatus, setStatus])

  const handleMessage = useCallback((message: WebSocketMessage) => {
    switch (message.type) {
      case 'pong':
        setLastMessage('Received pong')
        break
      case 'error':
        setLastMessage(message.payload as string)
        setStatus('error')
        break
      case 'AgentStatus':
        const agentData = message.payload as { status: string; message?: string }
        setStatus(agentData.status as 'idle' | 'thinking' | 'working' | 'error')
        if (agentData.message) setLastMessage(agentData.message)
        break
      case 'TaskUpdate':
        const taskData = message.payload as { taskId: string; status: string }
        setLastMessage(`Task ${taskData.taskId}: ${taskData.status}`)
        break
      default:
        console.log('[WS] Unknown message type:', message.type)
    }
  }, [setLastMessage, setStatus])

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
      wsRef.current = null
    }
  }, [])

  // Auto-connect on mount
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return { sendMessage, connect, disconnect }
}

export function Heartbeat({ interval = 30000 }: { interval?: number }) {
  const { sendMessage } = useWebSocket()
  
  useEffect(() => {
    const id = setInterval(() => {
      sendMessage({ type: 'ping', payload: {}, timestamp: Date.now(), version: '1.0' })
    }, interval)
    return () => clearInterval(id)
  }, [sendMessage, interval])
  
  return null
}
