"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HotSwappableLLM = void 0;
const plugin_1 = require("./plugin");
class HotSwappableLLM {
    name = 'hot_swappable_llm';
    activeProvider;
    providers = new Map();
    constructor(initialProvider) {
        this.activeProvider = initialProvider;
        this.registerProvider(initialProvider);
    }
    registerProvider(provider) {
        this.providers.set(provider.name, provider);
    }
    switchProvider(name) {
        const p = this.providers.get(name);
        if (!p)
            throw new Error(`Provider ${name} not found`);
        this.activeProvider = p;
        console.log(`Switched to LLM provider: ${name}`);
    }
    async generate(messages, tools) {
        return this.activeProvider.generate(messages, tools);
    }
}
exports.HotSwappableLLM = HotSwappableLLM;
//# sourceMappingURL=llm.js.map