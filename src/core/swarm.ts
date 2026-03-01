import { Provider, Tool, Message } from './plugin';
import { AgentLoop } from './loop';

export interface AgentBlueprint {
    name: string;
    role: string;
    systemPrompt: string;
    tools: Tool[];
}

export class AgentSwarm {
    private provider: Provider;
    private blueprints: Map<string, AgentBlueprint> = new Map();
    private activeAgents: Map<string, AgentLoop> = new Map();

    constructor(provider: Provider) {
        this.provider = provider;
    }

    registerBlueprint(blueprint: AgentBlueprint) {
        this.blueprints.set(blueprint.name, blueprint);
    }

    async spawnAgent(name: string): Promise<AgentLoop> {
        const blueprint = this.blueprints.get(name);
        if (!blueprint) throw new Error(`Blueprint ${name} not found`);

        const agent = new AgentLoop(this.provider, blueprint.tools);
        this.activeAgents.set(name, agent);
        return agent;
    }

    async delegateTask(agentName: string, task: string): Promise<Message[]> {
        const agent = this.activeAgents.get(agentName);
        const blueprint = this.blueprints.get(agentName);
        if (!agent || !blueprint) throw new Error(`Agent ${agentName} not running`);

        const initialMessages: Message[] = [
            { role: 'system', content: blueprint.systemPrompt },
            { role: 'user', content: task }
        ];

        return await agent.run(initialMessages);
    }
}
