import { Tool } from '../core/plugin';
export interface ScheduledTask {
    id: string;
    expression: string;
    command: string;
    active: boolean;
}
export declare class SchedulerTools {
    private tasks;
    get scheduleTool(): Tool;
    get listTasksTool(): Tool;
    get removeTaskTool(): Tool;
}
//# sourceMappingURL=scheduler.d.ts.map