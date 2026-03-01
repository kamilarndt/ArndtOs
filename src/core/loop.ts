import { Provider, Tool, Message } from './plugin';

export class AgentLoop {
    private provider: Provider;
    private tools: Tool[];
    private maxIterations: number;

    constructor(provider: Provider, tools: Tool[], maxIterations: number = 10) {
        this.provider = provider;
        this.tools = tools;
        this.maxIterations = maxIterations;
    }

    async run(messages: Message[]): Promise<Message[]> {
        let currentMessages = [...messages];
        let iterations = 0;

        while (iterations < this.maxIterations) {
            const response = await this.provider.generate(currentMessages, this.tools);
            currentMessages.push(response);

            if (!response.tool_calls || response.tool_calls.length === 0) {
                break; // Final response reached
            }

            for (const toolCall of response.tool_calls) {
                const tool = this.tools.find(t => t.name === toolCall.function.name);
                let result: string;

                if (!tool) {
                    result = `Error: Tool ${toolCall.function.name} not found.`;
                } else {
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const rawResult = await tool.execute(args);
                        result = typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult);
                    } catch (e: any) {
                        result = `Error executing tool: ${e.message}`;
                    }
                }

                currentMessages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    content: result
                });
            }

            iterations++;
        }

        if (iterations >= this.maxIterations) {
            currentMessages.push({
                role: 'system',
                content: `Warning: Reached max iterations (${this.maxIterations}) without a final response.`
            });
        }

        return currentMessages;
    }
}
