import { Message } from '../core/plugin';
export declare class ContextPruning {
    private maxTokens;
    constructor(maxTokens?: number);
    /**
     * Extremely simple heuristic token estimator.
     * In a real application, use a tokenizer like 'tiktoken'.
     */
    private estimateTokens;
    prune(messages: Message[]): Promise<Message[]>;
}
//# sourceMappingURL=pruning.d.ts.map