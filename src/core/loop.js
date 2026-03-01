"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoop = void 0;
const plugin_1 = require("./plugin");
class AgentLoop {
    provider;
    tools;
    maxIterations;
    constructor(provider, tools, maxIterations = 10) {
        this.provider = provider;
        this.tools = tools;
        this.maxIterations = maxIterations;
    }
    async run(messages) {
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
                let result;
                if (!tool) {
                    result = `Error: Tool ${toolCall.function.name} not found.`;
                }
                else {
                    try {
                        const args = JSON.parse(toolCall.function.arguments);
                        const rawResult = await tool.execute(args);
                        result = typeof rawResult === 'string' ? rawResult : JSON.stringify(rawResult);
                    }
                    catch (e) {
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
exports.AgentLoop = AgentLoop;
//# sourceMappingURL=loop.js.map