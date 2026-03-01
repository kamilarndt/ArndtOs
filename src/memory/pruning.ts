import { Message } from '../core/plugin';

export class ContextPruning {
    private maxTokens: number;

    constructor(maxTokens: number = 4000) {
        this.maxTokens = maxTokens;
    }

    /**
     * Extremely simple heuristic token estimator.
     * In a real application, use a tokenizer like 'tiktoken'.
     */
    private estimateTokens(text: string): number {
        return Math.ceil(text.length / 4);
    }

    public async prune(messages: Message[]): Promise<Message[]> {
        let totalTokens = messages.reduce((acc, msg) => acc + this.estimateTokens(msg.content || ''), 0);

        if (totalTokens <= this.maxTokens) {
            return messages;
        }

        console.log(`Token limit exceeded (${totalTokens} > ${this.maxTokens}). Pruning context...`);

        // Strategy: Keep system prompt, summarize the middle, keep the latest N messages.
        // For MVP, we'll just drop older user/assistant messages until we fit.

        const systemMessages = messages.filter(m => m.role === 'system');
        let keepMessages = messages.filter(m => m.role !== 'system');

        while (totalTokens > this.maxTokens && keepMessages.length > 2) {
            const dropped = keepMessages.shift();
            if (dropped) {
                totalTokens -= this.estimateTokens(dropped.content || '');
            }
        }

        // Insert a summarization pseudo-message
        keepMessages.unshift({
            role: 'system',
            content: '[System: Older messages were summarized/dropped for context limits]'
        } as any);

        return [...systemMessages, ...keepMessages];
    }
}
