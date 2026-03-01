import WebSocket from 'ws';
import { WorkspaceSandbox } from './sandbox';
import { IPCInboundFrame, IPCOutboundFrame } from './ipc';

export class GatewayClient {
    private endpoint: string;
    private pairingCode: string;
    private ws: WebSocket | null = null;
    private sandbox: WorkspaceSandbox;

    // We could inject actual tools here to dispatch
    // private tools: Tool[];

    constructor(endpoint: string, pairingCode: string, sandbox: WorkspaceSandbox) {
        this.endpoint = endpoint;
        this.pairingCode = pairingCode;
        this.sandbox = sandbox;
    }

    public connect() {
        console.log(`[Gateway]: Connecting to ${this.endpoint}...`);
        this.ws = new WebSocket(this.endpoint, {
            headers: {
                'Authorization': `Bearer ${this.pairingCode}` // Or 'X-Pairing-Code' depending on ZeroClaw's impl
            }
        });

        this.ws.on('open', () => {
            console.log(`[Gateway]: 🟢 Connected to ZeroClaw Core!`);
        });

        this.ws.on('message', (data) => this.handleMessage(data.toString()));

        this.ws.on('close', () => {
            console.log(`[Gateway]: 🔴 Connection closed. Reconnecting in 5s...`);
            setTimeout(() => this.connect(), 5000);
        });

        this.ws.on('error', (err) => {
            console.error(`[Gateway Error]: ${err.message}`);
        });
    }

    private async handleMessage(raw: string) {
        try {
            const frame: IPCInboundFrame = JSON.parse(raw);

            // 1. Heartbeat
            if (frame.type === 'ping') {
                this.send({ source: 'antigravity', type: 'pong' });
                return;
            }

            // 2. Command Dispatching
            if (frame.type === 'command' && frame.action === 'execute_task' && frame.payload) {
                console.log(`[Gateway]: Received Task ${frame.id} -> Tool: ${frame.payload.tool}`);

                // Validate paths using our Defense-in-Depth Sandbox
                if (frame.payload.target_path) {
                    try {
                        const safePath = this.sandbox.getSafePath(frame.payload.target_path);
                        console.log(`[Sandbox]: Path Normalized securely -> ${safePath}`);
                        // Here we would execute the tool passing the `safePath` instead of raw input.
                        // Example:
                        // const result = await this.tools.find(t => t.name === frame.payload.tool).execute({ ...frame.payload.parameters, path: safePath });

                        this.send({
                            id: frame.id,
                            source: 'antigravity',
                            type: 'response',
                            payload: { status: 'success', detail: `Simulated execution on ${safePath}` }
                        });

                    } catch (secErr: any) {
                        console.error(`[Sandbox Alert]: Blocked malicious path traversal: ${secErr.message}`);
                        this.send({
                            id: frame.id,
                            source: 'antigravity',
                            type: 'response',
                            payload: { status: 'error', reason: secErr.message }
                        });
                        return;
                    }
                }
            }
        } catch (e) {
            console.error(`[Gateway]: Failed parsing incoming IPC frame:`, e);
        }
    }

    public send(frame: IPCOutboundFrame) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(frame));
        }
    }
}
