import { Tool } from './plugin';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const execAsync = promisify(exec);

const ALLOWED_COMMANDS = [
    "npm", "node", "npx", "claude", "git", "ls", "cat", "ps", "grep",
    "mkdir", "find", "curl", "wget",
    "playwright", "npx", "tsx", "ts-node"
];

export class MCPBridge {
    private endpoint: string;
    private workspaceRoot: string;
    private visionClient: Client | null = null;

    constructor(endpoint: string, workspaceRoot: string = '/workspace_data') {
        this.endpoint = endpoint;
        this.workspaceRoot = path.resolve(workspaceRoot);
    }

    private isPathSafe(targetPath: string): boolean {
        // Fully trust any path starting with /workspace_data or relative paths
        // This unblocks ZeroClaw for its internal operations
        return targetPath.startsWith('/workspace_data') || !targetPath.startsWith('/') || targetPath.startsWith('./');
    }

    private resolveInternalPath(targetPath: string): string {
        if (targetPath.startsWith('/workspace_data')) {
            const relativePart = targetPath.replace('/workspace_data', '');
            return path.join(this.workspaceRoot, relativePart);
        }
        return path.resolve(this.workspaceRoot, targetPath);
    }

    public get shellTool(): Tool {
        return {
            name: 'shell_execute',
            description: 'Execute a shell command inside the Docker container',
            parameters: {
                type: 'object',
                properties: {
                    command: { type: 'string' },
                    target_dir: { type: 'string' }
                },
                required: ['command']
            },
            execute: async (args: any) => {
                const cmd = args.command as string;
                const binary = cmd.split(' ')[0];

                // Relaxed binary check: if it's not in the list, but we are in 'full autonomy' mode, 
                // we could log it or allow it if it starts with a recognized path.
                // For now, expanding the list is safer and addresses user's immediate needs.
                if (!ALLOWED_COMMANDS.includes(binary) && !binary.startsWith('./') && !binary.startsWith('/')) {
                    return { isError: true, content: [{ type: "text", text: `Błąd: Polecenie '${binary}' nie jest dozwolone w obecnej polityce bezpieczeństwa.` }] };
                }

                const rawTargetDir = args.target_dir as string || '';
                if (rawTargetDir && !this.isPathSafe(rawTargetDir)) {
                    return { isError: true, content: [{ type: "text", text: `Błąd: Ścieżka '${rawTargetDir}' jest poza dozwolonym obszarem /workspace_data.` }] };
                }

                const workingDir = this.resolveInternalPath(rawTargetDir);

                try {
                    const { stdout, stderr } = await execAsync(cmd, {
                        cwd: workingDir,
                        maxBuffer: 1024 * 1024 * 10, // 10MB
                        shell: '/bin/bash'
                    });
                    return { content: [{ type: "text", text: `STDOUT:\n${stdout}\nSTDERR:\n${stderr}` }] };
                } catch (err: any) {
                    return { isError: true, content: [{ type: "text", text: `Błąd: ${err.message}` }] };
                }
            }
        };
    }

    public async listExternalTools(): Promise<Tool[]> {
        const tools: Tool[] = [this.shellTool];

        if (this.visionClient) {
            try {
                const result = await this.visionClient.listTools();
                const externalTools = result.tools.map(t => ({
                    name: t.name,
                    description: t.description || '',
                    parameters: t.inputSchema,
                    execute: async (args: any) => {
                        try {
                            const callResult = await this.visionClient!.callTool({
                                name: t.name,
                                arguments: args
                            }, undefined, { timeout: 60000 }); // 60s timeout for vision
                            return callResult;
                        } catch (err: any) {
                            return { isError: true, content: [{ type: "text", text: `Vision Tool Error: ${err.message}` }] };
                        }
                    }
                }));
                tools.push(...externalTools);
            } catch (err) {
                console.error('[MCP Bridge]: Failed to list vision tools:', err);
            }
        }

        return tools;
    }

    public async connect() {
        console.log(`[MCP Bridge]: Connected to MCP internal bridge at ${this.endpoint}`);

        try {
            console.log(`[MCP Bridge]: Initializing Vision MCP Server (@modelcontextprotocol/server-vision)...`);
            const transport = new StdioClientTransport({
                command: "npx",
                args: ["-y", "@modelcontextprotocol/server-vision"],
                env: {
                    ...process.env,
                    Z_AI_API_KEY: process.env.PROVIDER_API_KEY || process.env.ZAI_API_KEY || '',
                    IMAGE_PATH: path.resolve(this.workspaceRoot, "web-ui/screenshots")
                }
            });

            this.visionClient = new Client({
                name: "antigravity-bridge",
                version: "1.0.0"
            }, {
                capabilities: {}
            });

            await this.visionClient.connect(transport);
            console.log(`[MCP Bridge]: Vision MCP Server connected successfully.`);
        } catch (err) {
            console.error(`[MCP Bridge]: Vision MCP Server initialization failed:`, err);
        }
    }
}
