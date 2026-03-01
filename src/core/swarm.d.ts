import { Provider, Tool, Message } from './plugin';
import { AgentLoop } from './loop';
export interface AgentBlueprint {
    name: string;
    role: string;
    systemPrompt: string;
    tools: Tool[];
}
export declare class AgentSwarm {
    private provider;
    private blueprints;
    private activeAgents;
    constructor(provider: Provider);
    registerBlueprint(blueprint: AgentBlueprint): void;
    spawnAgent(name: string): Promise<AgentLoop>;
    delegateTask(agentName: string, task: string): Promise<Message[]>;
}
//# sourceMappingURL=swarm.d.ts.map