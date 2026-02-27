'use client'

import { useWebSocket } from '@/services/websocket'

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  useWebSocket()
  return <>{children}</>
}
