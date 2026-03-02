import { useSystemStore } from '../store/systemStore';

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

/**
 * WebSocket Client Singleton
 * Manages connection to ZeroClaw Gateway with auto-reconnect
 */
class WebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 3000; // 3 seconds
  private reconnectBackoffMultiplier = 1.5;

  // Gateway configuration
  private readonly WS_URL = 'ws://127.0.0.1:42617/ws/chat';
  private readonly WS_PROTOCOLS = ['Bearer', 'AG-SECURE-TOKEN-9921'];

  /**
   * Initialize WebSocket connection
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Already connected');
      return;
    }

    const { setWsStatus, addLog } = useSystemStore.getState();

    setWsStatus('connecting');
    addLog('Nawiązywanie połączenia z ZeroClaw Gateway...', 'info');

    try {
      // Connect with Bearer token sub-protocol for authentication
      this.ws = new WebSocket(this.WS_URL, this.WS_PROTOCOLS);

      this.setupEventHandlers();
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      setWsStatus('disconnected');
      addLog(`Błąd połączenia: ${error}`, 'error');
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(): void {
    if (!this.ws) return;

    const { setWsStatus, addLog, addChatMessage } = useSystemStore.getState();

    // Connection opened
    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      setWsStatus('connected');
      addLog('Nawiązano bezpieczne połączenie z ZeroClaw Core', 'success');

      // Reset reconnect attempts on successful connection
      this.reconnectAttempts = 0;
      this.reconnectTimer = null;
    };

    // Message received
    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Received:', data);
        this.handleMessage(data);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
        addLog(`Błąd parsowania wiadomości: ${error}`, 'error');
      }
    };

    // Connection closed
    this.ws.onclose = (event) => {
      console.log('[WebSocket] Closed:', event.code, event.reason);
      setWsStatus('disconnected');

      const message = event.wasClean
        ? `Połączenie zamknięte (code: ${event.code})`
        : 'Połączenie utracone - rozłączono';
      addLog(message, 'warning');

      this.scheduleReconnect();
    };

    // Connection error
    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      setWsStatus('disconnected');
      addLog('Błąd połączenia WebSocket', 'error');
    };
  }

  /**
   * Handle incoming messages from Gateway
   */
  private handleMessage(data: any): void {
    const { addLog, addChatMessage, updateMetrics } = useSystemStore.getState();

    switch (data.type) {
      case 'pong':
        addLog('Otrzymano Pong od Gateway', 'info');
        break;
      case 'chat_response':
        // Handle chat response from agent
        if (data.text) {
          addChatMessage({
            sender: 'agent',
            text: data.text,
            timestamp: new Date(),
          });
        }
        addLog(`Odpowiedź agenta: ${data.text?.substring(0, 50)}...`, 'info');
        break;
      case 'status_update':
        addLog(`Aktualizacja statusu: ${data.status}`, 'info');
        break;
      case 'metrics_update':
        // Update metrics from agent
        if (data.metrics) {
          updateMetrics({
            cpu: data.metrics.cpu || 0,
            ram: data.metrics.ram || 0,
            uptime: data.metrics.uptime || '0d 0h 0m',
          });
        }
        break;
      case 'error':
        addLog(`Błąd z Gateway: ${data.message}`, 'error');
        break;
      default:
        addLog(`Otrzymano: ${JSON.stringify(data)}`, 'info');
    }
  }

  /**
   * Send data to Gateway
   */
  send(data: any): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Cannot send - not connected');
      const { addLog } = useSystemStore.getState();
      addLog('Nie można wysłać - brak połączenia', 'error');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(data));
      console.log('[WebSocket] Sent:', data);
      return true;
    } catch (error) {
      console.error('[WebSocket] Send error:', error);
      const { addLog } = useSystemStore.getState();
      addLog(`Błąd wysyłania: ${error}`, 'error');
      return false;
    }
  }

  /**
   * Schedule automatic reconnection
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WebSocket] Max reconnect attempts reached');
      const { addLog } = useSystemStore.getState();
      addLog('Przekroczono maksymalną liczbę prób połączenia', 'error');
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Calculate backoff delay
    const delay = this.reconnectDelay * Math.pow(this.reconnectBackoffMultiplier, this.reconnectAttempts);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`[WebSocket] Reconnecting (attempt ${this.reconnectAttempts})...`);
      this.connect();
    }, delay);
  }

  /**
   * Manual disconnect
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.reconnectAttempts = this.maxReconnectAttempts; // Prevent auto-reconnect
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    if (!this.ws) return 'disconnected';

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'connecting';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'disconnected';
    }
  }
}

// Export singleton instance
export const wsClient = new WebSocketClient();