"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartRecommendations = void 0;
const loop_1 = require("../core/loop");
const graph_1 = require("../memory/graph");
class SmartRecommendations {
    graph;
    agent;
    constructor(agent, graph) {
        this.agent = agent;
        this.graph = graph;
    }
    async generateRecommendations(sessionId) {
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
                if (Array.isArray(result))
                    return result;
            }
            catch {
                // Fallback if the agent didn't return valid JSON
                return [lastMessage.content];
            }
        }
        return [];
    }
}
exports.SmartRecommendations = SmartRecommendations;
//# sourceMappingURL=recommendations.js.map