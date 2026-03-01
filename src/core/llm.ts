import { Provider, Message, Tool, AssistantMessage } from './plugin';

export class HotSwappableLLM implements Provider {
    public name = 'hot_swappable_llm';
    private activeProvider: Provider;
    private providers: Map<string, Provider> = new Map();

    constructor(initialProvider: Provider) {
        this.activeProvider = initialProvider;
        this.registerProvider(initialProvider);
    }

    public registerProvider(provider: Provider) {
        this.providers.set(provider.name, provider);
    }

    public switchProvider(name: string) {
        const p = this.providers.get(name);
        if (!p) throw new Error(`Provider ${name} not found`);
        this.activeProvider = p;
        console.log(`Switched to LLM provider: ${name}`);
    }

    public async generate(messages: Message[], tools?: Tool[]): Promise<AssistantMessage> {
        return this.activeProvider.generate(messages, tools);
    }
}
