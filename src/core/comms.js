"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentComms = void 0;
const plugin_1 = require("./plugin");
class AgentComms {
    memory;
    constructor(memory) {
        this.memory = memory;
    }
    get sessionsListTool() {
        return {
            name: 'sessions_list',
            description: 'List all active background agent sessions',
            parameters: { type: 'object', properties: {} },
            execute: async () => {
                // In a full implementation, this would query a SessionManager
                return { sessions: ['main', 'researcher_1', 'coder_1'] };
            }
        };
    }
    get sessionsHistoryTool() {
        return {
            name: 'sessions_history',
            description: 'Get message history for a specific session',
            parameters: {
                type: 'object',
                properties: {
                    sessionId: { type: 'string' },
                    limit: { type: 'number' }
                },
                required: ['sessionId']
            },
            execute: async (args) => {
                return await this.memory.getMessages(args.sessionId, args.limit || 50);
            }
        };
    }
    get sessionsSendTool() {
        return {
            name: 'sessions_send',
            description: 'Send a message to another agent session',
            parameters: {
                type: 'object',
                properties: {
                    sessionId: { type: 'string' },
                    message: { type: 'string' }
                },
                required: ['sessionId', 'message']
            },
            execute: async (args) => {
                await this.memory.addMessage(args.sessionId, { role: 'user', content: args.message });
                return { success: true, message: `Message sent to ${args.sessionId}` };
            }
        };
    }
}
exports.AgentComms = AgentComms;
//# sourceMappingURL=comms.js.map