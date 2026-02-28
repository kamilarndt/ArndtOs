import { create } from 'zustand'
import { persist, devtools } from 'zustand/middleware'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  metadata?: {
    canvas?: string
    [key: string]: any
  }
}

interface ChatState {
  isOpen: boolean
  selectedModel: string
  assignedAgent: string | null
  messages: ChatMessage[]
  toggleChat: () => void
  openChat: () => void
  closeChat: () => void
  setSelectedModel: (model: string) => void
  setAssignedAgent: (agent: string | null) => void
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  updateLastMessage: (content: string) => void
}

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set) => ({
        isOpen: false,
        selectedModel: 'gpt-4',
        assignedAgent: null,
        messages: [],
        toggleChat: () => set((state) => ({ isOpen: !state.isOpen })),
        openChat: () => set({ isOpen: true }),
        closeChat: () => set({ isOpen: false }),
        setSelectedModel: (model) => set({ selectedModel: model }),
        setAssignedAgent: (agent) => set({ assignedAgent: agent }),
        addMessage: (message) =>
          set((state) => ({
            messages: [
              ...state.messages,
              {
                ...message,
                id: crypto.randomUUID(),
                timestamp: Date.now(),
              },
            ],
          })),
        clearMessages: () => set({ messages: [] }),
        updateLastMessage: (content) =>
          set((state) => ({
            messages: state.messages.map((msg, idx) =>
              idx === state.messages.length - 1 ? { ...msg, content } : msg
            ),
          })),
      }),
      { name: 'zeroclaw-chat' }
    ),
    { name: 'ZeroClawChatStore' }
  )
)
