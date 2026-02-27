export interface WebSocketMessage<T = unknown> {
  type: string
  payload: T
  timestamp: number
  version: string
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

export interface PingMessage { type: 'ping'; timestamp: number }
export interface PongMessage { type: 'pong'; timestamp: number }
export interface ErrorMessage { type: 'error'; message: string }

export type DaemonMessage = PingMessage | PongMessage | ErrorMessage
