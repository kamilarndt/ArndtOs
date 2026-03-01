import { WorkspaceSandbox } from './core/sandbox';
import { GatewayClient } from './core/gateway';
import { WorkspaceWatcher } from './proactive/watcher';
import * as path from 'path';

async function main() {
    console.log('Antigravity Node.js Worker Starting...');

    // 1. Setup Sandbox
    const workspaceRoot = path.resolve(__dirname, '../../workspace');
    console.log(`[Init]: Securing Node.js root sandbox to: ${workspaceRoot}`);
    const sandbox = new WorkspaceSandbox(workspaceRoot);

    // 2. Extract Authorization pairing code from environment or config
    // In a real scenario, this would import from the TOML / ENV
    const PAIRED_TOKEN = "69de5c34fedf3af12b50ce084530b8e6871c3158ea9340bac70f9a1cb0660a98";

    // 3. Connect the Gateway (WebSocket)
    const gatewayUrl = 'ws://127.0.0.1:42617/ws/chat';
    const gateway = new GatewayClient(gatewayUrl, PAIRED_TOKEN, sandbox);
    gateway.connect();

    // 4. Start the Proactive File Watcher
    const watcher = new WorkspaceWatcher(workspaceRoot, gateway);
    watcher.start();

    console.log('Antigravity Worker initialized and watching for IPC connections.');
}

main().catch(console.error);
