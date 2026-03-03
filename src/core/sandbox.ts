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
        // 1. Handle /workspace_data prefix for container compatibility
        let internalPath = targetPath;
        if (targetPath.startsWith('/workspace_data')) {
            const relativePart = targetPath.replace('/workspace_data', '');
            internalPath = path.join(this.workspaceRoot, relativePart);
        }

        // 2. Resolve to an absolute path, basing it off the predefined workspaceRoot.
        const resolvedPath = path.resolve(this.workspaceRoot, internalPath);

        // 3. Security Check (Path Traversal): Ensure the resolved path strictly starts with the workspaceRoot.
        if (!resolvedPath.startsWith(this.workspaceRoot)) {
            throw new Error(`[Security Sandbox] Access Denied: Path Traversal detected on '${targetPath}'.`);
        }

        return resolvedPath;
    }
}
