import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'
import { ConnectionStatus } from '@/types'

interface UIState {
  sidebarOpen: boolean
  connectionStatus: ConnectionStatus
  theme: 'dark' | 'light'
  toggleSidebar: () => void
  setConnectionStatus: (status: ConnectionStatus) => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set) => ({
        sidebarOpen: true,
        connectionStatus: 'disconnected',
        theme: 'dark',
        toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
        setConnectionStatus: (status) => set({ connectionStatus: status }),
        setTheme: (theme) => set({ theme }),
      }),
      { name: 'zeroclaw-ui' }
    ),
    { name: 'ZeroClawUIStore' }
  )
)
