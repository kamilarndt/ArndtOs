import * as fs from 'fs';
import * as path from 'path';
import { Tool } from '../core/plugin';

export class FileSystemTools {
    private allowedRoot: string;
    private maxFileSize: number;

    constructor(allowedRoot: string, maxFileSizeMb: number = 10) {
        this.allowedRoot = path.resolve(allowedRoot);
        this.maxFileSize = maxFileSizeMb * 1024 * 1024;
    }

    private isAllowed(targetPath: string): boolean {
        const resolvedPath = path.resolve(targetPath);
        return resolvedPath.startsWith(this.allowedRoot);
    }

    public get readFileTool(): Tool {
        return {
            name: 'fs_read',
            description: 'Read contents of a file',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path']
            },
            execute: async (args: any) => {
                if (!this.isAllowed(args.path)) throw new Error('Path not allowed');
                const stats = await fs.promises.stat(args.path);
                if (stats.size > this.maxFileSize) throw new Error('File too large');
                return await fs.promises.readFile(args.path, 'utf8');
            }
        };
    }

    public get writeFileTool(): Tool {
        return {
            name: 'fs_write',
            description: 'Write contents to a file (creates or overwrites)',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' }, content: { type: 'string' } },
                required: ['path', 'content']
            },
            execute: async (args: any) => {
                if (!this.isAllowed(args.path)) throw new Error('Path not allowed');
                if (Buffer.byteLength(args.content, 'utf8') > this.maxFileSize) throw new Error('Content too large');
                await fs.promises.mkdir(path.dirname(args.path), { recursive: true });
                await fs.promises.writeFile(args.path, args.content, 'utf8');
                return { success: true };
            }
        };
    }

    public get deleteFileTool(): Tool {
        return {
            name: 'fs_delete',
            description: 'Delete a file',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path']
            },
            execute: async (args: any) => {
                if (!this.isAllowed(args.path)) throw new Error('Path not allowed');
                await fs.promises.unlink(args.path);
                return { success: true };
            }
        };
    }

    public get listFilesTool(): Tool {
        return {
            name: 'fs_list',
            description: 'List files in a directory',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path']
            },
            execute: async (args: any) => {
                if (!this.isAllowed(args.path)) throw new Error('Path not allowed');
                const files = await fs.promises.readdir(args.path, { withFileTypes: true });
                return files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
            }
        };
    }
}
