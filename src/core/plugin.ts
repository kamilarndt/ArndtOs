export interface SystemMessage {
    role: 'system';
    content: string;
}

export interface UserMessage {
    role: 'user';
    content: string;
}

export interface AssistantMessage {
    role: 'assistant';
    content: string;
    tool_calls?: Array<{
        id: string;
        type: 'function';
        function: { name: string; arguments: string };
    }>;
}

export interface ToolMessage {
    role: 'tool';
    tool_call_id: string;
    content: string;
}

export type Message = SystemMessage | UserMessage | AssistantMessage | ToolMessage;

export interface Provider {
    name: string;
    generate(messages: Message[], tools?: Tool[]): Promise<AssistantMessage>;
}

export interface Channel {
    name: string;
    start(onMessage: (userId: string, text: string) => Promise<void>): Promise<void>;
    stop(): Promise<void>;
    sendMessage(userId: string, text: string): Promise<void>;
}

export interface Tool {
    name: string;
    description: string;
    parameters: any; // JSON Schema representing the tool parameters
    execute(args: any): Promise<any>;
}

export interface Memory {
    name: string;
    initialize(): Promise<void>;
    addMessage(sessionId: string, message: Message): Promise<void>;
    getMessages(sessionId: string, limit?: number): Promise<Message[]>;
    clearSession(sessionId: string): Promise<void>;
}

export interface PluginConfig {
    provider: Provider;
    channel: Channel;
    memory: Memory;
    tools: Tool[];
}
