import { AgentLoop } from '../core/loop';
import { KnowledgeGraph } from '../memory/graph';

export class SmartRecommendations {
    private graph: KnowledgeGraph;
    private agent: AgentLoop;

    constructor(agent: AgentLoop, graph: KnowledgeGraph) {
        this.agent = agent;
        this.graph = graph;
    }

    public async generateRecommendations(sessionId: string): Promise<string[]> {
        // 1. Traverse recent user interactions from the graph memory
        const recentNodes = this.graph.traverse(`session:${sessionId}`, 1);
        const contextStr = recentNodes.map(n => n.label).join(', ');

        // 2. Ask the agent to generate smart recommendations based on current context
        const response = await this.agent.run([{
            role: 'system',
            content: `Analyze the user's recent access patterns and context: [${contextStr}]. Suggest 3 proactive actions the user might want to take next. Return strictly as a JSON array of strings.`
        }]);

        const lastMessage = response[response.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
            try {
                const result = JSON.parse(lastMessage.content);
                if (Array.isArray(result)) return result;
            } catch {
                // Fallback if the agent didn't return valid JSON
                return [lastMessage.content];
            }
        }
        return [];
    }
}
