import { Tool } from './plugin';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export class MCPBridge {
    private endpoint: string;
    private workspaceRoot: string;

    constructor(endpoint: string, workspaceRoot: string = '/workspace_data') {
        this.endpoint = endpoint;
        this.workspaceRoot = path.resolve(workspaceRoot);
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
                // Pozwalamy na chaining i redirections, bo i tak jesteśmy w Dockerze!
                // Kluczowe: Dodajemy obsługę 'cwd', aby uniknąć problemów z 'cd'
                const workingDir = args.target_dir
                    ? path.resolve(this.workspaceRoot, args.target_dir as string)
                    : this.workspaceRoot;

                try {
                    // Zwiększamy timeout i buffer dla npm install / playwright
                    const { stdout, stderr } = await execAsync(cmd, {
                        cwd: workingDir,
                        maxBuffer: 1024 * 1024 * 10, // 10MB
                        shell: '/bin/bash' // Używamy pełnego basha zamiast sh
                    });
                    return { content: [{ type: "text", text: `STDOUT:\n${stdout}\nSTDERR:\n${stderr}` }] };
                } catch (err: any) {
                    return { isError: true, content: [{ type: "text", text: `Błąd: ${err.message}` }] };
                }
            }
        };
    }

    public async listExternalTools(): Promise<Tool[]> {
        return [this.shellTool];
    }

    public async connect() {
        console.log(`[MCP Bridge]: Connected to MCP server at ${this.endpoint}`);
    }
}
