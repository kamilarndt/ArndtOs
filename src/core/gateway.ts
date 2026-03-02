import WebSocket from 'ws';
import { WorkspaceSandbox } from './sandbox';
import { IPCInboundFrame, IPCOutboundFrame } from './ipc';
import { Tool } from './plugin';

export class GatewayClient {
    private endpoint: string;
    private pairingCode: string;
    private ws: WebSocket | null = null;
    private sandbox: WorkspaceSandbox;
    private tools: Tool[];

    constructor(endpoint: string, pairingCode: string, sandbox: WorkspaceSandbox, tools: Tool[] = []) {
        this.endpoint = endpoint;
        this.pairingCode = pairingCode;
        this.sandbox = sandbox;
        this.tools = tools;
    }

    public connect() {
        console.log(`[Gateway]: Connecting to ${this.endpoint}...`);
        this.ws = new WebSocket(this.endpoint, {
            headers: {
                'Authorization': `Bearer ${this.pairingCode}`
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
                const toolName = frame.payload.tool;
                console.log(`[Gateway]: Received Task ${frame.id} -> Tool: ${toolName}`);

                const tool = this.tools.find(t => t.name === toolName);
                if (!tool) {
                    console.error(`[Gateway]: Tool ${toolName} not found!`);
                    this.send({
                        id: frame.id,
                        source: 'antigravity',
                        type: 'response',
                        payload: { status: 'error', reason: `Tool ${toolName} not found` }
                    });
                    return;
                }

                try {
                    // Normalize parameters and handle optional target_path
                    const args = { ...frame.payload.parameters };
                    if (frame.payload.target_path) {
                        const safePath = this.sandbox.getSafePath(frame.payload.target_path);
                        args.target_path = safePath;
                    }

                    console.log(`[Gateway]: Executing ${toolName}...`);
                    const result = await tool.execute(args);

                    this.send({
                        id: frame.id,
                        source: 'antigravity',
                        type: 'response',
                        payload: { status: 'success', detail: result }
                    });

                } catch (execErr: any) {
                    console.error(`[Gateway]: Execution failed: ${execErr.message}`);
                    this.send({
                        id: frame.id,
                        source: 'antigravity',
                        type: 'response',
                        payload: { status: 'error', reason: execErr.message }
                    });
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
