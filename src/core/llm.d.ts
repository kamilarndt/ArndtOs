import { Provider, Message, Tool, AssistantMessage } from './plugin';
export declare class HotSwappableLLM implements Provider {
    name: string;
    private activeProvider;
    private providers;
    constructor(initialProvider: Provider);
    registerProvider(provider: Provider): void;
    switchProvider(name: string): void;
    generate(messages: Message[], tools?: Tool[]): Promise<AssistantMessage>;
}
//# sourceMappingURL=llm.d.ts.map