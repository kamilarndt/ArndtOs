import { KnowledgeGraph } from './graph';
export declare class SelfEvolvingMemory {
    private graph;
    private accessLog;
    constructor(graph: KnowledgeGraph);
    trackAccess(nodeId: string): void;
    evolve(decayThreshold?: number, mergeThreshold?: number): Promise<{
        success: boolean;
    }>;
}
//# sourceMappingURL=evolving.d.ts.map