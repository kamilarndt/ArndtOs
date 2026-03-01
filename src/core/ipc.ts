export type IPCPayload = {
    tool: string;
    target_path?: string;
    parameters: Record<string, any>;
};

export type IPCOutboundFrame = {
    id?: string;
    source: string;
    type: 'ping' | 'pong' | 'event' | 'response';
    name?: string;     // For events (e.g., 'file_created')
    path?: string;     // For events
    action?: string;
    payload?: any;
};

export type IPCInboundFrame = {
    id: string;
    source: string;
    type: 'command' | 'ping';
    action?: string;
    sandbox_context?: string;
    payload?: IPCPayload;
};
