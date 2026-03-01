import { Tool } from './plugin';
export declare class MCPBridge {
    private endpoint;
    constructor(endpoint: string);
    listExternalTools(): Promise<Tool[]>;
    connect(): Promise<void>;
}
//# sourceMappingURL=mcp.d.ts.map