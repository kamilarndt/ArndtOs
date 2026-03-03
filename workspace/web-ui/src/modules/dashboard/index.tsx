import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSystemStore } from '@/store/systemStore';
import { LayoutDashboard, Cpu, HardDrive, Clock, TrendingUp } from 'lucide-react';

// Recharts imports (will need to be installed)
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const DashboardModule = () => {
  const { metrics, metricsHistory } = useSystemStore();

  // Prepare chart data
  const chartData = metricsHistory.map((entry) => ({
    name: new Date(entry.timestamp).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    CPU: entry.cpu,
    RAM: entry.ram,
  }));

  // Format RAM value
  const formatRamValue = (value: number) => {
    return `${value.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <LayoutDashboard className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Dashboard Główny</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CPU Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
            <Cpu className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              Live telemetry
            </p>
          </CardContent>
        </Card>

        {/* RAM Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pamięć RAM</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRamValue(metrics.ram)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              Live telemetry
            </p>
          </CardContent>
        </Card>

        {/* Uptime Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}</div>
            <p className="text-xs text-muted-foreground mt-1">
              System uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Historia Zużycia Zasobów</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <p>Brak danych telemetrycznych. Czekaj na aktualizacje...</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                  }}
                  labelFormatter={(label) => `Czas: ${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="CPU"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="CPU (%)"
                />
                <Line
                  type="monotone"
                  dataKey="RAM"
                  stroke="#82ca9d"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="RAM (MB)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Quick Info */}
      <Card>
        <CardHeader>
          <CardTitle>Informacje o Systemie</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Licznik historii</p>
              <p className="text-2xl font-semibold">{metricsHistory.length} / 20</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Status agenta</p>
              <p className="text-2xl font-semibold text-green-600">Online</p>
            </div>
          </div>
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground mb-2">Ostatnia aktualizacja</p>
            <p className="text-sm font-mono">
              {metricsHistory.length > 0
                ? metricsHistory[metricsHistory.length - 1].timestamp.toLocaleString('pl-PL')
                : 'Brak danych'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
