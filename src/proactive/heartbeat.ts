import { AgentLoop } from '../core/loop';
import { Channel } from '../core/plugin';

export class HeartbeatSystem {
    private intervalMs: number;
    private timer: NodeJS.Timeout | null = null;
    private agent: AgentLoop;
    private channel: Channel;
    private userId: string;

    constructor(agent: AgentLoop, channel: Channel, userId: string, intervalMs: number = 60000) {
        this.agent = agent;
        this.channel = channel;
        this.userId = userId;
        this.intervalMs = intervalMs;
    }

    public start() {
        if (this.timer) return;
        this.timer = setInterval(() => this.tick(), this.intervalMs);
        console.log(`Heartbeat system started (interval: ${this.intervalMs}ms)`);
    }

    public stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private async tick() {
        try {
            const messages = await this.agent.run([
                { role: 'system', content: 'Heartbeat tick: Analyze the system state. If there is a noteworthy event or proactive action required, return a message to send to the user. Otherwise, return only the word null.' }
            ]);

            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.role === 'assistant') {
                const text = lastMessage.content.trim();
                if (text && text.toLowerCase() !== 'null') {
                    await this.channel.sendMessage(this.userId, `[Proactive Alert] ${text}`);
                }
            }
        } catch (e: any) {
            console.error(`Heartbeat error: ${e.message}`);
        }
    }
}
