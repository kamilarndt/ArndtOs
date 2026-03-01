import * as path from 'path';

export class WorkspaceSandbox {
    public workspaceRoot: string;

    constructor(workspaceRoot: string) {
        this.workspaceRoot = path.resolve(workspaceRoot);
    }

    /**
     * Normalizes an incoming target path and verifies it does not escape the workspace root.
     * Throws an error if Path Traversal is detected.
     * 
     * @param targetPath The raw path provided by the IPC/JSON payload (e.g., "memory/brain.db" or "../../etc/passwd")
     * @returns The safe, absolute path.
     */
    public getSafePath(targetPath: string): string {
        // 1. Resolve to an absolute path, basing it off the predefined workspaceRoot.
        // If targetPath is already absolute (e.g. /etc/passwd), path.resolve gracefully handles it, 
        // but we will catch it in step 2.
        const resolvedPath = path.resolve(this.workspaceRoot, targetPath);

        // 2. Security Check (Path Traversal): Ensure the resolved path strictly starts with the workspaceRoot.
        // For Windows compatibility, we also normalize slashes or rely on path module.
        if (!resolvedPath.startsWith(this.workspaceRoot)) {
            throw new Error(`[Security Sandbox] Access Denied: Path Traversal detected on '${targetPath}'.`);
        }

        return resolvedPath;
    }
}
