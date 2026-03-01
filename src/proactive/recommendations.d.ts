import { AgentLoop } from '../core/loop';
import { KnowledgeGraph } from '../memory/graph';
export declare class SmartRecommendations {
    private graph;
    private agent;
    constructor(agent: AgentLoop, graph: KnowledgeGraph);
    generateRecommendations(sessionId: string): Promise<string[]>;
}
//# sourceMappingURL=recommendations.d.ts.map