"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerTools = void 0;
const plugin_1 = require("../core/plugin");
class SchedulerTools {
    tasks = new Map();
    get scheduleTool() {
        return {
            name: 'scheduler_add',
            description: 'Schedule a task using a cron expression',
            parameters: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    expression: { type: 'string', description: 'Cron expression (e.g., "* * * * *")' },
                    command: { type: 'string', description: 'Command or prompt for the agent to run' }
                },
                required: ['id', 'expression', 'command']
            },
            execute: async (args) => {
                if (this.tasks.has(args.id)) {
                    throw new Error(`Task with id ${args.id} already exists`);
                }
                // In a complete implementation, this would use a library like 'node-cron' 
                // to actually execute the task: cron.schedule(args.expression, () => runAgent(args.command))
                this.tasks.set(args.id, {
                    id: args.id,
                    expression: args.expression,
                    command: args.command,
                    active: true
                });
                return { success: true, message: `Task ${args.id} scheduled to run at ${args.expression}` };
            }
        };
    }
    get listTasksTool() {
        return {
            name: 'scheduler_list',
            description: 'List all scheduled tasks',
            parameters: { type: 'object', properties: {} },
            execute: async () => {
                return { tasks: Array.from(this.tasks.values()) };
            }
        };
    }
    get removeTaskTool() {
        return {
            name: 'scheduler_remove',
            description: 'Remove a scheduled task',
            parameters: {
                type: 'object',
                properties: { id: { type: 'string' } },
                required: ['id']
            },
            execute: async (args) => {
                if (!this.tasks.has(args.id))
                    throw new Error(`Task ${args.id} not found`);
                this.tasks.delete(args.id);
                return { success: true, message: `Task ${args.id} deleted` };
            }
        };
    }
}
exports.SchedulerTools = SchedulerTools;
//# sourceMappingURL=scheduler.js.map