"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeartbeatSystem = void 0;
const loop_1 = require("../core/loop");
const plugin_1 = require("../core/plugin");
class HeartbeatSystem {
    intervalMs;
    timer = null;
    agent;
    channel;
    userId;
    constructor(agent, channel, userId, intervalMs = 60000) {
        this.agent = agent;
        this.channel = channel;
        this.userId = userId;
        this.intervalMs = intervalMs;
    }
    start() {
        if (this.timer)
            return;
        this.timer = setInterval(() => this.tick(), this.intervalMs);
        console.log(`Heartbeat system started (interval: ${this.intervalMs}ms)`);
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    async tick() {
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
        }
        catch (e) {
            console.error(`Heartbeat error: ${e.message}`);
        }
    }
}
exports.HeartbeatSystem = HeartbeatSystem;
//# sourceMappingURL=heartbeat.js.map