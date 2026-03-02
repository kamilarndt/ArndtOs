import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSystemStore } from '@/store/systemStore';
import { wsClient } from '@/lib/websocket';

export const StatusModule = () => {
  const { wsStatus, systemLogs, addLog } = useSystemStore();

  const handleSendPing = () => {
    const success = wsClient.send({ type: 'ping' });
    if (success) {
      addLog('Wysłano Ping do Gateway', 'info');
    }
  };

  const getBadgeVariant = () => {
    switch (wsStatus) {
      case 'connected':
        return 'success';
      case 'connecting':
        return 'warning';
      default:
        return 'destructive';
    }
  };

  const getBadgeText = () => {
    switch (wsStatus) {
      case 'connected':
        return 'Online';
      case 'connecting':
        return 'Łączenie...';
      default:
        return 'Rozłączony';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Karta 1: Status połączenia Gateway */}
      <Card>
        <CardHeader>
          <CardTitle>Status Połączenia Gateway</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Badge
                variant={getBadgeVariant()}
                className="text-2xl px-8 py-6"
              >
                {getBadgeText()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Karta 2: Statystyki */}
      <Card>
        <CardHeader>
          <CardTitle>Statystyki Agent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Uptime</p>
              <p className="text-2xl font-semibold">0d 0h 0m</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Pamięć RAM</p>
              <p className="text-2xl font-semibold">~ 128 MB</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">CPU Usage</p>
              <p className="text-2xl font-semibold">~ 12%</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Logi</p>
              <p className="text-2xl font-semibold">{systemLogs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Karta 3: Terminal Logów */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Terminal Systemowy</CardTitle>
            <button
              onClick={handleSendPing}
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Wyślij Ping
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 w-full rounded-lg border bg-black p-4">
            <div className="font-mono space-y-1">
              {systemLogs.length === 0 ? (
                <p className="text-gray-500">Brak logów...</p>
              ) : (
                systemLogs.map((log) => {
                  const levelColor = {
                    info: 'text-gray-300',
                    success: 'text-green-400',
                    warning: 'text-yellow-400',
                    error: 'text-red-400',
                  }[log.level];

                  const timestamp = log.timestamp.toLocaleTimeString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  });

                  return (
                    <div key={log.id} className={`flex gap-2 ${levelColor}`}>
                      <span className="text-gray-500">[{timestamp}]</span>
                      <span className="font-semibold">[{log.level.toUpperCase()}]</span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
