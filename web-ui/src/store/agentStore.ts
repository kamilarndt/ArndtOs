import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

interface AgentState {
  agentId: string | null
  status: 'idle' | 'thinking' | 'working' | 'error'
  lastMessage: string | null
  setAgentId: (id: string) => void
  setStatus: (status: AgentState['status']) => void
  setLastMessage: (msg: string) => void
}

export const useAgentStore = create<AgentState>()(
  devtools(
    persist(
      (set) => ({
        agentId: null,
        status: 'idle',
        lastMessage: null,
        setAgentId: (id) => set({ agentId: id }),
        setStatus: (status) => set({ status }),
        setLastMessage: (msg) => set({ lastMessage: msg }),
      }),
      { name: 'zeroclaw-agent' }
    ),
    { name: 'ZeroClawAgentStore' }
  )
)
