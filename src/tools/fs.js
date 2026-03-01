"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSystemTools = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const plugin_1 = require("../core/plugin");
class FileSystemTools {
    allowedRoot;
    maxFileSize;
    constructor(allowedRoot, maxFileSizeMb = 10) {
        this.allowedRoot = path.resolve(allowedRoot);
        this.maxFileSize = maxFileSizeMb * 1024 * 1024;
    }
    isAllowed(targetPath) {
        const resolvedPath = path.resolve(targetPath);
        return resolvedPath.startsWith(this.allowedRoot);
    }
    get readFileTool() {
        return {
            name: 'fs_read',
            description: 'Read contents of a file',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path']
            },
            execute: async (args) => {
                if (!this.isAllowed(args.path))
                    throw new Error('Path not allowed');
                const stats = await fs.promises.stat(args.path);
                if (stats.size > this.maxFileSize)
                    throw new Error('File too large');
                return await fs.promises.readFile(args.path, 'utf8');
            }
        };
    }
    get writeFileTool() {
        return {
            name: 'fs_write',
            description: 'Write contents to a file (creates or overwrites)',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' }, content: { type: 'string' } },
                required: ['path', 'content']
            },
            execute: async (args) => {
                if (!this.isAllowed(args.path))
                    throw new Error('Path not allowed');
                if (Buffer.byteLength(args.content, 'utf8') > this.maxFileSize)
                    throw new Error('Content too large');
                await fs.promises.mkdir(path.dirname(args.path), { recursive: true });
                await fs.promises.writeFile(args.path, args.content, 'utf8');
                return { success: true };
            }
        };
    }
    get deleteFileTool() {
        return {
            name: 'fs_delete',
            description: 'Delete a file',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path']
            },
            execute: async (args) => {
                if (!this.isAllowed(args.path))
                    throw new Error('Path not allowed');
                await fs.promises.unlink(args.path);
                return { success: true };
            }
        };
    }
    get listFilesTool() {
        return {
            name: 'fs_list',
            description: 'List files in a directory',
            parameters: {
                type: 'object',
                properties: { path: { type: 'string' } },
                required: ['path']
            },
            execute: async (args) => {
                if (!this.isAllowed(args.path))
                    throw new Error('Path not allowed');
                const files = await fs.promises.readdir(args.path, { withFileTypes: true });
                return files.map(f => ({ name: f.name, isDirectory: f.isDirectory() }));
            }
        };
    }
}
exports.FileSystemTools = FileSystemTools;
//# sourceMappingURL=fs.js.map