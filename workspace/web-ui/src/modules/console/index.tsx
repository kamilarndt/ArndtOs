import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSystemStore } from '@/store/systemStore';
import { wsClient } from '@/lib/websocket';
import { Send, Bot, User } from 'lucide-react';

export const ConsoleModule = () => {
  const { chatMessages, addChatMessage } = useSystemStore();
  const [inputValue, setInputValue] = React.useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message to store
    addChatMessage({
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    });

    // Send message via WebSocket
    const success = wsClient.send({
      type: 'chat',
      text: inputValue,
    });

    if (!success) {
      addChatMessage({
        sender: 'agent',
        text: 'Nie można wysłać wiadomości - brak połączenia z Gateway',
        timestamp: new Date(),
      });
    }

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col p-6">
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle>Konsola Agenta</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4">
          {/* Chat messages area */}
          <ScrollArea className="flex-1 rounded-lg border bg-slate-50 dark:bg-slate-900 p-4">
            <div ref={scrollRef} className="space-y-4">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <p>Brak wiadomości. Napisz coś, aby rozpocząć rozmowę!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  const timestamp = msg.timestamp.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      {/* Avatar icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isUser ? 'bg-green-600' : 'bg-slate-700'
                        }`}
                      >
                        {isUser ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>

                      {/* Message bubble */}
                      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isUser
                              ? 'bg-green-600 text-white'
                              : 'bg-slate-700 text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{msg.text}</p>
                        </div>
                        <span className="text-xs text-muted-foreground mt-1">
                          {timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {/* Input area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Wpisz wiadomość..."
              className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Wyślij
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
