import { Tool, Memory } from './plugin';
export declare class AgentComms {
    private memory;
    constructor(memory: Memory);
    get sessionsListTool(): Tool;
    get sessionsHistoryTool(): Tool;
    get sessionsSendTool(): Tool;
}
//# sourceMappingURL=comms.d.ts.map