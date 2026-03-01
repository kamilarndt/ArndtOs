import * as chokidar from 'chokidar';
import { GatewayClient } from '../core/gateway';
import * as path from 'path';

export class WorkspaceWatcher {
    private workspacePath: string;
    private gateway: GatewayClient;
    private watcher: chokidar.FSWatcher | null = null;

    constructor(workspacePath: string, gateway: GatewayClient) {
        this.workspacePath = path.resolve(workspacePath);
        this.gateway = gateway;
    }

    public start() {
        console.log(`[Watcher]: Initializing on ${this.workspacePath}`);

        // Watch everything inside workspace, ignore .git or node_modules for performance
        this.watcher = chokidar.watch(this.workspacePath, {
            ignored: /(^|[\/\\])\..|node_modules/, // ignore dotfiles and node_modules
            persistent: true,
            ignoreInitial: true
        });

        this.watcher
            .on('add', (p: string) => this.pushEvent('file_created', p))
            .on('change', (p: string) => this.pushEvent('file_modified', p))
            .on('unlink', (p: string) => this.pushEvent('file_deleted', p));
    }

    private pushEvent(eventName: string, fullPath: string) {
        // We send back a relative path so ZeroClaw knows what's happening
        // strictly inside the workspace.
        const relativePath = path.relative(this.workspacePath, fullPath);
        // Normalize slashes to forward slashes for cross-OS JSON consistency
        const standardizedPath = relativePath.replace(/\\/g, '/');

        console.log(`[Watcher Event]: ${eventName} -> ${standardizedPath}`);

        this.gateway.send({
            source: 'antigravity_watcher',
            type: 'event',
            name: eventName,
            path: standardizedPath
        });
    }

    public stop() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
        }
    }
}
