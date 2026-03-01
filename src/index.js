"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = require("./core/plugin");
const loop_1 = require("./core/loop");
const swarm_1 = require("./core/swarm");
const comms_1 = require("./core/comms");
const fs_1 = require("./tools/fs");
const browser_1 = require("./tools/browser");
const search_1 = require("./tools/search");
const scheduler_1 = require("./tools/scheduler");
const graph_1 = require("./memory/graph");
const pruning_1 = require("./memory/pruning");
const evolving_1 = require("./memory/evolving");
const heartbeat_1 = require("./proactive/heartbeat");
const recommendations_1 = require("./proactive/recommendations");
const sqlite_1 = require("./memory/sqlite");
const llm_1 = require("./core/llm");
const mcp_1 = require("./core/mcp");
async function main() {
    console.log('ArndtOs Starting...');
    // 1. Memory base
    const sqliteMemory = new sqlite_1.SqliteMemory(':memory:');
    await sqliteMemory.initialize();
    // 1.5 Advanced Memory
    const graph = new graph_1.KnowledgeGraph();
    const pruning = new pruning_1.ContextPruning();
    const evolvingMemory = new evolving_1.SelfEvolvingMemory(graph);
    // 2. LLM Provider (Hot Swappable mock)
    const mockProvider = {
        name: 'mock',
        generate: async (messages, tools) => {
            return { role: 'assistant', content: 'Mock response' };
        }
    };
    const llm = new llm_1.HotSwappableLLM(mockProvider);
    // 3. MCP Bridge
    const mcp = new mcp_1.MCPBridge('http://localhost:8000/mcp');
    await mcp.connect();
    // 4. Tools
    const fsTools = new fs_1.FileSystemTools('./', 10);
    const browserTools = new browser_1.BrowserTools();
    const searchTool = new search_1.WebSearchTool();
    const schedulerTools = new scheduler_1.SchedulerTools();
    const commsTools = new comms_1.AgentComms(sqliteMemory);
    const allTools = [
        fsTools.readFileTool, fsTools.writeFileTool, fsTools.deleteFileTool, fsTools.listFilesTool,
        browserTools.navigateTool, browserTools.extractTool, browserTools.clickTool, browserTools.typeTool, browserTools.screenshotTool,
        searchTool.searchTool,
        schedulerTools.scheduleTool, schedulerTools.listTasksTool, schedulerTools.removeTaskTool,
        commsTools.sessionsListTool, commsTools.sessionsHistoryTool, commsTools.sessionsSendTool
    ];
    // 5. Agent Architecture
    const mainAgent = new loop_1.AgentLoop(llm, allTools, 10);
    const swarm = new swarm_1.AgentSwarm(llm);
    // 6. Proactive Behavior
    // (Mock channel)
    const mockChannel = {
        name: 'cli',
        start: async () => { },
        stop: async () => { },
        sendMessage: async (u, t) => { console.log(`[Message to ${u}]: ${t}`); },
        onMessage: () => { }
    };
    const heartbeat = new heartbeat_1.HeartbeatSystem(mainAgent, mockChannel, 'user_1', 60000);
    const recommendations = new recommendations_1.SmartRecommendations(mainAgent, graph);
    // Wire into config for export/reference
    const config = {
        provider: llm,
        channel: mockChannel,
        memory: sqliteMemory,
        tools: allTools
    };
    console.log(`ArndtOs initialized with ${allTools.length} tools.`);
    console.log('All systems wired and ready!');
}
main().catch(console.error);
//# sourceMappingURL=index.js.map