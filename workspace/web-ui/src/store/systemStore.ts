import { create } from 'zustand';

export interface SystemLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected';

// Chat message interface
export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
}

// Metrics history entry
export interface MetricEntry {
  timestamp: Date;
  cpu: number;
  ram: number;
}

export interface SystemState {
  wsStatus: ConnectionState;
  systemLogs: SystemLog[];
  addLog: (message: string, level?: SystemLog['level']) => void;
  setWsStatus: (status: ConnectionState) => void;

  // Chat messages state
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;
  clearChatMessages: () => void;

  // Metrics state
  metrics: {
    cpu: number;
    ram: number;
    uptime: string;
  };
  metricsHistory: MetricEntry[];
  updateMetrics: (metrics: Partial<SystemState['metrics']>) => void;
}

export const useSystemStore = create<SystemState>((set) => ({
  wsStatus: 'disconnected',
  systemLogs: [],

  addLog: (message, level = 'info') => {
    const newLog: SystemLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      level,
      message,
    };
    set((state) => ({
      systemLogs: [...state.systemLogs, newLog],
    }));
  },

  setWsStatus: (status) => {
    set({ wsStatus: status });
  },

  // Chat messages
  chatMessages: [],

  addChatMessage: (message) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      ...message,
    };
    set((state) => ({
      chatMessages: [...state.chatMessages, newMessage],
    }));
  },

  clearChatMessages: () => {
    set({ chatMessages: [] });
  },

  // Metrics
  metrics: {
    cpu: 0,
    ram: 0,
    uptime: '0d 0h 0m',
  },
  metricsHistory: [],

  updateMetrics: (newMetrics) => {
    set((state) => {
      const updatedMetrics = { ...state.metrics, ...newMetrics };

      // Add to history (keep only last 20 entries)
      const newHistoryEntry: MetricEntry = {
        timestamp: new Date(),
        cpu: updatedMetrics.cpu,
        ram: updatedMetrics.ram,
      };

      const updatedHistory = [...state.metricsHistory, newHistoryEntry].slice(-20);

      return {
        metrics: updatedMetrics,
        metricsHistory: updatedHistory,
      };
    });
  },
}));