import { Provider, Tool, Message } from './plugin';
export declare class AgentLoop {
    private provider;
    private tools;
    private maxIterations;
    constructor(provider: Provider, tools: Tool[], maxIterations?: number);
    run(messages: Message[]): Promise<Message[]>;
}
//# sourceMappingURL=loop.d.ts.map