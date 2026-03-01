import { AgentLoop } from '../core/loop';
import { Channel } from '../core/plugin';
export declare class HeartbeatSystem {
    private intervalMs;
    private timer;
    private agent;
    private channel;
    private userId;
    constructor(agent: AgentLoop, channel: Channel, userId: string, intervalMs?: number);
    start(): void;
    stop(): void;
    private tick;
}
//# sourceMappingURL=heartbeat.d.ts.map