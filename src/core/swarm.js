"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentSwarm = void 0;
const plugin_1 = require("./plugin");
const loop_1 = require("./loop");
class AgentSwarm {
    provider;
    blueprints = new Map();
    activeAgents = new Map();
    constructor(provider) {
        this.provider = provider;
    }
    registerBlueprint(blueprint) {
        this.blueprints.set(blueprint.name, blueprint);
    }
    async spawnAgent(name) {
        const blueprint = this.blueprints.get(name);
        if (!blueprint)
            throw new Error(`Blueprint ${name} not found`);
        const agent = new loop_1.AgentLoop(this.provider, blueprint.tools);
        this.activeAgents.set(name, agent);
        return agent;
    }
    async delegateTask(agentName, task) {
        const agent = this.activeAgents.get(agentName);
        const blueprint = this.blueprints.get(agentName);
        if (!agent || !blueprint)
            throw new Error(`Agent ${agentName} not running`);
        const initialMessages = [
            { role: 'system', content: blueprint.systemPrompt },
            { role: 'user', content: task }
        ];
        return await agent.run(initialMessages);
    }
}
exports.AgentSwarm = AgentSwarm;
//# sourceMappingURL=swarm.js.map