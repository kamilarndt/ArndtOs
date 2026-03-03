import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';

interface SystemStats {
    cpu: {
        usage: number;
        cores: number;
    };
    ram: {
        used: number;
        total: number;
        percent: number;
    };
    timestamp: number;
}

class SystemTelemetryServer {
    private wss: WebSocketServer;
    private lastCpuStats: { idle: number; total: number }[] = [];
    private interval: NodeJS.Timeout | null = null;

    constructor(port: number = 3001) {
        this.wss = new WebSocketServer({ port });
        this.startTelemetry();
        console.log(`🚀 Telemetry Server running on ws://localhost:${port}`);
    }

    private async readProcStat(): Promise<{ idle: number; total: number }> {
        try {
            const exec = spawn('cat', ['/proc/stat']);
            let output = '';

            exec.stdout?.on('data', (data: Buffer) => {
                output += data.toString();
            });

            return new Promise((resolve) => {
                exec.on('close', () => {
                    const lines = output.trim().split('\n');
                    const cpuLine = lines.find(line => line.startsWith('cpu '));
                    if (!cpuLine) return resolve({ idle: 0, total: 0 });

                    const parts = cpuLine.split(/\s+/).map(Number);
                    const user = parts[1] || 0;
                    const nice = parts[2] || 0;
                    const system = parts[3] || 0;
                    const idle = parts[4] || 0;
                    const iowait = parts[5] || 0;
                    const irq = parts[6] || 0;
                    const softirq = parts[7] || 0;

                    const idleTime = idle + iowait;
                    const totalTime = user + nice + system + idle + iowait + irq + softirq;

                    resolve({ idle: idleTime, total: totalTime });
                });
            });
        } catch (error) {
            console.error('Error reading /proc/stat:', error);
            return { idle: 0, total: 0 };
        }
    }

    private async readProcMeminfo(): Promise<{ used: number; total: number; percent: number }> {
        try {
            const exec = spawn('cat', ['/proc/meminfo']);
            let output = '';

            exec.stdout?.on('data', (data: Buffer) => {
                output += data.toString();
            });

            return new Promise((resolve) => {
                exec.on('close', () => {
                    const lines = output.trim().split('\n');
                    const getKB = (name: string) => {
                        const line = lines.find(l => l.startsWith(name));
                        return line ? parseInt(line.split(/\s+/)[1]) || 0 : 0;
                    };

                    const memTotal = getKB('MemTotal:');
                    const memFree = getKB('MemFree:');
                    const memBuffers = getKB('Buffers:');
                    const memCached = getKB('Cached:');
                    const memAvailable = getKB('MemAvailable:');

                    const used = memTotal - (memAvailable || memFree + memBuffers + memCached);
                    const percent = (used / memTotal) * 100;

                    resolve({ used, total: memTotal, percent });
                });
            });
        } catch (error) {
            console.error('Error reading /proc/meminfo:', error);
            return { used: 0, total: 0, percent: 0 };
        }
    }

    private calculateCpuUsage(prev: { idle: number; total: number }, curr: { idle: number; total: number }): number {
        const totalDiff = curr.total - prev.total;
        const idleDiff = curr.idle - prev.idle;
        if (totalDiff === 0) return 0;
        return ((totalDiff - idleDiff) / totalDiff) * 100;
    }

    private startTelemetry() {
        // Odczyt liczby rdzeni
        const getCpuCores = () => {
            try {
                const exec = spawn('nproc');
                let output = '';
                exec.stdout.on('data', (data: Buffer) => { output += data.toString(); });
                return new Promise<number>((resolve) => {
                    exec.on('close', () => resolve(parseInt(output.trim()) || 1));
                });
            } catch {
                return Promise.resolve(1);
            }
        };

        getCpuCores().then(cores => {
            this.interval = setInterval(async () => {
                const cpuStats = await this.readProcStat();
                const ramStats = await this.readProcMeminfo();

                let cpuUsage = 0;
                if (this.lastCpuStats.length >= 2) {
                    const prev = this.lastCpuStats[this.lastCpuStats.length - 2];
                    cpuUsage = this.calculateCpuUsage(prev, cpuStats);
                }

                this.lastCpuStats.push(cpuStats);
                if (this.lastCpuStats.length > 10) {
                    this.lastCpuStats.shift();
                }

                const stats: SystemStats = {
                    cpu: {
                        usage: Math.round(cpuUsage * 100) / 100,
                        cores
                    },
                    ram: {
                        used: Math.round((ramStats.used / 1024 / 1024) * 100) / 100,
                        total: Math.round((ramStats.total / 1024 / 1024) * 100) / 100,
                        percent: Math.round(ramStats.percent * 100) / 100
                    },
                    timestamp: Date.now()
                };

                // Wyślij do wszystkich klientów WebSocket
                this.wss.clients.forEach(client => {
                    if (client.readyState === 1) { // OPEN
                        client.send(JSON.stringify(stats));
                    }
                });
            }, 2000); // Co 2 sekundy
        });

        this.wss.on('connection', (ws) => {
            console.log('📊 Client connected to telemetry stream');
            ws.on('close', () => console.log('📊 Client disconnected'));
        });
    }

    close() {
        if (this.interval) clearInterval(this.interval);
        this.wss.close();
    }
}

// Uruchom serwer, jeśli uruchomiony bezpośrednio
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new SystemTelemetryServer(3001);

    process.on('SIGINT', () => {
        console.log('Shutting down telemetry server...');
        server.close();
        process.exit(0);
    });
}

export type { SystemStats };
export { SystemTelemetryServer };
